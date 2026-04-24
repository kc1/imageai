async function neutralizeEngagementOverlay(page) {
  await page.evaluate(() => {
    const selectors = [
      ".engagement-nudge-modal",
      ".amplitude-engagement-modal-container",
      ".rc-dialog-wrap",
      "#engagement-wrapper",
    ];
    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach((el) => {
        el.remove();
      });
    }
  }).catch(() => {});
}

async function setBasemap(page) {
  const layersButton = page.getByRole("button", { name: "Layers & Basemaps" });
  const engagementModal = page.locator(
    ".engagement-nudge-modal, .rc-dialog-wrap, #engagement-wrapper",
  );
  const debugTs = Date.now();
  const debugScreenshotPath = `./screenshots/setBasemap-click-failure-${debugTs}.png`;

  await closeEngagementPopups(page).catch(() => {});
  await page.keyboard.press("Escape").catch(() => {});
  await neutralizeEngagementOverlay(page);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await layersButton.click({ timeout: 10000 });
      break;
    } catch (error) {
      // A late engagement modal can still mount and intercept pointer events.
      if (attempt === 2) {
        await page.screenshot({
          path: debugScreenshotPath,
          fullPage: true,
        }).catch(() => {});
        console.error(
          `setBasemap debug screenshot saved: ${debugScreenshotPath}`,
        );
        throw error;
      }
      await closeEngagementPopups(page).catch(() => {});
      await page.keyboard.press("Escape").catch(() => {});
      await neutralizeEngagementOverlay(page);
      await page.waitForTimeout(400);
    }
  }

  if (await engagementModal.first().isVisible().catch(() => false)) {
    await closeEngagementPopups(page).catch(() => {});
    await page.keyboard.press("Escape").catch(() => {});
    await neutralizeEngagementOverlay(page);
  }

  // await page.getByRole('button', { name: 'Vintage USGS' }).click();
  await page.getByRole("button", { name: "Street" }).click({ timeout: 10000 });
  await page
    .locator("div")
    .filter({ hasText: /^Layers$/ })
    .getByRole("button")
    .click({ timeout: 10000 });
}

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
  await neutralizeEngagementOverlay(page);
}

/**
 * Amplitude follow-up popover ("Select all that apply"): choose Other and Submit.
 * Runs before global `nudge-step-close-button` handling so we do not dismiss first.
 * @param {{ waitForSurveyMs?: number }} [options] — after Personal Use, pass ~8000 so the second popover can mount.
 */
async function fillEngagementSurveyOtherIfPresent(page, options = {}) {
  const waitMs = options.waitForSurveyMs ?? 0;
  const surveyPopover = page.locator(
    [
      ".amplitude-engagement-popover-container",
      '[data-testid^="engagement-popover"]',
    ].join(", "),
  );
  const other = surveyPopover.getByRole("checkbox", { name: /^other$/i }).first();
  if (waitMs > 0) {
    await other.waitFor({ state: "visible", timeout: waitMs }).catch(() => {});
  }
  if (!(await other.isVisible().catch(() => false))) return;

  await other.click({ timeout: 3000 }).catch(() => {});
  const submit = surveyPopover.getByRole("button", { name: /^submit$/i });
  if (await submit.isVisible().catch(() => false)) {
    await submit.click({ timeout: 3000 }).catch(() => {});
  }
  console.log("✅ Engagement survey step: selected Other (and Submit if present)");
  await page.waitForTimeout(300).catch(() => {});
}

/**
 * Closes Amplitude engagement / rc-dialog overlays that intercept pointer events
 * (e.g. `.engagement-nudge-modal`, `.rc-dialog-wrap`).
 * Tries the documented test id first, then the broader strategies in closeOverlays.
 */
async function closeEngagementPopups(page) {
  await fillEngagementSurveyOtherIfPresent(page);

  const closeByTestId = page.getByTestId("nudge-step-close-button");
  if (await closeByTestId.isVisible().catch(() => false)) {
    await closeByTestId.click({ timeout: 3000 }).catch(() => {});
    console.log("✅ Engagement nudge popup closed (test id)");
  }

  const engagementActionsBar = page.locator(
    [
      "#engagement-wrapper .amplitude-engagement-actions-bar-container",
      ".rc-dialog-wrap .amplitude-engagement-actions-bar-container",
      ".amplitude-engagement-modal-container .amplitude-engagement-actions-bar-container",
    ].join(", "),
  );

  const personalUseCta = engagementActionsBar.getByRole("button", {
    name: /personal use/i,
  });
  const personalUseByClass = engagementActionsBar.locator(
    "button.amplitude-engagement-cta-button__secondary",
  );

  const closeByEngagementWrapperSelector = page.locator(
    [
      '#engagement-wrapper .amplitude-engagement-actions-bar-container button[aria-label*="close" i]',
      '#engagement-wrapper .amplitude-engagement-actions-bar-container button:has-text("Close")',
      '#engagement-wrapper .amplitude-engagement-actions-bar-container > div > div:nth-child(2) > button',
      "#engagement-wrapper .rc-dialog-root .rc-dialog-wrap .amplitude-engagement-actions-bar-container > div > div:nth-child(2) > button",
    ].join(", "),
  );

  if (
    await personalUseCta
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await personalUseCta
      .first()
      .click({ timeout: 3000 })
      .catch(() => {});
    console.log("✅ Engagement nudge popup closed (Personal Use CTA)");
    await fillEngagementSurveyOtherIfPresent(page, { waitForSurveyMs: 8000 });
  } else if (
    await personalUseByClass
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await personalUseByClass
      .first()
      .click({ timeout: 3000 })
      .catch(() => {});
    console.log("✅ Engagement nudge popup closed (secondary engagement CTA)");
    await fillEngagementSurveyOtherIfPresent(page, { waitForSurveyMs: 8000 });
  } else if (
    await closeByEngagementWrapperSelector
      .first()
      .isVisible()
      .catch(() => false)
  ) {
    await closeByEngagementWrapperSelector
      .first()
      .click({ timeout: 3000 })
      .catch(() => {});
    console.log("✅ Engagement nudge popup closed (#engagement-wrapper selector)");
  }

  await closeOverlays(page);
}

async function closeOverlays2(page) {
  await closeEngagementPopups(page);
}

module.exports = {
  closeOverlays,
  closeOverlays2,
  closeEngagementPopups,
  setBasemap,
};
