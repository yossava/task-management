import { chromium } from 'playwright';
import { mkdir, rm } from 'fs/promises';
import { join } from 'path';

const pages = [
  { path: '/', name: 'home' },
  { path: '/boards', name: 'boards' },
  { path: '/boards/test-1', name: 'board-detail' },
];

const TEMP_DIR = 'temp/screenshots';

async function captureScreenshots() {
  // Clean up old screenshots if they exist
  try {
    await rm(TEMP_DIR, { recursive: true, force: true });
  } catch (error) {
    // Ignore if directory doesn't exist
  }

  // Create temp screenshots directory
  await mkdir(TEMP_DIR, { recursive: true });

  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  console.log('📸 Starting screenshot capture...\n');

  for (const route of pages) {
    const url = `http://localhost:3001${route.path}`;
    console.log(`Capturing: ${url}`);

    try {
      await page.goto(url, { waitUntil: 'networkidle' });

      // Take full page screenshot
      const screenshotPath = join(TEMP_DIR, `${route.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`✅ Saved: ${screenshotPath}\n`);
    } catch (error) {
      console.error(`❌ Error capturing ${url}:`, error.message, '\n');
    }
  }

  await browser.close();
  console.log(`✨ Screenshot capture complete! Check the /${TEMP_DIR} folder.\n`);
  console.log('⚠️  Note: Screenshots are temporary and will be cleaned on next run.\n');
}

captureScreenshots().catch(console.error);
