import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://jonl.org/timer-app/');
  await page.waitForTimeout(2000); // Wait for page to fully load
  await page.screenshot({ path: 'screenshot.png', fullPage: true });
  console.log('Screenshot saved as screenshot.png');
  await browser.close();
})();