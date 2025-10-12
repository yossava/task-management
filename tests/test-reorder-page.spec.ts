import { test, expect } from '@playwright/test';

test.describe('Board Reorder Test Page', () => {
  test('should create boards, toggle order, and persist after refresh', async ({ page }) => {
    // Navigate to the test page
    await page.goto('http://localhost:3000/test-reorder');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for page to fully load

    console.log('=== TEST START ===');
    console.log('Navigated to test-reorder page');

    // Step 0: Check for existing boards and delete if any
    console.log('\n--- Step 0: Checking for existing boards ---');

    const boardsList = page.locator('[data-testid="boards-list"]');
    let boardItems = boardsList.locator('[data-testid^="board-item-"]');
    let boardCount = await boardItems.count();

    console.log(`Found ${boardCount} existing boards`);

    if (boardCount > 0) {
      console.log(`Deleting ${boardCount} existing boards...`);

      // Click the "Delete All Boards" button
      const deleteAllButton = page.locator('[data-testid="delete-all-btn"]');
      await deleteAllButton.click();

      // Wait for deletion to complete
      await page.waitForTimeout(3000);

      // Verify deletion
      boardCount = await boardItems.count();
      console.log(`After deletion: ${boardCount} boards remaining`);

      if (boardCount > 0) {
        throw new Error(`Failed to delete all boards. ${boardCount} boards still exist.`);
      }

      console.log('✅ All boards deleted successfully');
    } else {
      console.log('✅ No existing boards - starting with clean slate');
    }

    // Step 0.5: Verify no boards exist
    console.log('\n--- Step 0.5: Final verification - no boards exist ---');
    await page.waitForTimeout(1000);
    boardItems = boardsList.locator('[data-testid^="board-item-"]');
    boardCount = await boardItems.count();
    console.log(`Board count before creation: ${boardCount}`);
    expect(boardCount).toBe(0);
    console.log('✅ Confirmed: No boards exist');

    // Step 1: Create 2 test boards
    console.log('\n--- Step 1: Creating 2 test boards ---');
    const createButton = page.locator('[data-testid="create-boards-btn"]');
    await createButton.click();

    // Wait for boards to be created
    await page.waitForTimeout(5000);

    // Verify we have exactly 2 boards
    boardItems = boardsList.locator('[data-testid^="board-item-"]');
    boardCount = await boardItems.count();

    console.log(`Found ${boardCount} boards after creation`);

    if (boardCount !== 2) {
      throw new Error(`Expected exactly 2 boards, but found ${boardCount}. Creation may have failed.`);
    }

    console.log('✅ Successfully created 2 boards');

    // Get initial order
    const firstBoardBefore = await boardItems.nth(0).locator('h3').textContent();
    const secondBoardBefore = await boardItems.nth(1).locator('h3').textContent();
    const firstOrderBefore = await boardItems.nth(0).getAttribute('data-board-order');
    const secondOrderBefore = await boardItems.nth(1).getAttribute('data-board-order');

    console.log(`Initial order: "${firstBoardBefore}" (order: ${firstOrderBefore}), "${secondBoardBefore}" (order: ${secondOrderBefore})`);
    console.log('✅ Initial order captured');

    // Step 2: Toggle order
    console.log('\n--- Step 2: Toggling order ---');
    const toggleButton = page.locator('[data-testid="toggle-order-btn"]');
    await toggleButton.click();

    // Wait for the toggle operation to complete (2 second wait + refresh in the code)
    await page.waitForTimeout(4000);

    // Re-query board items after toggle
    boardItems = boardsList.locator('[data-testid^="board-item-"]');
    const boardCountAfterToggle = await boardItems.count();
    console.log(`Board count after toggle: ${boardCountAfterToggle}`);

    // Get order after toggle
    const firstBoardAfter = await boardItems.nth(0).locator('h3').textContent();
    const secondBoardAfter = await boardItems.nth(1).locator('h3').textContent();
    const firstOrderAfter = await boardItems.nth(0).getAttribute('data-board-order');
    const secondOrderAfter = await boardItems.nth(1).getAttribute('data-board-order');

    console.log(`After toggle: "${firstBoardAfter}" (order: ${firstOrderAfter}), "${secondBoardAfter}" (order: ${secondOrderAfter})`);

    // Verify order changed
    console.log('\n--- Verifying order changed ---');
    if (firstBoardBefore === firstBoardAfter) {
      console.log(`❌ FAIL: Order did not change after toggle`);
      console.log(`  Expected first board to be: "${secondBoardBefore}"`);
      console.log(`  But it is still: "${firstBoardAfter}"`);
      throw new Error('Board order did not change after toggle');
    } else {
      console.log('✅ SUCCESS: Order changed after toggle');
      console.log(`  "${firstBoardBefore}" → "${firstBoardAfter}"`);
    }
    expect(firstBoardBefore).not.toBe(firstBoardAfter);

    // Step 3: Refresh page to check persistence
    console.log('\n--- Step 3: Refreshing page to verify persistence ---');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Get order after refresh
    const boardItemsAfterRefresh = page.locator('[data-testid="boards-list"]').locator('[data-testid^="board-item-"]');
    const boardCountAfterRefresh = await boardItemsAfterRefresh.count();
    console.log(`Board count after refresh: ${boardCountAfterRefresh}`);

    const firstBoardAfterRefresh = await boardItemsAfterRefresh.nth(0).locator('h3').textContent();
    const secondBoardAfterRefresh = await boardItemsAfterRefresh.nth(1).locator('h3').textContent();
    const firstOrderAfterRefresh = await boardItemsAfterRefresh.nth(0).getAttribute('data-board-order');
    const secondOrderAfterRefresh = await boardItemsAfterRefresh.nth(1).getAttribute('data-board-order');

    console.log(`After refresh: "${firstBoardAfterRefresh}" (order: ${firstOrderAfterRefresh}), "${secondBoardAfterRefresh}" (order: ${secondOrderAfterRefresh})`);

    // Verify persistence
    console.log('\n=== FINAL TEST RESULT ===');
    if (firstBoardAfter === firstBoardAfterRefresh && firstOrderAfter === firstOrderAfterRefresh) {
      console.log('✅ SUCCESS: Board order persisted after refresh!');
      console.log(`  Before refresh: "${firstBoardAfter}" was first`);
      console.log(`  After refresh:  "${firstBoardAfterRefresh}" is still first`);
      console.log(`  Order value: ${firstOrderAfterRefresh}`);
      console.log('\n🎉 TEST PASSED: Board reordering works correctly!');
    } else {
      console.log('❌ FAIL: Board order reverted after refresh');
      console.log(`  Before refresh: "${firstBoardAfter}" (order: ${firstOrderAfter})`);
      console.log(`  After refresh:  "${firstBoardAfterRefresh}" (order: ${firstOrderAfterRefresh})`);
      throw new Error('Board order did not persist after page refresh');
    }

    expect(firstBoardAfterRefresh).toBe(firstBoardAfter);
    expect(firstOrderAfterRefresh).toBe(firstOrderAfter);
  });

  test('should show proper logs in the test page', async ({ page }) => {
    // Navigate to the test page
    await page.goto('http://localhost:3000/test-reorder');
    await page.waitForLoadState('networkidle');

    // Check that logs section exists
    const logsSection = page.locator('h2:has-text("Test Logs")');
    await expect(logsSection).toBeVisible();

    // Create boards and check that logs are appearing
    const createButton = page.locator('[data-testid="create-boards-btn"]');
    await createButton.click();

    await page.waitForTimeout(3000);

    // Check that some log entries were created
    const logEntries = page.locator('.bg-gray-900 div.mb-1');
    const logCount = await logEntries.count();

    console.log(`Found ${logCount} log entries`);
    expect(logCount).toBeGreaterThan(0);

    // Clear logs button should work
    const clearLogsButton = page.locator('button:has-text("Clear Logs")');
    await clearLogsButton.click();

    await page.waitForTimeout(500);

    const logCountAfterClear = await logEntries.count();
    console.log(`Log count after clear: ${logCountAfterClear}`);
  });
});
