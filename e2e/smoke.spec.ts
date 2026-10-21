import { expect, test, type Page } from "@playwright/test";

const PAGES = ["/", "/protocol/food/", "/protocol/sigh/", "/supplements/", "/about/", "/privacy/", "/terms/"];

/** Open a page and wait until its scripts have attached, so input is not lost. Buttons that need the stored state start disabled. */
async function open(page: Page, path: string) {
  await page.goto(path);
  await expect(page.locator("main button:disabled")).toHaveCount(0);
}

async function overflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

for (const scheme of ["light", "dark"] as const) {
  test(`no horizontal scroll at 360px (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    for (const path of PAGES) {
      await page.goto(path);
      expect(await overflow(page), path).toBeLessThanOrEqual(0);
    }
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe(scheme === "dark" ? "rgb(13, 21, 30)" : "rgb(241, 244, 247)");
  });
}

test("ticks persist across a reload and drive score, tabs and share text", async ({ page }) => {
  await open(page, "/");
  for (const n of [1, 2, 5]) await page.locator("#chk-" + n).check();
  await expect(page.getByTestId("score")).toHaveText("3");

  await page.reload();
  for (const n of [1, 2, 5]) await expect(page.locator("#chk-" + n)).toBeChecked();
  await expect(page.locator("#chk-3")).not.toBeChecked();
  await expect(page.getByTestId("score")).toHaveText("3");
  await expect(page.locator("a.tab.is-done")).toHaveCount(3);

  const lines = (await page.getByTestId("share-text").innerText()).split("\n");
  expect(lines[0]).toMatch(/^Uberman · (Sun|Mon|Tue|Wed|Thu|Fri|Sat), \d{1,2} [A-Z][a-z]{2}$/);
  expect(lines[1]).toBe("3/10  ■■□□■□□□□□");
  expect(lines[2]).toBe(
    "Water, light, training, focus, sigh, late light, dim evening, dark sleep, food + walk, quiet time.",
  );
  expect(lines[3]).toBe("What's yours?");
  expect(lines[4]).toMatch(/^http:\/\/localhost:4173\/\?ref=[a-z0-9]{7}$/);
});

test("seven ticks keep the day and start a streak", async ({ page }) => {
  await open(page, "/");
  for (const n of [1, 2, 3, 4, 5, 6]) await page.locator("#chk-" + n).check();
  await expect(page.locator("header b")).toHaveText("0");
  await page.locator("#chk-7").check();
  await expect(page.locator("header b")).toHaveText("1");
  await expect(page.getByTestId("share-text")).toContainText("Streak: 1 day");
});

test("a tick at 01:30 is recorded against the previous date", async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 9, 11, 1, 30) });
  await open(page, "/");
  await page.locator("#chk-8").check();
  const days = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("tenaday.v1")!).days));
  expect(days).toEqual(["2026-10-10"]);
});

test("times follow the wake and bed inputs", async ({ page }) => {
  await open(page, "/");
  const first = page.locator(".day > li").first();
  await expect(first).toContainText("07:00–07:30");
  await page.locator("#wake").fill("06:00");
  await expect(first).toContainText("06:00–06:30");
  await open(page, "/protocol/water/");
  await expect(page.locator("article")).toContainText("06:00–06:30");
});

test("mark done on a protocol page ticks the Today list", async ({ page }) => {
  await open(page, "/protocol/light/");
  await page.getByRole("button", { name: "Mark done today" }).click();
  await expect(page.getByRole("button", { name: "Done today. Undo" })).toBeVisible();
  await page.getByRole("link", { name: "Today", exact: true }).click();
  await expect(page.locator("#chk-2")).toBeChecked();
});

test("the breathing pacer announces each phase", async ({ page }) => {
  await page.clock.install();
  await open(page, "/protocol/sigh/");
  const phase = page.locator(".tool [aria-live]");
  await page.getByRole("button", { name: "Start" }).click();
  // Each phase schedules the next after it renders, so the clock is advanced one phase at a time.
  for (const round of [1, 2, 3]) {
    await expect(phase).toHaveText(`Inhale through the nose (round ${round} of 3)`);
    await page.clock.runFor(2000);
    await expect(phase).toHaveText(`Second, short inhale (round ${round} of 3)`);
    await page.clock.runFor(1000);
    await expect(phase).toHaveText(`Long exhale through the mouth (round ${round} of 3)`);
    await page.clock.runFor(6000);
  }
  await expect(phase).toHaveText("Done. Notice your heart rate.");
  await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
});

test("an explicit theme choice overrides the system setting and persists", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await open(page, "/");
  await page.getByRole("button", { name: "Dark" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(13, 21, 30)");
});

test("an inbound referral code is stored and delete removes everything", async ({ page }) => {
  await open(page, "/?ref=friend7");
  await page.locator("#chk-1").check();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("tenaday.ref")!).from)).toBe("friend7");

  await open(page, "/privacy/");
  page.on("dialog", (d) => d.accept());
  await expect(async () => {
    await page.getByRole("button", { name: "Delete my data on this device" }).click();
    await expect(page.getByRole("status")).toContainText("Deleted", { timeout: 500 });
  }).toPass();
  expect(await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("tenaday")))).toEqual([]);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("a protocol page renders its full content", async ({ page }) => {
    await page.goto("/protocol/light/");
    const body = page.locator("article");
    await expect(page.locator("h1")).toHaveText("Morning light");
    await expect(body).toContainText("Evidence: Strong");
    await expect(body).toContainText("Go outside within 30–60 minutes of waking.");
    await expect(body).toContainText("On a bad day: Drink your morning water outside.");
    await expect(body).toContainText("The strongest of the ten.");
    await expect(body.locator(".studies li")).toHaveCount(5);
    await expect(body).toContainText("which overstates the peak figure");
    await expect(body).toContainText("Never stare at the sun");
    await expect(body).toContainText("00:07:45");
    await expect(page.locator("footer")).toContainText("not medical advice");
    await expect(page.locator("header")).toContainText("Unofficial");
  });

  test("supplement warnings and the protocol 9 note are in the page", async ({ page }) => {
    await page.goto("/supplements/");
    await expect(page.locator("main")).toContainText("above the 4,000 IU daily upper limit");
    await expect(page.locator("main")).toContainText("46% more strokes");
    await expect(page.locator("main")).toContainText("It is not a recommendation to take anything.");
    await page.goto("/protocol/food/");
    await expect(page.locator("article")).toContainText("never gives its number");
  });
});
