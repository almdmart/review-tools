import { expect, test } from "@playwright/test";
import fs from "node:fs";

const pageErrors: string[] = [];

test.beforeEach(async ({ page }) => {
  pageErrors.length = 0;
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.goto("/");
  await expect(page.locator("[data-hydrated='true']")).toBeVisible();
  await expect(page.getByTestId("save-status")).toHaveText("Saved locally");
});

test.afterEach(() => {
  expect(pageErrors).toEqual([]);
});

test("updates the participant name in the preview", async ({ page }) => {
  await page.getByTestId("participant-name").fill("Karim");
  await expect(page.getByTestId("preview-name")).toHaveText("Karim");
  await page.getByTestId("participant-status").fill("Active 5m ago");
  await expect(page.getByTestId("preview-status")).toHaveText("Active 5m ago");
});

test("adds participant and self text, including Bangla and emoji", async ({ page }) => {
  await page.getByTestId("add-participant").click();
  const participant = page.getByRole("textbox", { name: "Message text" }).last();
  await participant.fill("আজ কেমন আছো?");
  await expect(page.getByTestId("preview-thread")).toContainText("আজ কেমন আছো?");

  await page.getByTestId("add-self").click();
  const mine = page.getByRole("textbox", { name: "Message text" }).last();
  await mine.fill("Hi ");
  await page.getByRole("button", { name: "Insert emoji" }).last().click();
  const emojiButton = page.locator("button.epr-emoji").first();
  await expect(emojiButton).toBeVisible();
  const emoji = (await emojiButton.innerText()).trim();
  await emojiButton.click();
  await expect(page.getByTestId("preview-thread")).toContainText(`Hi ${emoji}`);
  await expect(page.locator("[data-testid='bubble'][data-sender='self']").last()).toBeVisible();
});

test("uploads a portrait image and keeps its aspect ratio", async ({ page }) => {
  await page.locator("input[aria-label='Message image']").setInputFiles("e2e/fixtures/portrait.png");
  const image = page.getByTestId("image-bubble").last();
  await expect(image).toBeVisible();
  await expect.poll(async () => image.evaluate((node) => (node as HTMLImageElement).naturalHeight)).toBeGreaterThan(0);
  const size = await image.evaluate((node) => {
    const element = node as HTMLImageElement;
    return { width: element.clientWidth, height: element.clientHeight };
  });
  expect(size.height).toBeGreaterThan(size.width);
  expect(size.width).toBeLessThanOrEqual(240);
});

test("changes sender, reorders, duplicates, and deletes", async ({ page }) => {
  const first = page.getByTestId("message-card").first();
  await first.getByLabel("Sender").click();
  await page.getByRole("option", { name: "Me" }).click();
  await expect(page.getByTestId("bubble").first()).toHaveAttribute("data-sender", "self");

  const before = await page.getByTestId("message-card").count();
  await first.getByRole("button", { name: "Duplicate message" }).click();
  await expect(page.getByTestId("message-card")).toHaveCount(before + 1);

  const firstText = page.getByRole("textbox", { name: "Message text" }).first();
  await firstText.fill("First bubble");
  await page.getByTestId("message-card").first().getByRole("button", { name: "Move down" }).click();
  await expect(page.getByTestId("bubble").nth(1)).toContainText("First bubble");

  await page.getByTestId("message-card").first().getByRole("button", { name: "Delete message" }).click();
  await expect(page.getByTestId("message-card")).toHaveCount(before);
});

test("scrolls a long conversation inside the phone", async ({ page }) => {
  await page.getByRole("button", { name: "Add 5" }).click();
  await page.getByRole("button", { name: "Add 5" }).click();
  await page.getByRole("button", { name: "Add 5" }).click();
  const thread = page.getByTestId("preview-thread");
  await expect.poll(async () => thread.evaluate((node) => node.scrollHeight > node.clientHeight + 20)).toBe(true);
  const header = await page.getByTestId("messenger-header").boundingBox();
  const composer = await page.getByTestId("messenger-composer").boundingBox();
  await thread.evaluate((node) => {
    node.scrollTop = 0;
  });
  const headerAfter = await page.getByTestId("messenger-header").boundingBox();
  const composerAfter = await page.getByTestId("messenger-composer").boundingBox();
  expect(headerAfter?.y).toBe(header?.y);
  expect(composerAfter?.y).toBe(composer?.y);
  const scrolled = await thread.evaluate((node) => node.scrollTop === 0 && node.scrollHeight > node.clientHeight);
  expect(scrolled).toBe(true);
});

test("restores the project after refresh", async ({ page }) => {
  await page.getByTestId("participant-name").fill("Persistent Name");
  await expect(page.getByTestId("save-status")).toHaveText("Saved locally");
  await page.reload();
  await expect(page.locator("[data-hydrated='true']")).toBeVisible();
  await expect(page.getByTestId("participant-name")).toHaveValue("Persistent Name");
});

test("exports and imports a project file", async ({ page }) => {
  await page.getByTestId("participant-name").fill("Exported Person");
  await expect(page.getByTestId("save-status")).toHaveText("Saved locally");
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-project").click();
  const download = await downloadPromise;
  const filePath = await download.path();
  expect(filePath).toBeTruthy();
  await page.getByTestId("participant-name").fill("Temporary");
  await page.getByTestId("import-input").setInputFiles(filePath!);
  await expect(page.getByTestId("participant-name")).toHaveValue("Exported Person");
});

test("rejects an invalid project file", async ({ page }) => {
  await page.getByTestId("import-input").setInputFiles("e2e/fixtures/invalid.json");
  await expect(page.getByText("That file is not valid JSON.")).toBeVisible();
});

test("exports a PNG of the phone preview", async ({ page }) => {
  const downloadPromise = page.waitForEvent("download");
  await page.getByTestId("export-image").click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.png$/);
  const filePath = await download.path();
  const size = fs.statSync(filePath!).size;
  expect(size).toBeGreaterThan(5000);
});

test("switches between editor and preview on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("tab-editor")).toBeVisible();
  await expect(page.getByTestId("preview-screen")).toBeHidden();
  await page.getByTestId("tab-preview").click();
  await expect(page.getByTestId("preview-screen")).toBeVisible();
  await expect(page.getByTestId("participant-name")).toBeHidden();
});

test("asks for confirmation before reset", async ({ page }) => {
  await page.getByTestId("participant-name").fill("Do not lose me");
  await page.getByTestId("reset-project").click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByTestId("participant-name")).toHaveValue("Do not lose me");
  await page.getByTestId("reset-project").click();
  await page.getByRole("dialog").getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("participant-name")).toHaveValue("Rahim");
  await expect(page.getByTestId("preview-thread")).toContainText("দারুণ");
});

test("uploads a participant photo", async ({ page }) => {
  await page.locator("input[aria-label='Participant photo']").setInputFiles("e2e/fixtures/photo.png");
  await expect(page.getByTestId("messenger-header").locator("img")).toBeVisible();
});
