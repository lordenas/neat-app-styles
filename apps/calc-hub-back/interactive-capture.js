const puppeteer = require('puppeteer-core');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function interactiveCapture() {
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    devtools: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log('Opening calculator page...');
  await page.goto('https://calcus.ru/rastamozhka-auto', { waitUntil: 'networkidle2' });
  await sleep(2000);

  console.log('\n===================================');
  console.log('MANUAL TESTING MODE');
  console.log('===================================');
  console.log('\nPlease manually test the following scenarios:');
  console.log('\nSettings for all scenarios:');
  console.log('- Importer: Юридическое лицо (Legal entity)');
  console.log('- Price: 20000 EUR');
  console.log('- Currency: EUR');
  console.log('\n1) Age UP TO 3 years, Petrol, HP=120:');
  console.log('   - Volume: 1000 cc');
  console.log('   - Volume: 1600 cc');
  console.log('   - Volume: 2500 cc');
  console.log('   - Volume: 3200 cc');
  console.log('\n2) Age OVER 7 years, Petrol, HP=120:');
  console.log('   - Volume: 1000 cc');
  console.log('   - Volume: 1600 cc');
  console.log('   - Volume: 2600 cc');
  console.log('   - Volume: 3200 cc');
  console.log('\n3) Age OVER 7 years, Diesel, HP=180:');
  console.log('   - Volume: 2600 cc');
  console.log('\nFor each scenario, please note the "Утилизационный сбор" value');
  console.log('\nBrowser will stay open for 10 minutes.');
  console.log('Close it manually when done.');
  console.log('===================================\n');

  // Keep browser open for manual testing
  await sleep(600000); // 10 minutes
}

interactiveCapture().catch(console.error);
