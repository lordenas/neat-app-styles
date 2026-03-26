import 'dotenv/config';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as schema from './schema';

async function run(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required. Set it in .env (single source of truth for DB credentials).',
    );
  }

  const pool = new Pool({
    connectionString,
  });

  const db = drizzle(pool, { schema });
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@calc-hub.local';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin12345!';

  const existingAdmin = await db.query.users.findFirst({
    where: eq(schema.users.email, adminEmail),
  });
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    await db.insert(schema.users).values({
      email: adminEmail,
      passwordHash: adminPasswordHash,
      fullName: 'System Admin',
      role: 'ADMIN',
      provider: 'credentials',
    });
  }

  const [region] = await db
    .insert(schema.regions)
    .values({
      slug: 'global',
      code: 'GLB',
      name: 'Global',
      currency: 'USD',
    })
    .onConflictDoNothing()
    .returning();

  const [calculator] = await db
    .insert(schema.calculators)
    .values({
      slug: 'vat-gst',
      title: 'VAT / GST calculator',
      calculatorType: 'vat',
      inputSchema: {
        type: 'object',
        required: ['amount', 'rate'],
        properties: {
          amount: { type: 'number', minimum: 0 },
          rate: { type: 'number', minimum: 0 },
        },
      },
    })
    .onConflictDoNothing()
    .returning();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'osago',
      title: 'ОСАГО калькулятор',
      calculatorType: 'osago',
      inputSchema: {
        type: 'object',
        required: [
          'category',
          'horsePower',
          'regionCode',
          'driverAge',
          'driverExperience',
          'kbmClass',
          'usagePeriod',
          'unlimitedDrivers',
        ],
        properties: {
          category: {
            type: 'string',
            enum: [
              'B',
              'A',
              'C',
              'C_heavy',
              'D',
              'D_small',
              'D_regular',
              'taxi',
              'tractor',
              'trolleybus',
            ],
          },
          horsePower: { type: 'number', minimum: 1 },
          regionCode: { type: 'string' },
          driverAge: { type: 'integer', minimum: 18, maximum: 99 },
          driverExperience: { type: 'integer', minimum: 0 },
          kbmClass: { type: 'integer', minimum: 0, maximum: 13 },
          usagePeriod: { type: 'integer', minimum: 3, maximum: 12 },
          unlimitedDrivers: { type: 'boolean' },
          baseTariff: {
            type: 'number',
            minimum: 0,
            description: 'Базовый тариф (в коридоре ЦБ), руб. Опционально.',
          },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'auto-loan',
      title: 'Калькулятор автокредита',
      calculatorType: 'auto_loan',
      inputSchema: {
        type: 'object',
        required: ['carPrice', 'downPayment', 'annualRate', 'termMonths'],
        properties: {
          carPrice: {
            type: 'number',
            minimum: 0,
            description: 'Стоимость автомобиля, руб.',
          },
          downPayment: {
            type: 'number',
            minimum: 0,
            description: 'Первоначальный взнос, руб.',
          },
          annualRate: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Годовая ставка, %',
          },
          termMonths: {
            type: 'integer',
            minimum: 1,
            maximum: 120,
            description: 'Срок кредита, мес.',
          },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'credit-early-repayment',
      title: 'Калькулятор досрочного погашения кредита',
      calculatorType: 'credit_early_repayment',
      inputSchema: {
        type: 'object',
        required: [
          'loanAmount',
          'annualRatePercent',
          'termMonths',
          'issueDate',
        ],
        properties: {
          loanAmount: { type: 'number', minimum: 0 },
          annualRatePercent: { type: 'number', minimum: 0, maximum: 100 },
          termMonths: { type: 'integer', minimum: 1, maximum: 360 },
          issueDate: {
            type: 'string',
            description: 'ISO yyyy-MM-dd или dd.MM.yyyy',
          },
          earlyPayments: { type: 'array', items: { type: 'object' } },
          rateChanges: { type: 'array', items: { type: 'object' } },
          creditHolidays: { type: 'array', items: { type: 'object' } },
          firstPaymentInterestOnly: { type: 'boolean' },
          roundPayment: { type: 'boolean' },
          roundTo: { type: 'string', enum: ['rub', 'hundred'] },
          transferWeekends: { type: 'boolean' },
          transferDirection: { type: 'string', enum: ['next', 'prev'] },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'deposit',
      title: 'Калькулятор вкладов',
      calculatorType: 'deposit',
      inputSchema: {
        type: 'object',
        required: [
          'principal',
          'startDate',
          'term',
          'termUnit',
          'annualRatePercent',
          'capitalization',
          'compoundFrequency',
          'payoutFrequency',
        ],
        properties: {
          principal: { type: 'number', minimum: 0 },
          startDate: { type: 'string', format: 'date' },
          term: { type: 'number', minimum: 1 },
          termUnit: { type: 'string', enum: ['days', 'months', 'years'] },
          annualRatePercent: { type: 'number', minimum: 0 },
          capitalization: { type: 'boolean' },
          compoundFrequency: {
            type: 'string',
            enum: ['1D', '1W', '1M', '3M', '6M', '1Y'],
          },
          payoutFrequency: {
            type: 'string',
            enum: ['end', '1D', '1W', '1M', '3M', '6M', '1Y'],
          },
          oneTimeTopUps: { type: 'array', items: { type: 'object' } },
          regularTopUps: { type: 'array', items: { type: 'object' } },
          oneTimeWithdrawals: { type: 'array', items: { type: 'object' } },
          regularWithdrawals: { type: 'array', items: { type: 'object' } },
          minimumBalance: { type: 'number', minimum: 0 },
          keyRatePercent: { type: 'number', minimum: 0 },
          keyRatesByYear: { type: 'object' },
          taxRatePercent: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'fuel-consumption',
      title: 'Калькулятор расхода топлива',
      calculatorType: 'fuel_consumption',
      inputSchema: {
        type: 'object',
        required: ['mode', 'distance', 'fuelPrice'],
        properties: {
          mode: { type: 'string', enum: ['consumption', 'trip'] },
          distance: { type: 'number', minimum: 0 },
          fuelUsed: { type: 'number', minimum: 0 },
          consumptionPer100: { type: 'number', minimum: 0 },
          fuelPrice: { type: 'number', minimum: 0 },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'insurance-tenure',
      title: 'Калькулятор страхового стажа',
      calculatorType: 'insurance_tenure',
      inputSchema: {
        type: 'object',
        required: ['periods'],
        properties: {
          periods: {
            type: 'array',
            items: {
              type: 'object',
              required: ['startDate', 'endDate'],
              properties: {
                startDate: { type: 'string', format: 'date' },
                endDate: { type: 'string', format: 'date' },
              },
            },
          },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'loan-interest',
      title: 'Проценты по займу (ст. 809 ГК)',
      calculatorType: 'loan_interest',
      inputSchema: {
        type: 'object',
        required: ['principal', 'startDate', 'endDate', 'initialRatePercent'],
        properties: {
          principal: { type: 'number', minimum: 0 },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          initialRatePercent: { type: 'number', minimum: 0 },
          rateChanges: { type: 'array', items: { type: 'object' } },
          payouts: { type: 'array', items: { type: 'object' } },
          debtIncreases: { type: 'array', items: { type: 'object' } },
          payoutAppliesToInterestFirst: { type: 'boolean' },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'microloan',
      title: 'Калькулятор микрозаймов',
      calculatorType: 'microloan',
      inputSchema: {
        type: 'object',
        required: [
          'amount',
          'termDays',
          'rate',
          'rateUnit',
          'hasOverdue',
          'overduePeriod',
          'overdueUnit',
          'overdueRate',
          'overdueRateUnit',
          'penaltyAmount',
        ],
        properties: {
          amount: { type: 'number', minimum: 0 },
          termDays: { type: 'number', minimum: 1 },
          rate: { type: 'number', minimum: 0 },
          rateUnit: { type: 'string', enum: ['day', 'month'] },
          hasOverdue: { type: 'boolean' },
          overduePeriod: { type: 'number', minimum: 0 },
          overdueUnit: { type: 'string', enum: ['days', 'months'] },
          overdueRate: { type: 'number', minimum: 0 },
          overdueRateUnit: { type: 'string', enum: ['day', 'month'] },
          penaltyAmount: { type: 'number', minimum: 0 },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'mortgage',
      title: 'Калькулятор ипотеки',
      calculatorType: 'mortgage',
      inputSchema: {
        type: 'object',
        required: ['propertyPrice', 'downPayment', 'annualRate', 'termYears'],
        properties: {
          propertyPrice: {
            type: 'number',
            minimum: 0,
            description: 'Стоимость недвижимости, руб.',
          },
          downPayment: {
            type: 'number',
            minimum: 0,
            description: 'Первоначальный взнос, руб.',
          },
          annualRate: {
            type: 'number',
            minimum: 0.1,
            maximum: 100,
            description: 'Годовая ставка, %',
          },
          termYears: {
            type: 'integer',
            minimum: 1,
            maximum: 30,
            description: 'Срок кредита, лет',
          },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'ndfl',
      title: 'Калькулятор НДФЛ',
      calculatorType: 'ndfl',
      inputSchema: {
        type: 'object',
        required: ['income', 'incomeType', 'isNonResident', 'direction'],
        properties: {
          income: { type: 'number', minimum: 0 },
          incomeType: {
            type: 'string',
            enum: [
              'salary',
              'svo',
              'property_sale',
              'rent',
              'securities',
              'dividends',
              'deposit_interest',
              'prize',
              'manual',
            ],
          },
          isNonResident: { type: 'boolean' },
          direction: { type: 'string', enum: ['fromGross', 'fromNet'] },
          manualRate: { type: 'number', minimum: 0, maximum: 100 },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'otpusknye',
      title: 'Калькулятор отпускных',
      calculatorType: 'otpusknye',
      inputSchema: {
        type: 'object',
        required: ['totalEarnings', 'fullMonths', 'vacationDays'],
        properties: {
          totalEarnings: { type: 'number', minimum: 0 },
          fullMonths: { type: 'integer', minimum: 0, maximum: 12 },
          partialMonths: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                excludedDays: { type: 'integer', minimum: 0 },
                totalDaysInMonth: { type: 'integer', minimum: 28, maximum: 31 },
              },
            },
          },
          vacationDays: { type: 'integer', minimum: 1 },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'penalty-contract',
      title: 'Неустойка по договору',
      calculatorType: 'penalty_contract',
      inputSchema: {
        type: 'object',
        required: [
          'sum',
          'startDate',
          'endDate',
          'workdaysOnly',
          'rateType',
          'rateValue',
        ],
        properties: {
          sum: { type: 'number', minimum: 0 },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          workdaysOnly: { type: 'boolean' },
          rateType: {
            type: 'string',
            enum: ['percent_per_year', 'percent_per_day', 'fixed_per_day'],
          },
          rateValue: { type: 'number', minimum: 0 },
          excludedPeriods: { type: 'array', items: { type: 'object' } },
          limitType: { type: 'string', enum: ['fixed', 'percent'] },
          limitValue: { type: 'number', minimum: 0 },
          partialPayments: { type: 'array', items: { type: 'object' } },
          additionalDebts: { type: 'array', items: { type: 'object' } },
          showPerDebt: { type: 'boolean' },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'peni',
      title: 'Калькулятор пеней',
      calculatorType: 'peni',
      inputSchema: {
        type: 'object',
        required: ['debt', 'calcType', 'payerType', 'dateFrom', 'dateTo'],
        properties: {
          debt: { type: 'number', minimum: 0 },
          calcType: { type: 'string', enum: ['tax', 'utilities', 'salary'] },
          payerType: { type: 'string', enum: ['individual', 'legal'] },
          dateFrom: { type: 'string', format: 'date' },
          dateTo: { type: 'string', format: 'date' },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'property-deduction',
      title: 'Имущественный вычет',
      calculatorType: 'property_deduction',
      inputSchema: {
        type: 'object',
        required: ['propertyPrice', 'purchaseYear', 'incomeByYear'],
        properties: {
          propertyPrice: { type: 'number', minimum: 0 },
          purchaseYear: { type: 'number' },
          incomeByYear: {
            type: 'object',
            additionalProperties: { type: 'number' },
          },
          usedPreviously: { type: 'boolean' },
          previousUsePeriod: {
            type: 'string',
            enum: ['before_2014', 'after_2014'],
          },
          returnedAmount: { type: 'number', minimum: 0 },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'property-sale-tax',
      title: 'Налог с продажи квартиры',
      calculatorType: 'property_sale_tax',
      inputSchema: {
        type: 'object',
        required: [
          'acquisitionType',
          'yearsHeld',
          'salePrice',
          'cadastralValue',
        ],
        properties: {
          ownershipBefore2016: { type: 'boolean' },
          acquisitionType: { type: 'string', enum: ['purchase', 'other'] },
          isSoleHousing: { type: 'boolean' },
          yearsHeld: { type: 'number', minimum: 0 },
          salePrice: { type: 'number', minimum: 0 },
          cadastralValue: { type: 'number', minimum: 0 },
          coefficient: { type: 'number', minimum: 0, maximum: 1 },
          useFixedDeduction: { type: 'boolean' },
          purchaseExpenses: { type: 'number', minimum: 0 },
          saleAfter2025: { type: 'boolean' },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'refinancing',
      title: 'Рефинансирование ипотеки',
      calculatorType: 'refinancing',
      inputSchema: {
        type: 'object',
        required: [
          'remainingDebt',
          'remainingTerm',
          'remainingTermUnit',
          'currentRate',
        ],
        properties: {
          remainingDebt: { type: 'number', minimum: 0 },
          remainingTerm: { type: 'number', minimum: 1 },
          remainingTermUnit: { type: 'string', enum: ['years', 'months'] },
          currentRate: { type: 'number', minimum: 0 },
          newRate: { type: 'number', minimum: 0 },
          newTerm: { type: 'number', minimum: 1 },
          newTermUnit: { type: 'string', enum: ['years', 'months'] },
          newAmount: { type: 'number', minimum: 0 },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'transport-tax',
      title: 'Транспортный налог',
      calculatorType: 'transport_tax',
      inputSchema: {
        type: 'object',
        required: [
          'horsePower',
          'vehicleCategory',
          'regionCode',
          'ownershipMonths',
        ],
        properties: {
          horsePower: { type: 'number', minimum: 0 },
          vehicleCategory: {
            type: 'string',
            enum: [
              'passenger_car',
              'motorcycle',
              'bus',
              'truck',
              'snowmobile',
              'boat',
              'yacht',
              'jetski',
              'towed_vessel',
              'aircraft_engine',
              'jet_aircraft',
              'other_no_engine',
              'other_self_propelled',
            ],
          },
          regionCode: { type: 'string' },
          ownershipMonths: { type: 'number', minimum: 1, maximum: 12 },
          carPrice: { type: 'number', minimum: 0 },
          carYear: { type: 'number' },
          taxYear: { type: 'number' },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'unused-vacation',
      title: 'Компенсация за неиспользованный отпуск',
      calculatorType: 'unused_vacation',
      inputSchema: {
        type: 'object',
        required: [
          'avgDailyPay',
          'startDate',
          'endDate',
          'annualVacationDays',
          'usedVacationDays',
        ],
        properties: {
          avgDailyPay: { type: 'number', minimum: 0 },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          annualVacationDays: { type: 'number', minimum: 1 },
          usedVacationDays: { type: 'number', minimum: 0 },
          excludedPeriods: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                from: { type: 'string', format: 'date' },
                to: { type: 'string', format: 'date' },
              },
            },
          },
        },
      },
    })
    .onConflictDoNothing();

  await db
    .insert(schema.calculators)
    .values({
      slug: 'rastamozhka-auto',
      title: 'Растаможка авто',
      calculatorType: 'rastamozhka_auto',
      inputSchema: {
        type: 'object',
        required: [
          'priceEur',
          'engineVolume',
          'horsePower',
          'engineType',
          'ageGroup',
          'importerType',
          'eurRate',
        ],
        properties: {
          priceEur: { type: 'number', minimum: 0 },
          engineVolume: { type: 'number', minimum: 0 },
          horsePower: { type: 'number', minimum: 0 },
          engineType: {
            type: 'string',
            enum: [
              'petrol',
              'diesel',
              'electric',
              'hybrid_parallel',
              'hybrid_series',
            ],
          },
          ageGroup: {
            type: 'string',
            enum: ['new', '1-3', '3-5', '5-7', '7+'],
          },
          importerType: {
            type: 'string',
            enum: ['individual', 'individual_resale', 'legal'],
          },
          eurRate: { type: 'number', minimum: 0.01 },
        },
      },
    })
    .onConflictDoNothing();

  const regionRow =
    region ??
    (await db.query.regions.findFirst({
      where: eq(schema.regions.code, 'GLB'),
    }));
  const calculatorRow =
    calculator ??
    (await db.query.calculators.findFirst({
      where: eq(schema.calculators.slug, 'vat-gst'),
    }));

  if (regionRow && calculatorRow) {
    const existingFormula = await db.query.formulas.findFirst({
      where: and(
        eq(schema.formulas.calculatorId, calculatorRow.id),
        eq(schema.formulas.regionId, regionRow.id),
        eq(schema.formulas.version, '1.0.0'),
      ),
    });

    if (!existingFormula) {
      await db.insert(schema.formulas).values({
        calculatorId: calculatorRow.id,
        regionId: regionRow.id,
        version: '1.0.0',
        effectiveFrom: new Date('2024-01-01T00:00:00.000Z'),
        jsonDefinition: {
          version: '1.0.0',
          inputs: {
            amount: { type: 'number', required: true },
            rate: { type: 'number', required: true },
            customerType: { type: 'string', required: false },
          },
          variables: [
            {
              name: 'effectiveRate',
              expr: {
                type: 'lookup',
                table: 'customerRate',
                key: { type: 'input_ref', path: 'customerType' },
                fallback: { type: 'input_ref', path: 'rate' },
              },
            },
            {
              name: 'tax',
              expr: {
                type: 'binary',
                op: '*',
                left: { type: 'input_ref', path: 'amount' },
                right: {
                  type: 'binary',
                  op: '/',
                  left: { type: 'var_ref', name: 'effectiveRate' },
                  right: { type: 'literal', value: 100 },
                },
              },
            },
            {
              name: 'discount',
              expr: {
                type: 'if',
                condition: {
                  type: 'binary',
                  op: '>',
                  left: { type: 'input_ref', path: 'amount' },
                  right: { type: 'literal', value: 10000 },
                },
                then: { type: 'literal', value: 100 },
                else: { type: 'literal', value: 0 },
              },
            },
          ],
          lookups: {
            customerRate: {
              vip: 18,
              regular: 20,
            },
          },
          outputs: [
            {
              key: 'tax',
              expr: { type: 'var_ref', name: 'tax' },
            },
            {
              key: 'total',
              expr: {
                type: 'binary',
                op: '+',
                left: {
                  type: 'binary',
                  op: '+',
                  left: { type: 'input_ref', path: 'amount' },
                  right: { type: 'var_ref', name: 'tax' },
                },
                right: {
                  type: 'unary',
                  op: '-',
                  arg: { type: 'var_ref', name: 'discount' },
                },
              },
            },
            {
              key: 'effectiveRate',
              expr: { type: 'var_ref', name: 'effectiveRate' },
            },
          ],
          meta: {
            name: 'VAT with customer lookup and conditional discount',
            description: 'Reference AST-DSL formula',
          },
        },
      });
    }
  }

  await pool.end();

  console.log('Seed complete');
}

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
