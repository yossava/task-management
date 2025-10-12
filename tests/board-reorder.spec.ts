import { test, expect } from '@playwright/test';

test.describe('Board Reordering Test', () => {
  test('should reorder boards and persist after refresh', async ({ page }) => {
    // Go to the boards page
    await page.goto('http://localhost:3000/boards');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Check if there are existing boards
    const boardCards = page.locator('[data-testid="board-card"]');
    const boardCount = await boardCards.count();

    console.log(`Found ${boardCount} existing boards`);

    if (boardCount < 2) {
      console.log('ERROR: Need at least 2 boards to test reordering. Please create boards manually first.');
      test.skip();
      return;
    }

    // Get initial board order
    await page.waitForTimeout(1000);
    const initialBoards = await page.locator('[data-testid="board-card"]').allTextContents();
    console.log('Initial board order:', initialBoards);

    // Get the first two boards for dragging
    const firstBoard = page.locator('[data-testid="board-card"]').first();
    const secondBoard = page.locator('[data-testid="board-card"]').nth(1);

    // Get their positions
    const firstBoardBox = await firstBoard.boundingBox();
    const secondBoardBox = await secondBoard.boundingBox();

    if (!firstBoardBox || !secondBoardBox) {
      throw new Error('Could not get board positions');
    }

    console.log('Dragging first board to second position...');

    // Perform drag and drop - drag first board to the right of second board
    await firstBoard.hover();
    await page.mouse.down();
    await page.mouse.move(
      secondBoardBox.x + secondBoardBox.width + 50,
      secondBoardBox.y + secondBoardBox.height / 2,
      { steps: 10 }
    );
    await page.mouse.up();

    // Wait for the reorder to complete
    await page.waitForTimeout(2000);

    // Get board order after drag
    const afterDragBoards = await page.locator('[data-testid="board-card"]').allTextContents();
    console.log('Board order after drag:', afterDragBoards);

    // Verify order changed
    expect(afterDragBoards[0]).not.toBe(initialBoards[0]);

    console.log('Refreshing page...');

    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Get board order after refresh
    const afterRefreshBoards = await page.locator('[data-testid="board-card"]').allTextContents();
    console.log('Board order after refresh:', afterRefreshBoards);

    // Check if the order persisted
    console.log('\n=== TEST RESULT ===');
    if (afterRefreshBoards[0] === afterDragBoards[0]) {
      console.log('✅ SUCCESS: Board order persisted after refresh!');
    } else {
      console.log('❌ FAIL: Board order reverted after refresh');
      console.log(`Expected first board: ${afterDragBoards[0]}`);
      console.log(`Actual first board: ${afterRefreshBoards[0]}`);
    }

    // Assert that order persisted
    expect(afterRefreshBoards[0]).toBe(afterDragBoards[0]);
  });
});
