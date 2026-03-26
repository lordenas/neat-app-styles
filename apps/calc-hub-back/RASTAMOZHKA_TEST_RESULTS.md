# Rastamozhka Auto Calculator - Test Results
**Website:** https://calcus.ru/rastamozhka-auto  
**Test Date:** March 13, 2026  
**EUR Exchange Rate:** 1 EUR = 91.3893 ₽ (auto-provided by site, not configurable)

## Test Results Table

| Scenario | Customs Fee (₽) | Duty (₽) | Recycling Fee (₽) | Excise (₽) | VAT (₽) | Total (₽) |
|----------|----------------|----------|-------------------|------------|---------|-----------|
| **A_phys_petrol_3_5** | 13,541.00 | 493,502.22 | 5,200.00 | 0.00 | 0.00 | **512,243.22** |
| **B_legal_petrol_new** | 13,541.00 | 274,167.90 | 800,800.00 | 7,680.00 | 464,119.46 | **1,560,308.36** |
| **C_phys_electric_new_hp70** | 18,465.00 | 411,251.85 | 3,400.00 | 0.00 | 693,644.79 | **1,126,761.64** |
| **D_phys_electric_new_hp150** | 18,465.00 | 411,251.85 | 1,560,000.00 | 9,600.00 | 695,756.79 | **2,695,073.64** |
| **E_legal_diesel_7plus** | 4,924.00 | 760,358.98 | 3,456,000.00 | 110,340.00 | 432,821.53 | **4,764,444.51** |
| **F_phys_hybrid_parallel_1_3** | 13,541.00 | 1,005,282.30 | 3,400.00 | 0.00 | 0.00 | **1,022,223.30** |

## Scenario Details

### A_phys_petrol_3_5
- **Importer:** Individual (personal use) - Физическое лицо (для личного использования)
- **Age:** 3-5 years
- **Engine:** Petrol (Бензиновый)
- **Power:** 150 hp
- **Volume:** 2000 cm³
- **Price:** 25,000 EUR

### B_legal_petrol_new
- **Importer:** Legal entity - Юридическое лицо
- **Age:** Up to 3 years
- **Engine:** Petrol (Бензиновый)
- **Power:** 120 hp
- **Volume:** 1600 cm³
- **Price:** 20,000 EUR

### C_phys_electric_new_hp70
- **Importer:** Individual (personal use) - Физическое лицо (для личного использования)
- **Age:** Up to 3 years
- **Engine:** Electric (Электрический)
- **Power:** 70 hp
- **Volume:** N/A (field disabled for electric vehicles)
- **Price:** 30,000 EUR

### D_phys_electric_new_hp150
- **Importer:** Individual (personal use) - Физическое лицо (для личного использования)
- **Age:** Up to 3 years
- **Engine:** Electric (Электрический)
- **Power:** 150 hp
- **Volume:** N/A (field disabled for electric vehicles)
- **Price:** 30,000 EUR

### E_legal_diesel_7plus
- **Importer:** Legal entity - Юридическое лицо
- **Age:** >7 years
- **Engine:** Diesel (Дизельный)
- **Power:** 180 hp
- **Volume:** 2600 cm³
- **Price:** 12,000 EUR

### F_phys_hybrid_parallel_1_3
- **Importer:** Individual (personal use) - Физическое лицо (для личного использования)
- **Age:** Up to 3 years
- **Engine:** Parallel hybrid (Параллельный гибрид)
- **Power:** 100 hp
- **Volume:** 2000 cm³
- **Price:** 18,000 EUR

## Key Findings & Blockers

### EUR Exchange Rate
- **Status:** ❌ NOT CONFIGURABLE
- **Auto-provided rate:** 1 EUR = 91.3893 ₽
- **Note:** The website automatically provides the exchange rate and does not allow manual override. The rate is displayed in the currency dropdown area as "1 EUR = 91.3893 ₽"

### Volume Field for Electric Vehicles
- **Finding:** The volume/displacement field (`input[name="value"]`) is automatically **disabled** for electric vehicles
- **Impact:** This is expected behavior as electric vehicles don't have engine displacement
- **Scenarios affected:** C, D (both electric)

### Tax Structure Observations

#### Individual (Personal Use) Importers:
- **Excise = 0.00** for all scenarios (A, C, D, F)
- **VAT = 0.00** for petrol (A) and hybrid (F)
- **VAT is charged** for electric vehicles (C, D) even for personal use

#### Legal Entity Importers:
- **Full tax burden:** Customs fee + Duty + Recycling fee + Excise + VAT
- Significantly higher total costs (B: 1.56M ₽, E: 4.76M ₽)

#### Age Impact:
- Older vehicles (>7 years) have **dramatically higher recycling fees**
- Example: E_legal_diesel_7plus has recycling fee of 3,456,000 ₽ vs B_legal_petrol_new at 800,800 ₽

## Hybrid Vehicle Behavior Analysis

### Parallel Hybrid Treatment (Scenario F)
Based on the observed output for **F_phys_hybrid_parallel_1_3**:

**Tax behavior resembles DVS (Internal Combustion Engine) with modifications:**
- ✅ Volume field is **enabled** (2000 cm³ was accepted) - like DVS vehicles
- ✅ Excise = 0.00 (due to individual importer status)
- ✅ VAT = 0.00 (due to individual importer status)
- ⚠️ **Duty is VERY HIGH:** 1,005,282.30 ₽ (much higher than comparable petrol)
  - Compare to A_phys_petrol_3_5: 493,502.22 ₽ duty for 25,000 EUR
  - F is 18,000 EUR but has 2x the duty amount

**Conclusion:** 
Parallel hybrid is treated as a **DVS-based vehicle** (volume field enabled, similar tax structure), but with a **penalty duty rate** that appears to be higher than standard petrol/diesel vehicles. This suggests the customs calculator applies a specific tariff code or duty rate for hybrid vehicles that is less favorable than pure combustion engines.

The hybrid does NOT receive electric vehicle benefits (compare to C/D which have VAT even for individuals).

## Technical Notes

### Form Field Mappings
```
Owner/Importer:
  - Individual (personal): value="1"
  - Individual (resale): value="3"
  - Legal entity: value="2"

Age:
  - Up to 3 years: value="0-3"
  - 3-5 years: value="3-5"
  - 5-7 years: value="5-7"
  - >7 years: value="7-0"

Engine Type:
  - Petrol: value="1"
  - Diesel: value="2"
  - Electric: value="4"
  - Sequential hybrid: value="5"
  - Parallel hybrid: value="6"

Power Unit:
  - HP (ЛС): value="1"
  - kW: value="2"

Currency:
  - EUR: value="EUR"
```

### Automation Challenges
1. **Volume field state:** Dynamically disabled based on engine type selection
2. **EUR rate:** Not configurable through UI, pulled from live exchange rate
3. **Form submission:** Results load on same page without full reload
4. **Result parsing:** Required regex pattern matching as results are embedded in Russian text

---
**Generated by automated Playwright test script**  
**All 6 scenarios completed successfully**
