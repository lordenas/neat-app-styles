const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugSubmit() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Capture console logs
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating...');
  await page.goto('https://calcus.ru/rastamozhka-auto', { waitUntil: 'networkidle2' });
  await sleep(2000);

  console.log('Filling form...');
  await page.select('select[name="owner"]', '2');
  await sleep(500);
  
  await page.select('select[name="age"]', '0-3');
  await sleep(500);
  
  await page.select('select[name="engine"]', '1');
  await sleep(500);

  const volumeInput = await page.$('input[name="value"]');
  await volumeInput.click({ clickCount: 3 });
  await volumeInput.type('1600');
  await sleep(500);

  const hpInput = await page.$('input[name="power"]');
  await hpInput.click({ clickCount: 3 });
  await hpInput.type('120');
  await sleep(500);

  const priceInput = await page.$('input[name="price"]');
  await priceInput.click({ clickCount: 3 });
  await priceInput.type('20000');
  await sleep(500);

  await page.select('select[name="curr"]', 'EUR');
  await sleep(500);

  console.log('About to submit form...');
  
  // Check if button is visible and enabled
  const buttonInfo = await page.evaluate(() => {
    const btn = document.querySelector('input[type="submit"][value="Рассчитать"]');
    return {
      exists: !!btn,
      visible: btn ? window.getComputedStyle(btn).display !== 'none' : false,
      disabled: btn ? btn.disabled : null,
    };
  });
  console.log('Button info:', buttonInfo);
  
  // Try clicking and wait for network activity
  console.log('Clicking submit...');
  await Promise.all([
    page.waitForResponse(response => {
      console.log('Response received:', response.url(), response.status());
      return response.url().includes('calc') || response.url().includes('rastamozhka');
    }, { timeout: 10000 }).catch(() => console.log('No matching response')),
    page.click('input[type="submit"][value="Рассчитать"]'),
  ]);

  console.log('Waiting after submit...');
  await sleep(3000);

  // Check if results appeared
  const hasResults = await page.evaluate(() => {
    const totalEl = document.querySelector('.result-placeholder-total');
    return {
      totalExists: !!totalEl,
      totalText: totalEl ? totalEl.textContent : null,
      utilEl: !!document.querySelector('.result-placeholder-util'),
      utilText: document.querySelector('.result-placeholder-util')?.textContent || null,
    };
  });
  
  console.log('Results check:', hasResults);

  await sleep(10000);
  await browser.close();
}

debugSubmit().catch(console.error);
