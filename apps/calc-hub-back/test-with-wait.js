const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testWithWait() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Navigating...');
  await page.goto('https://calcus.ru/rastamozhka-auto', { waitUntil: 'networkidle2' });
  await sleep(2000);

  console.log('Filling form...');
  await page.select('select[name="owner"]', '2');
  await sleep(300);
  
  await page.select('select[name="age"]', '0-3');
  await sleep(300);
  
  await page.select('select[name="engine"]', '1');
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

  console.log('Clicking submit and waiting for results...');
  await page.click('input[type="submit"][value="Рассчитать"]');
  
  // Wait for the util result to have content
  try {
    await page.waitForFunction(
      () => {
        const utilEl = document.querySelector('.result-placeholder-util');
        return utilEl && utilEl.textContent && utilEl.textContent.trim().length > 0;
      },
      { timeout: 15000 }
    );
    console.log('Util result appeared!');
  } catch (e) {
    console.log('Timeout waiting for util result');
  }

  await sleep(2000);

  // Extract results
  const results = await page.evaluate(() => {
    return {
      util: document.querySelector('.result-placeholder-util')?.textContent?.trim() || 'Not found',
      sbor: document.querySelector('.result-placeholder-sbor')?.textContent?.trim() || 'Not found',
      tax: document.querySelector('.result-placeholder-tax')?.textContent?.trim() || 'Not found',
      excise: document.querySelector('.result-placeholder-excise')?.textContent?.trim() || 'Not found',
      nds: document.querySelector('.result-placeholder-nds')?.textContent?.trim() || 'Not found',
      total: document.querySelector('.result-placeholder-total')?.textContent?.trim() || 'Not found',
    };
  });

  console.log('\n=== RESULTS ===');
  console.log(JSON.stringify(results, null, 2));

  // Also get screenshot
  await page.screenshot({ path: 'final-result.png', fullPage: true });
  console.log('Screenshot saved');

  await sleep(5000);
  await browser.close();
}

testWithWait().catch(console.error);
