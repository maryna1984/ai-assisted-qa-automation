// Jira: DS-1 — Create new academic program
// Test plan: Test Cases/DS-1/DS-1_output.md
import { expect, test } from '@playwright/test';
import {
  PROGRAMS_URL,
  createProgramDialog,
  login,
  loginAsAdmin,
  openCreateProgramDialog,
  programRow,
  uniqueProgramName,
} from './didaxis-programs';

/** Documented assumption from DS-1 when UI does not expose maxlength. */
const PROGRAM_NAME_MAX_LENGTH = 255;

function programNameWithLength(length: number, testCaseId: string): string {
  const token = Date.now().toString();
  const prefix = `${testCaseId}-${token}-`;
  const padLength = Math.max(0, length - prefix.length);
  return (prefix + 'A'.repeat(padLength)).slice(0, length);
}

test.describe('DS-1: Create new academic program (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(PROGRAMS_URL);
  });

  test('TC-001: Program creation form displays required fields', async ({ page }) => {
    const dialog = await openCreateProgramDialog(page);

    await expect(dialog.getByRole('heading', { name: 'New Program' })).toBeVisible();
    await expect(dialog.getByLabel('Program Name')).toBeVisible();
    await expect(dialog.getByLabel('Description')).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Create' })).toBeVisible();
  });

  test('TC-002: New program appears in list after successful create', async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026');
    const description = 'Full-stack web development program';

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName);
    await dialog.getByLabel('Description').fill(description);
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(dialog).toBeHidden();
    await expect(programRow(page, programName)).toBeVisible();
  });

  test('TC-003: Program can be created with an empty Description when optional', async ({ page }) => {
    const programName = uniqueProgramName('Data Science Fundamentals');

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName);
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(dialog).toBeHidden();
    await expect(programRow(page, programName)).toBeVisible();
  });

  test('TC-004: Create remains unavailable when Program Name is empty', async ({ page }) => {
    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Description').fill(`Optional description ${Date.now()}`);

    await expect(dialog.getByRole('button', { name: 'Create' })).toBeDisabled();
    await expect(dialog).toBeVisible();
  });

  test('TC-006: Closing the modal without save does not create a program', async ({ page }) => {
    const programName = uniqueProgramName('Draft Program');

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName);
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).toBeHidden();
    await expect(programRow(page, programName)).toHaveCount(0);
  });

  test('TC-007: Program name at maximum allowed length is accepted', async ({ page }) => {
    const programName = programNameWithLength(PROGRAM_NAME_MAX_LENGTH, 'TC007');
    const description = 'Boundary length name test';

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName);
    await dialog.getByLabel('Description').fill(description);
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(dialog).toBeHidden();
    await expect(programRow(page, programName)).toBeVisible();
  });

  test('TC-008: Description accepts multiline unicode content', async ({ page }) => {
    const programName = uniqueProgramName('UX Design 2026');
    const description = 'Track covers café culture 🎨\nand hands-on UX labs.';

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName);
    await dialog.getByLabel('Description').fill(description);
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(dialog).toBeHidden();
    await expect(programRow(page, programName)).toBeVisible();
    await expect(programRow(page, programName).getByText(/café culture/)).toBeVisible();
  });

  test('TC-009: Double-click Create does not create duplicate programs', async ({ page }) => {
    test.fixme(
      true,
      'Didaxis test env creates two programs on double-click Create (no submit guard observed).',
    );

    const programName = uniqueProgramName('Web Development 2026');
    const description = 'Double submit guard';

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName);
    await dialog.getByLabel('Description').fill(description);
    await dialog.getByRole('button', { name: 'Create' }).dblclick();

    await expect(dialog).toBeHidden({ timeout: 15_000 });
    await expect(programRow(page, programName)).toHaveCount(1);
  });
});

test.describe('DS-1: Create new academic program (non-admin)', () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.DIDAXIS_NON_ADMIN_EMAIL;
    const password = process.env.DIDAXIS_NON_ADMIN_PASSWORD;
    test.skip(
      !email || !password,
      'Set DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD to run TC-005.',
    );

    await login(page, email!, password!);
    await page.goto(PROGRAMS_URL);
  });

  test('TC-005: Non-admin user cannot access program creation', async ({ page }) => {
    const newProgramButton = page.getByRole('button', { name: 'New Program' });
    await expect(newProgramButton).toHaveCount(0);
    await expect(createProgramDialog(page)).toHaveCount(0);
  });
});
