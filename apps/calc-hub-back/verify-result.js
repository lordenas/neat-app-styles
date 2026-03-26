const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function verifyRecyclingFee() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating and filling form...');
  await page.goto('https://calcus.ru/rastamozhka-auto', { waitUntil: 'networkidle2' });
  await sleep(2000);

  // Fill one scenario to verify
  await page.select('select[name="owner"]', '2'); // Legal importer
  await sleep(300);
  
  await page.select('select[name="age"]', '0-3'); // up to 3 years
  await sleep(300);
  
  await page.select('select[name="engine"]', '1'); // Petrol
  await sleep(300);

  const volumeInput = await page.$('input[name="value"]');
  await volumeInput.click({ clickCount: 3 });
  await volumeInput.type('1600');
  await sleep(300);

  const hpInput = await page.$('input[name="power"]');
  await hpInput.click({ clickCount: 3 });
  await hpInput.type('120');
  await sleep(300);

  const priceInput = await page.$('input[name="price"]');
  await priceInput.click({ clickCount: 3 });
  await priceInput.type('20000');
  await sleep(300);

  await page.select('select[name="curr"]', 'EUR');
  await sleep(300);

  await page.click('input[type="submit"][value="Рассчитать"]');
  console.log('Waiting for results...');
  await sleep(4000);

  // Take screenshot
  await page.screenshot({ path: 'result-verification.png', fullPage: true });
  console.log('Screenshot saved as result-verification.png');

  // Extract all results text
  const allResults = await page.evaluate(() => {
    const resultsArea = document.querySelector('.calc-result, .results, #result') || document.body;
    return resultsArea.innerText || resultsArea.textContent;
  });

  console.log('\n=== ALL RESULTS TEXT ===\n');
  console.log(allResults);

  await sleep(5000);
  await browser.close();
}

verifyRecyclingFee().catch(console.error);
