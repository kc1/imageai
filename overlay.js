async function closeOverlays(page) {
  const modal = page.locator('.engagement-nudge-modal, .rc-dialog-wrap');

  if (!(await modal.first().isVisible().catch(() => false))) return;

  // 1) Try accessible button names
  const closeByRole = modal.getByRole('button', {
    name: /close|dismiss|no thanks|got it|×|x/i
  });
  if (await closeByRole.first().isVisible().catch(() => false)) {
    await closeByRole.first().click({ timeout: 3000 });
    return;
  }

  // 2) Try generic "X" text buttons
  const xButton = modal.locator('button:has-text("×"), button:has-text("X"), [role="button"]:has-text("×")');
  if (await xButton.first().isVisible().catch(() => false)) {
    await xButton.first().click({ timeout: 3000 });
    return;
  }

  // 3) Try header close selectors
  const headerClose = modal.locator('header button:last-of-type, .rc-dialog-close, .modal-close');
  if (await headerClose.first().isVisible().catch(() => false)) {
    await headerClose.first().click({ timeout: 3000 });
    return;
  }

  // 4) Fallback: nuke the modal
  await page.evaluate(() => {
    const sel = ['.engagement-nudge-modal', '.rc-dialog-wrap', '#engagement-wrapper'];
    for (const s of sel) document.querySelectorAll(s).forEach(el => el.remove());
  });
}


module.exports = { closeOverlays };