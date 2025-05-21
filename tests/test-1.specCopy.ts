// import { test, expect } from '@playwright/test';

// test('test', async ({ page }) => {
//   await page.goto('https://id.land/');
//   await page.getByRole('banner').getByRole('link', { name: 'Sign in' }).click();
//   await page.getByPlaceholder('Email address').fill('optionhomes11@gmail.com');
//   await page.getByPlaceholder('Email address').press('Tab');
//   await page.getByPlaceholder('Password').fill('Landid1!');
//   await page.getByRole('button', { name: 'Sign In', exact: true }).click();
//   await page.locator('div').filter({ hasText: /^Location Access Needed$/ }).getByRole('button').click();
//   await page.getByLabel('Map', { exact: true }).click({
//     position: {
//       x: 782,
//       y: 211
//     }
//   });
//   await page.goto('https://id.land/discover');
//   await page.getByRole('textbox').click();
//   await page.getByRole('textbox').fill('34,-88');
//   await page.getByRole('heading', { name: '-88.000000' }).click();
//   await page.locator('li').filter({ hasText: 'Water' }).getByRole('img').click();
//   await page.locator('li').filter({ hasText: 'Outdoors' }).getByRole('img').locator('path').click();
//   await page.getByText('Account', { exact: true }).click();
//   await page.getByRole('button', { name: 'Sign Out' }).click();
// });


async function performTest2(page, property, dropboxToken) {

  await page.goto('https://id.land/discover');
  await page.getByRole('textbox').click();
  console.log('property', property);
  // await page.getByRole('textbox').fill('34,-88');
  await page.getByRole('textbox').fill(property.lat.toString() + ',' + property.lon.toString());
  // await page.getByRole('heading', { name: '-88.000000' }).click();
  // #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p
  await page.locator('#mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt > ul > li > span > div > p').click();
  // await page.getByRole('heading', { name: property.lat.toString() }).click();
  await page.locator('li').filter({ hasText: 'Water' }).getByRole('img').click();
  await page.locator('li').filter({ hasText: 'Outdoors' }).getByRole('img').locator('path').click();
  await page.getByText('Account', { exact: true }).click();
  await page.getByRole('button', { name: 'Sign Out' }).click();
}

// #mapright-map-container > div.search-bar > div.search-bar__search-control > div > div.styles-module__resultsContainer___sm5Wt
module.exports = {
  performTest2,
};
