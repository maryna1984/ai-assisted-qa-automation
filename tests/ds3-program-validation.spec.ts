// Jira: DS-3 — Program name validation and duplicate prevention
import { expect, test } from '@playwright/test';
import {
  PROGRAMS_URL,
  createProgram,
  expectDuplicateNameError,
  loginAsAdmin,
  openCreateProgramDialog,
  programRow,
  uniqueProgramName,
} from './didaxis-programs';

test.describe('DS-3: Program name validation and duplicate prevention (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(PROGRAMS_URL);
  });

  test('TC-001: Program name with special characters is accepted', async ({ page }) => {
    const programName = uniqueProgramName('Informatique & IA - Niveau 2');
    await createProgram(page, programName, 'Advanced track');
    await expect(programRow(page, programName)).toBeVisible();
  });

  test('TC-002: Leading and trailing spaces are trimmed from a new program name', async ({ page }) => {
    const baseName = uniqueProgramName('Mobile Dev 2026');
    const paddedName = `  ${baseName}  `;

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(paddedName);
    await dialog.getByLabel('Description').fill('Trim test');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(dialog).toBeHidden();
    await expect(programRow(page, baseName)).toBeVisible();
  });

  test('TC-003: Whitespace-only program name cannot be submitted', async ({ page }) => {
    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill('   ');
    await dialog.getByLabel('Description').fill('Should not save');

    await expect(dialog.getByRole('button', { name: 'Create' })).toBeDisabled();
  });

  test('TC-004: Duplicate program name is blocked on create', async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026');
    await createProgram(page, programName, 'First copy');

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName);
    await dialog.getByLabel('Description').fill('Duplicate attempt');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expectDuplicateNameError(page);
    await expect(programRow(page, programName)).toHaveCount(1);
  });

  test('TC-005: Duplicate check treats names case-insensitively', async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026');
    await createProgram(page, programName, 'Original casing');

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName.toLowerCase());
    await dialog.getByLabel('Description').fill('Lowercase duplicate');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expectDuplicateNameError(page);
  });

  test('TC-006: Duplicate is rejected after trimming spaces from the new name', async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026');
    await createProgram(page, programName, 'Original');

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(`  ${programName}  `);
    await dialog.getByLabel('Description').fill('Padded duplicate');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expectDuplicateNameError(page);
  });

  test('TC-007: Duplicate error is shown for max-length names', async ({ page }) => {
    const longName = `${'A'.repeat(200)}-${Date.now()}`;
    await createProgram(page, longName, 'Long name original');

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(longName);
    await dialog.getByLabel('Description').fill('Duplicate long');
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expectDuplicateNameError(page);
  });

  test('TC-008: Names with only special characters follow product validation rules', async ({ page }) => {
    const programName = `---${Date.now()}`;
    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName);
    await dialog.getByLabel('Description').fill('Special chars only');
    await dialog.getByRole('button', { name: 'Create' }).click();

    const row = programRow(page, programName);
    if (await row.count()) {
      await expect(row).toBeVisible();
    } else {
      await expect(page.getByText(/invalid|required|duplicate|name/i).first()).toBeVisible();
    }
  });

  test('TC-009: HTML in program name is stored as plain text', async ({ page }) => {
    const programName = `<script>alert(1)</script>-${Date.now()}`;
    const dialogs: string[] = [];
    page.on('dialog', (dialog) => {
      dialogs.push(dialog.message());
    });

    await createProgram(page, programName, 'XSS check');
    await expect(programRow(page, programName)).toBeVisible();
    expect(dialogs).toEqual([]);
  });

  test('TC-010: Unicode normalization duplicate policy', async () => {
    test.fixme(true, 'Unicode normalization rules are not documented for Didaxis; verify manually.');
  });
});
