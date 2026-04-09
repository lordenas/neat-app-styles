const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function manualCalculation() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating...');
  await page.goto('https://calcus.ru/rastamozhka-auto', { waitUntil: 'networkidle2' });
  await sleep(3000);

  console.log('Filling form slowly with triggers...');
  
  // Owner
  await page.select('select[name="owner"]', '2');
  await page.evaluate(() => {
    const el = document.querySelector('select[name="owner"]');
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(1000);
  
  // Age
  await page.select('select[name="age"]', '0-3');
  await page.evaluate(() => {
    const el = document.querySelector('select[name="age"]');
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(1000);
  
  // Engine
  await page.select('select[name="engine"]', '1');
  await page.evaluate(() => {
    const el = document.querySelector('select[name="engine"]');
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(1000);

  // Volume
  await page.evaluate(() => {
    const el = document.querySelector('input[name="value"]');
    el.value = '1600';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(1000);

  // HP
  await page.evaluate(() => {
    const el = document.querySelector('input[name="power"]');
    el.value = '120';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(1000);

  // Price
  await page.evaluate(() => {
    const el = document.querySelector('input[name="price"]');
    el.value = '20000';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(1000);

  // Currency
  await page.select('select[name="curr"]', 'EUR');
  await page.evaluate(() => {
    const el = document.querySelector('select[name="curr"]');
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await sleep(1000);

  console.log('Triggering form submission via JavaScript...');
  
  // Try to find and call the calculation function directly
  const calcResult = await page.evaluate(() => {
    // Try to trigger form submission
    const form = document.querySelector('form');
    if (form) {
      // Prevent actual form submission
      const submitBtn = form.querySelector('input[type="submit"]');
      if (submitBtn) {
        submitBtn.click();
      }
    }
    return 'Clicked';
  });
  
  console.log('Calc result:', calcResult);
  await sleep(5000);

  // Check results
  const results = await page.evaluate(() => {
    return {
      util: document.querySelector('.result-placeholder-util')?.textContent?.trim() || 'Empty',
      utilRow: {
        display: window.getComputedStyle(document.querySelector('.result-row') || document.body).display,
      },
      allResults: Array.from(document.querySelectorAll('[class*="result-placeholder"]'))
        .filter(el => el.textContent && el.textContent.trim())
        .map(el => ({
          class: el.className,
          text: el.textContent.trim(),
        })),
    };
  });

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  await page.screenshot({ path: 'manual-calc.png', fullPage: true });

  await sleep(10000);
  await browser.close();
}

manualCalculation().catch(console.error);
