// Jira: DS-2 — Edit existing program details
import { expect, test } from '@playwright/test';
import {
  PROGRAMS_URL,
  createProgram,
  login,
  loginAsAdmin,
  openEditProgramDialog,
  programRow,
  uniqueProgramName,
} from './didaxis-programs';

test.describe('DS-2: Edit existing program details (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(PROGRAMS_URL);
  });

  test('TC-001: Edit form shows current program data', async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026');
    const description = 'Full-stack web development program';
    await createProgram(page, programName, description);

    const dialog = await openEditProgramDialog(page, programName);

    await expect(dialog.getByLabel('Program Name')).toHaveValue(programName);
    await expect(dialog.getByLabel('Description')).toHaveValue(description);
  });

  test('TC-002: Program name update reflects immediately in list', async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026');
    const updatedName = `${programName} - Updated`;
    await createProgram(page, programName, 'Original description');

    const dialog = await openEditProgramDialog(page, programName);
    await dialog.getByLabel('Program Name').fill(updatedName);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeHidden();
    await expect(programRow(page, updatedName)).toBeVisible();
    await expect(programRow(page, programName)).toHaveCount(0);
  });

  test('TC-003: Description-only edit leaves name unchanged', async ({ page }) => {
    const programName = uniqueProgramName('Cloud Computing 2026');
    const originalDescription = 'AWS and Azure basics';
    const updatedDescription = 'AWS, Azure, and GCP basics';
    await createProgram(page, programName, originalDescription);

    const dialog = await openEditProgramDialog(page, programName);
    await dialog.getByLabel('Description').fill(updatedDescription);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeHidden();
    const row = programRow(page, programName);
    await expect(row).toBeVisible();
    await expect(row.getByText(updatedDescription)).toBeVisible();
  });

  test('TC-004: Cancel discards unsaved edits', async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026');
    await createProgram(page, programName, 'Keep this description');

    const dialog = await openEditProgramDialog(page, programName);
    await dialog.getByLabel('Program Name').fill('Should Not Persist');
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).toBeHidden();
    await expect(programRow(page, programName)).toBeVisible();
    await expect(programRow(page, 'Should Not Persist')).toHaveCount(0);
  });

  test('TC-005: Save is unavailable when Program Name is cleared', async ({ page }) => {
    const programName = uniqueProgramName('Edit validation');
    await createProgram(page, programName, 'Description');

    const dialog = await openEditProgramDialog(page, programName);
    await dialog.getByLabel('Program Name').fill('');

    await expect(dialog.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  test('TC-007: Edit rejects renaming to an existing duplicate name', async ({ page }) => {
    const firstProgram = uniqueProgramName('Data Science 2026');
    const secondProgram = uniqueProgramName('Web Development 2026');
    await createProgram(page, firstProgram, 'First');
    await createProgram(page, secondProgram, 'Second');

    const dialog = await openEditProgramDialog(page, secondProgram);
    await dialog.getByLabel('Program Name').fill(firstProgram);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByText(/duplicate|already exists/i).first()).toBeVisible();
    await expect(programRow(page, secondProgram)).toBeVisible();
  });

  test('TC-008: Whitespace-only name on edit is treated as invalid', async ({ page }) => {
    const programName = uniqueProgramName('Whitespace edit');
    await createProgram(page, programName, 'Description');

    const dialog = await openEditProgramDialog(page, programName);
    await dialog.getByLabel('Program Name').fill('   ');

    await expect(dialog.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  test('TC-009: Special characters are preserved on rename', async ({ page }) => {
    const programName = uniqueProgramName('Rename base');
    const specialName = `Informatique & IA - Niveau 2 ${Date.now()}`;
    await createProgram(page, programName, 'Description');

    const dialog = await openEditProgramDialog(page, programName);
    await dialog.getByLabel('Program Name').fill(specialName);
    await dialog.getByRole('button', { name: 'Save' }).click();

    await expect(dialog).toBeHidden();
    await expect(programRow(page, specialName)).toBeVisible();
  });

  test('TC-010: Concurrent edit policy is defined', async () => {
    test.fixme(true, 'Requires two isolated admin sessions; not automated in shared test env.');
  });
});

test.describe('DS-2: Edit existing program details (non-admin)', () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.DIDAXIS_NON_ADMIN_EMAIL;
    const password = process.env.DIDAXIS_NON_ADMIN_PASSWORD;
    test.skip(!email || !password, 'Set DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD for TC-006.');

    await login(page, email!, password!);
    await page.goto(PROGRAMS_URL);
  });

  test('TC-006: Non-admin user cannot edit programs', async ({ page }) => {
    const editButtons = page.getByRole('button', { name: /^Edit / });
    await expect(editButtons).toHaveCount(0);
  });
});
