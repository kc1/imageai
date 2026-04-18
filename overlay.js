async function closeOverlays(page) {
  const modal = page.locator(".engagement-nudge-modal, .rc-dialog-wrap");

  if (
    !(await modal
      .first()
      .isVisible()
      .catch(() => false))
  )
    return;

  // 1) Try accessible button names
  const closeByRole = modal.getByRole("button", {
    name: /close|dismiss|no thanks|got it|×|x/i,
  });
  if (
    await closeByRole
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await closeByRole.first().click({ timeout: 3000 });
    return;
  }

  // 2) Try generic "X" text buttons
  const xButton = modal.locator(
    'button:has-text("×"), button:has-text("X"), [role="button"]:has-text("×")',
  );
  if (
    await xButton
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await xButton.first().click({ timeout: 3000 });
    return;
  }

  // 3) Try header close selectors
  const headerClose = modal.locator(
    "header button:last-of-type, .rc-dialog-close, .modal-close",
  );
  if (
    await headerClose
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await headerClose.first().click({ timeout: 3000 });
    return;
  }

  // 4) Escape (rc-dialog / Amplitude sometimes honor this)
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
  if (
    !(await modal
      .first()
      .isVisible()
      .catch(() => false))
  )
    return;

  // 5) Fallback: remove modal nodes from the DOM so clicks reach the page
  await page.evaluate(() => {
    const sel = [
      ".engagement-nudge-modal",
      ".amplitude-engagement-modal-container",
      ".rc-dialog-wrap",
      "#engagement-wrapper",
    ];
    for (const s of sel)
      document.querySelectorAll(s).forEach((el) => el.remove());
  });
}

/**
 * Closes Amplitude engagement / rc-dialog overlays that intercept pointer events
 * (e.g. `.engagement-nudge-modal`, `.rc-dialog-wrap`).
 * Tries the documented test id first, then the broader strategies in closeOverlays.
 */
async function closeEngagementPopups(page) {
  const closeByTestId = page.getByTestId("nudge-step-close-button");
  if (await closeByTestId.isVisible().catch(() => false)) {
    await closeByTestId.click({ timeout: 3000 }).catch(() => {});
    console.log("✅ Engagement nudge popup closed (test id)");
  }
  await closeOverlays(page);
}

async function closeOverlays2(page) {
  await closeEngagementPopups(page);
}

module.exports = { closeOverlays, closeOverlays2, closeEngagementPopups };
