import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("loads the checklist with its initial progress", async ({ page }) => {
  await expect(page).toHaveTitle("Launch checklist | Preview lab");
  await expect(page.getByRole("heading", { name: "Launch checklist", exact: true })).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(3);
  await expect(page.getByRole("checkbox", { name: "Open the preview", exact: true })).toBeChecked();
  await expect(page.getByRole("status")).toHaveText("1 of 3 complete");
});

test("adds a trimmed task using the keyboard", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "New task" });
  await input.fill("  Check the release notes  ");
  await input.press("Enter");

  const task = page.getByRole("checkbox", { name: "Check the release notes", exact: true });
  await expect(task).toBeVisible();
  await expect(task).not.toBeChecked();
  await expect(page.getByRole("listitem").last()).toHaveText("Check the release notes");
  await expect(input).toHaveValue("");
  await expect(page.getByRole("status")).toHaveText("1 of 4 complete");
});

test("rejects blank tasks and recovers after valid input", async ({ page }) => {
  const input = page.getByRole("textbox", { name: "New task" });
  await input.fill("   ");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  const error = page.getByRole("region", { name: "Launch tasks" }).getByRole("alert");
  await expect(error).toHaveText("Enter a task before adding it.");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("checkbox")).toHaveCount(3);

  await input.fill("Review the copy");
  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await expect(error).toHaveCount(0);
  await expect(input).toHaveAttribute("aria-invalid", "false");
  await expect(page.getByRole("checkbox", { name: "Review the copy", exact: true })).toBeVisible();
});

test("completes and reopens a task", async ({ page }) => {
  const task = page.getByRole("checkbox", { name: "Check the mobile layout", exact: true });
  await task.check();
  await expect(task).toBeChecked();
  await expect(page.getByRole("status")).toHaveText("2 of 3 complete");
  await expect(page.getByRole("progressbar", { name: "Checklist progress" })).toHaveAttribute("value", "2");

  await task.uncheck();
  await expect(task).not.toBeChecked();
  await expect(page.getByRole("status")).toHaveText("1 of 3 complete");
});

test("filters tasks and shows an empty state when everything is done", async ({ page }) => {
  await page.getByRole("button", { name: "Completed", exact: true }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(1);
  await expect(page.getByRole("checkbox", { name: "Open the preview", exact: true })).toBeVisible();

  const active = page.getByRole("button", { name: "Active", exact: true });
  await active.click();
  await expect(active).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("checkbox")).toHaveCount(2);
  // Completing an active task removes it, so assert disappearance rather
  // than using check(), which waits to verify the checkbox's checked state.
  const mobileTask = page.getByRole("checkbox", { name: "Check the mobile layout", exact: true });
  await mobileTask.click();
  await expect(mobileTask).toHaveCount(0);
  await page.getByRole("checkbox", { name: "Run the end-to-end tests", exact: true }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.getByText("All clear. Every task is complete.", { exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("3 of 3 complete");

  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.getByRole("checkbox")).toHaveCount(3);
});
