import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://id.land/');
  await page.getByRole('banner').getByRole('link', { name: 'Sign in' }).click();
  await page.getByPlaceholder('Email address').fill('optionhomes11@gmail.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('Landid1!');
  await page.getByRole('button', { name: 'Sign In' }).click();
});