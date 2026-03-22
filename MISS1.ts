import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://id.land/');
  await page.goto('https://id.land/users/sign_in');
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('optionhomes11@gmail.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('Landid1!');
  await page.locator('svg').nth(2).click();
  await page.getByRole('button', { name: 'Sign In', exact: true }).click();
  await page.getByRole('button', { name: 'OK' }).click();
  await page.getByTestId('nudge-step-close-button').click();
  await page.getByRole('textbox').click();
  await page.getByText('Location34.25753, -').click();
  await page.locator('#smart-search-promo-card').getByRole('button').click();
  await page.getByText('Location').click();
  await page.locator('li').filter({ hasText: 'Infrastructure' }).getByRole('img').click();
  await page.getByRole('heading', { name: 'Fiber Optic Service' }).click();
});