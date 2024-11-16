import { test, expect } from '@playwright/test'

test.describe('Poker Game', () => {
  test('should start a new game and execute basic actions', async ({ page }) => {
    // Navigate to the game page
    await page.goto('localhost:3000/')
    
    // Set initial stack size and start game
    await expect(page.locator('input[type="number"]')).toBeDisabled()
    

    // Wait for and verify big blind text.
    await expect(page.getByTestId('move_log')).toContainText('big blind - 40 chips')
    await expect(page.getByTestId('move_log')).toContainText('Player 6 is dealt')
    await expect(page.getByTestId('move_log')).toContainText('Waiting for Player')

    // check if buttons are disabled apropriately
    await expect(page.getByTestId('check_button')).toBeDisabled()
    await expect(page.getByTestId('bet_button')).toBeDisabled()
    await expect(page.getByTestId('raise_button')).toBeDisabled()
    
    // increase the raise amount and see if the raise button is enabled
    await page.getByTestId('raise_button_plus').click()
    await expect(page.getByTestId('raise_button')).toBeEnabled()

    // Click call button 5 times and verify it's enabled before each click
    for (let i = 0; i < 6; i++) {
      await expect(page.getByTestId('call_button')).toBeEnabled();
      await page.getByTestId('call_button').click();
    }

    // let's check if flop cards are dealt
    await expect(page.getByTestId('move_log')).toContainText('Dealing flop')

    // let's see if the bet button is enabled
    await expect(page.getByTestId('bet_button')).toBeEnabled()
    // see if the check button is enabled
    await expect(page.getByTestId('check_button')).toBeEnabled()

    // click bet button and verify it was successful
    await page.getByTestId('bet_button').click()
    await expect(page.getByTestId('move_log')).toContainText('bets 40')

    // let's see if the bet button is disabled
    await expect(page.getByTestId('bet_button')).toBeDisabled()

    // let's see if the check button is disabled
    await expect(page.getByTestId('check_button')).toBeDisabled()

    // let's click the fold button five times and verify it's enabled before each click
    for (let i = 0; i < 5; i++) {
      await expect(page.getByTestId('fold_button')).toBeEnabled();
      await page.getByTestId('fold_button').click();
    }

    // let's see if the game is over
    await expect(page.getByTestId('move_log')).toContainText('Game end')
  })
}) 