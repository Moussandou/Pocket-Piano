import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  await page.goto('http://localhost:5177/app');
  await page.waitForSelector('.btn-tool');
  const buttons = await page.$$('.btn-tool');
  // the record button is the second one in the .tool-group (first is metronome)
  console.log('Clicking record button...');
  await buttons[1].click();
  await new Promise(r => setTimeout(r, 2000));
  console.log('Done waiting. Exiting.');
  await browser.close();
})();
