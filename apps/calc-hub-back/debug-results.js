const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugResults() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating and filling form...');
  await page.goto('https://calcus.ru/rastamozhka-auto', { waitUntil: 'networkidle2' });
  await sleep(2000);

  // Fill one scenario
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
  await sleep(5000);

  // Debug: check all result elements
  const debugInfo = await page.evaluate(() => {
    const results = {};
    
    // Check for util result
    const utilEl = document.querySelector('.result-placeholder-util');
    results.utilElement = {
      exists: !!utilEl,
      innerHTML: utilEl ? utilEl.innerHTML : null,
      innerText: utilEl ? utilEl.innerText : null,
      textContent: utilEl ? utilEl.textContent : null,
      display: utilEl ? window.getComputedStyle(utilEl).display : null,
      visibility: utilEl ? window.getComputedStyle(utilEl).visibility : null,
    };
    
    // Check parent row
    const utilRow = document.querySelector('.result-row');
    results.utilRow = {
      exists: !!utilRow,
      display: utilRow ? window.getComputedStyle(utilRow).display : null,
      visibility: utilRow ? window.getComputedStyle(utilRow).visibility : null,
    };
    
    // Find all result placeholders
    const allPlaceholders = Array.from(document.querySelectorAll('[class*="result-placeholder"]'));
    results.allPlaceholders = allPlaceholders.map(el => ({
      className: el.className,
      text: el.textContent || el.innerText,
      html: el.innerHTML,
    }));
    
    return results;
  });

  console.log('\n=== DEBUG INFO ===');
  console.log(JSON.stringify(debugInfo, null, 2));

  await sleep(10000);
  await browser.close();
}

debugResults().catch(console.error);
