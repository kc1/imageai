import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://id.land/');
  await page.getByRole('banner').getByRole('link', { name: 'Sign in' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('optionhomes11@gmail.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').click({
    button: 'right'
  });
  await page.getByPlaceholder('Password').fill('Landid1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.getByLabel('Modal').locator('div').filter({ hasText: 'Location Access Needed' }).getByRole('button').click();
  await page.locator('.chevron-regular-direction__right').first().click();
  await page.getByText('Parcel').click();
  await page.getByText('ID').click();
  await page.getByText('Kansas').click();
  await page.locator('#react-select-2-input').fill('wis');
  await page.getByText('Wisconsin', { exact: true }).click();
  await page.getByPlaceholder('County').click();
  await page.getByPlaceholder('County').fill('o');
  await page.locator('div').filter({ hasText: /^Ashland County$/ }).locator('div').click();
  await page.getByPlaceholder('ID').click();
  await page.getByPlaceholder('ID').fill('1234');
  await page.locator('div').filter({ hasText: /^018-01234-0000 \(18012340000\)$/ }).locator('div').click();
  await page.getByRole('button', { name: 'GO' }).click();
});