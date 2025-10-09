const { chromium } = require('playwright');

async function captureScreenshots() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const sites = [
    { name: 'larksuite', url: 'https://www.larksuite.com/' },
    { name: 'atlassian', url: 'https://www.atlassian.com/' },
    { name: 'trello', url: 'https://trello.com/' }
  ];

  for (const site of sites) {
    const page = await context.newPage();
    console.log(`Capturing ${site.name}...`);

    try {
      await page.goto(site.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({
        path: `scripts/${site.name}-screenshot.png`,
        fullPage: false
      });
      console.log(`✓ Captured ${site.name}`);
    } catch (error) {
      console.error(`✗ Failed to capture ${site.name}:`, error.message);
    }

    await page.close();
  }

  await browser.close();
  console.log('All screenshots captured!');
}

captureScreenshots();
