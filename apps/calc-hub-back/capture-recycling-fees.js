const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function captureRecyclingFees() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const results = [];

  // Test scenarios
  const scenarios = [
    // Age up to 3 years with different volumes
    { age: '0-3', ageLabel: 'up to 3 years', engineType: '1', engineLabel: 'petrol', volume: 1.0, hp: 120, price: 20000 },
    { age: '0-3', ageLabel: 'up to 3 years', engineType: '1', engineLabel: 'petrol', volume: 1.6, hp: 120, price: 20000 },
    { age: '0-3', ageLabel: 'up to 3 years', engineType: '1', engineLabel: 'petrol', volume: 2.5, hp: 120, price: 20000 },
    { age: '0-3', ageLabel: 'up to 3 years', engineType: '1', engineLabel: 'petrol', volume: 3.2, hp: 120, price: 20000 },
    // Age over 7 years with different volumes
    { age: '7-0', ageLabel: 'over 7 years', engineType: '1', engineLabel: 'petrol', volume: 1.0, hp: 120, price: 20000 },
    { age: '7-0', ageLabel: 'over 7 years', engineType: '1', engineLabel: 'petrol', volume: 1.6, hp: 120, price: 20000 },
    { age: '7-0', ageLabel: 'over 7 years', engineType: '1', engineLabel: 'petrol', volume: 2.6, hp: 120, price: 20000 },
    { age: '7-0', ageLabel: 'over 7 years', engineType: '1', engineLabel: 'petrol', volume: 3.2, hp: 120, price: 20000 },
    // Diesel over 7 years for comparison
    { age: '7-0', ageLabel: 'over 7 years', engineType: '2', engineLabel: 'diesel', volume: 2.6, hp: 180, price: 20000 },
  ];

  for (const scenario of scenarios) {
    console.log(`\nTesting: age=${scenario.ageLabel}, engine=${scenario.engineLabel}, volume=${scenario.volume}L, hp=${scenario.hp}`);
    
    await page.goto('https://calcus.ru/rastamozhka-auto', { waitUntil: 'networkidle2' });
    await sleep(2000);

    try {
      // Set legal importer (Юридическое лицо) - value="2"
      await page.select('select[name="owner"]', '2');
      await sleep(500);

      // Set age
      await page.select('select[name="age"]', scenario.age);
      await sleep(500);

      // Set engine type
      await page.select('select[name="engine"]', scenario.engineType);
      await sleep(500);

      // Set volume (in cc)
      const volumeInput = await page.$('input[name="value"]');
      if (volumeInput) {
        await volumeInput.click({ clickCount: 3 });
        await volumeInput.type(String(scenario.volume * 1000));
      }
      await sleep(500);

      // Set horsepower
      const hpInput = await page.$('input[name="power"]');
      if (hpInput) {
        await hpInput.click({ clickCount: 3 });
        await hpInput.type(String(scenario.hp));
      }
      await sleep(500);

      // Set price in EUR
      const priceInput = await page.$('input[name="price"]');
      if (priceInput) {
        await priceInput.click({ clickCount: 3 });
        await priceInput.type(String(scenario.price));
      }
      await sleep(300);

      // Set currency to EUR
      await page.select('select[name="curr"]', 'EUR');
      await sleep(500);

      // Click calculate button
      await page.click('input[type="submit"][value="Рассчитать"]');
      console.log('Clicked calculate, waiting for results...');
      
      // Wait for calculation result
      await sleep(4000);

      // Extract the recycling fee value
      const recyclingFee = await page.evaluate(() => {
        // Look for the result placeholder for util fee
        const utilElement = document.querySelector('.result-placeholder-util');
        if (utilElement) {
          const text = utilElement.innerText || utilElement.textContent;
          // Clean up the value - remove spaces and keep only digits and dots
          return text.trim().replace(/\s/g, '').replace(',', '.');
        }
        
        return 'Not found';
      });

      results.push({
        age: scenario.ageLabel,
        engineType: scenario.engineLabel,
        volumeCC: scenario.volume * 1000,
        hp: scenario.hp,
        recyclingFee: recyclingFee
      });

      console.log(`Recycling Fee: ${recyclingFee} RUB`);
    } catch (error) {
      console.error(`Error in scenario:`, error.message);
      results.push({
        age: scenario.ageLabel,
        engineType: scenario.engineLabel,
        volumeCC: scenario.volume * 1000,
        hp: scenario.hp,
        recyclingFee: `Error: ${error.message}`
      });
    }
  }

  await browser.close();

  // Print results as table
  console.log('\n\n=== RESULTS TABLE ===\n');
  console.log('| Age | Engine Type | Volume (cc) | Recycling Fee (RUB) |');
  console.log('|-----|-------------|-------------|---------------------|');
  for (const result of results) {
    console.log(`| ${result.age} | ${result.engineType} | ${result.volumeCC} | ${result.recyclingFee} |`);
  }
  console.log('\n');

  return results;
}

captureRecyclingFees().catch(console.error);
