const { chromium } = require('playwright');

// Mapping based on the form options
const MAPPING = {
  owner: {
    'individual personal': '1', // Физическое лицо (для личного использования)
    'individual resale': '3',    // Физическое лицо (для перепродажи)
    'legal': '2',                // Юридическое лицо
  },
  age: {
    'up to 3 years': '0-3',      // до 3 лет
    '3-5 years': '3-5',          // от 3 до 5 лет
    '5-7 years': '5-7',          // от 5 до 7 лет
    '>7 years': '7-0',           // более 7 лет
  },
  engine: {
    'petrol': '1',               // Бензиновый
    'diesel': '2',               // Дизельный
    'electric': '4',             // Электрический
    'sequential hybrid': '5',    // Последовательный гибрид
    'parallel hybrid': '6',      // Параллельный гибрид
  },
  powerUnit: {
    'hp': '1',  // ЛС (лошадиные силы)
    'kw': '2',  // кВт
  },
  currency: {
    'EUR': 'EUR',
  }
};

const scenarios = [
  {
    name: 'A_phys_petrol_3_5',
    owner: 'individual personal',
    age: '3-5 years',
    engine: 'petrol',
    hp: 150,
    volume: 2000,
    price: 25000,
  },
  {
    name: 'B_legal_petrol_new',
    owner: 'legal',
    age: 'up to 3 years',
    engine: 'petrol',
    hp: 120,
    volume: 1600,
    price: 20000,
  },
  {
    name: 'C_phys_electric_new_hp70',
    owner: 'individual personal',
    age: 'up to 3 years',
    engine: 'electric',
    hp: 70,
    volume: 0,
    price: 30000,
  },
  {
    name: 'D_phys_electric_new_hp150',
    owner: 'individual personal',
    age: 'up to 3 years',
    engine: 'electric',
    hp: 150,
    volume: 0,
    price: 30000,
  },
  {
    name: 'E_legal_diesel_7plus',
    owner: 'legal',
    age: '>7 years',
    engine: 'diesel',
    hp: 180,
    volume: 2600,
    price: 12000,
  },
  {
    name: 'F_phys_hybrid_parallel_1_3',
    owner: 'individual personal',
    age: 'up to 3 years',
    engine: 'parallel hybrid',
    hp: 100,
    volume: 2000,
    price: 18000,
  },
];

function parseRussianNumber(text) {
  if (!text) return null;
  // Remove spaces, replace comma with dot for Russian number format
  // Example: "1 234 567,89 ₽" -> "1234567.89"
  return text.replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
}

async function runScenarios() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to calcus.ru/rastamozhka-auto...');
  await page.goto('https://calcus.ru/rastamozhka-auto', { waitUntil: 'domcontentloaded' });
  
  await page.waitForTimeout(2000);

  // Check EUR rate
  let eurRate = 'auto';
  try {
    const pageText = await page.textContent('body');
    const eurRateMatch = pageText.match(/курс.*?евро.*?([\d,.\s]+)/i);
    if (eurRateMatch) {
      eurRate = eurRateMatch[1].trim();
      console.log(`\nDetected EUR rate: ${eurRate}`);
    }
  } catch (e) {
    console.log('Could not extract EUR rate from page');
  }

  const results = [];

  for (let i = 0; i < scenarios.length; i++) {
    const scenario = scenarios[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Running scenario ${i + 1}/${scenarios.length}: ${scenario.name}`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      // Fill owner type
      await page.selectOption('select[name="owner"]', MAPPING.owner[scenario.owner]);
      console.log(`✓ Selected owner: ${scenario.owner}`);
      await page.waitForTimeout(300);

      // Fill age
      await page.selectOption('select[name="age"]', MAPPING.age[scenario.age]);
      console.log(`✓ Selected age: ${scenario.age}`);
      await page.waitForTimeout(300);

      // Fill engine type
      await page.selectOption('select[name="engine"]', MAPPING.engine[scenario.engine]);
      console.log(`✓ Selected engine: ${scenario.engine}`);
      await page.waitForTimeout(300);

      // Fill power (hp)
      await page.fill('input[name="power"]', scenario.hp.toString());
      console.log(`✓ Filled power: ${scenario.hp} hp`);
      await page.waitForTimeout(300);

      // Select power unit (hp)
      await page.selectOption('select[name="power_unit"]', MAPPING.powerUnit.hp);
      console.log(`✓ Selected power unit: hp`);
      await page.waitForTimeout(300);

      // Fill volume (skip if field is disabled, e.g., for electric vehicles)
      const volumeField = await page.$('input[name="value"]');
      const isVolumeDisabled = await volumeField.isDisabled();
      if (!isVolumeDisabled) {
        await page.fill('input[name="value"]', scenario.volume.toString());
        console.log(`✓ Filled volume: ${scenario.volume} cm³`);
      } else {
        console.log(`⊘ Volume field disabled (expected for electric/hybrid vehicles)`);
      }
      await page.waitForTimeout(300);

      // Fill price
      await page.fill('input[name="price"]', scenario.price.toString());
      console.log(`✓ Filled price: ${scenario.price} EUR`);
      await page.waitForTimeout(300);

      // Select currency
      await page.selectOption('select[name="curr"]', MAPPING.currency.EUR);
      console.log(`✓ Selected currency: EUR`);
      await page.waitForTimeout(500);

      // Submit form
      await page.click('input[type="submit"]');
      console.log('✓ Submitted form, waiting for results...');
      
      // Wait for results to load
      await page.waitForTimeout(3000);

      // Take screenshot
      await page.screenshot({ 
        path: `result-${scenario.name}.png`, 
        fullPage: true 
      });
      console.log(`✓ Screenshot saved: result-${scenario.name}.png`);

      // Extract results
      // Look for result table or output elements
      const resultText = await page.textContent('body');
      
      // Common patterns in Russian customs calculators:
      // Таможенный сбор, Пошлина, Утилизационный сбор, Акциз, НДС
      
      let customsFee = 'N/A';
      let duty = 'N/A';
      let recyclingFee = 'N/A';
      let excise = 'N/A';
      let vat = 'N/A';
      let total = 'N/A';

      // Try to find results in a table or structured format
      try {
        // Look for specific text patterns
        const customsMatch = resultText.match(/таможенн[а-я]*\s+сбор[а-я]*\s*:?\s*([\d\s,]+\.?\d*)\s*₽/i);
        if (customsMatch) customsFee = parseRussianNumber(customsMatch[1]);

        const dutyMatch = resultText.match(/пошлин[а-я]*\s*:?\s*([\d\s,]+\.?\d*)\s*₽/i);
        if (dutyMatch) duty = parseRussianNumber(dutyMatch[1]);

        const recyclingMatch = resultText.match(/утилизац[а-я]*\s+сбор[а-я]*\s*:?\s*([\d\s,]+\.?\d*)\s*₽/i);
        if (recyclingMatch) recyclingFee = parseRussianNumber(recyclingMatch[1]);

        const exciseMatch = resultText.match(/акциз[а-я]*\s*:?\s*([\d\s,]+\.?\d*)\s*₽/i);
        if (exciseMatch) excise = parseRussianNumber(exciseMatch[1]);

        const vatMatch = resultText.match(/НДС\s*:?\s*([\d\s,]+\.?\d*)\s*₽/i);
        if (vatMatch) vat = parseRussianNumber(vatMatch[1]);

        const totalMatch = resultText.match(/(?:итого|всего|сумма)[а-я\s:]*?([\d\s,]+\.?\d*)\s*₽/i);
        if (totalMatch) total = parseRussianNumber(totalMatch[1]);

      } catch (e) {
        console.error('Error parsing results:', e.message);
      }

      const result = {
        scenario: scenario.name,
        customsFee,
        duty,
        recyclingFee,
        excise,
        vat,
        total,
        eurRate,
      };

      results.push(result);
      console.log('\nExtracted results:', JSON.stringify(result, null, 2));

    } catch (error) {
      console.error(`❌ Error in scenario ${scenario.name}:`, error.message);
      results.push({
        scenario: scenario.name,
        error: error.message,
        eurRate,
      });
    }
  }

  console.log('\n\n' + '='.repeat(80));
  console.log('FINAL RESULTS');
  console.log('='.repeat(80));
  console.table(results);

  // Save results to JSON
  const fs = require('fs');
  fs.writeFileSync('rastamozhka-test-results.json', JSON.stringify(results, null, 2));
  console.log('\n✓ Results saved to: rastamozhka-test-results.json');

  console.log('\n\nPress Ctrl+C to close browser or wait 60 seconds...');
  await page.waitForTimeout(60000);

  await browser.close();
  return results;
}

runScenarios().catch(console.error);
