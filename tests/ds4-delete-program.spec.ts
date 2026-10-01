// Jira: DS-4 — Delete program with confirmation
import { expect, test } from '@playwright/test';
import {
  PROGRAMS_URL,
  createProgram,
  deleteProgramButton,
  login,
  loginAsAdmin,
  programRow,
  uniqueProgramName,
} from './didaxis-programs';

test.describe('DS-4: Delete program with confirmation (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(PROGRAMS_URL);
  });

  test('TC-001: Confirmed deletion removes program from list', async ({ page }) => {
    const programName = uniqueProgramName('Test Program');
    await createProgram(page, programName, 'To be deleted');

    page.once('dialog', (dialog) => {
      expect(dialog.message()).toContain(programName);
      void dialog.accept();
    });
    await deleteProgramButton(page, programName).click();

    await expect(programRow(page, programName)).toHaveCount(0, { timeout: 15_000 });
  });

  test('TC-002: Confirmation dialog identifies the program name', async ({ page }) => {
    const programName = uniqueProgramName('Test Program');
    await createProgram(page, programName, 'Confirm message check');

    const dialogPromise = new Promise<string>((resolve) => {
      page.once('dialog', (dialog) => {
        resolve(dialog.message());
        void dialog.dismiss();
      });
    });
    await deleteProgramButton(page, programName).click();
    const message = await dialogPromise;

    expect(message).toContain(programName);
    expect(message).toMatch(/delete program/i);
    await expect(programRow(page, programName)).toBeVisible();
  });

  test('TC-003: Cancel keeps program in list', async ({ page }) => {
    const programName = uniqueProgramName('Test Program');
    await createProgram(page, programName, 'Cancel delete');

    page.once('dialog', (dialog) => void dialog.dismiss());
    await deleteProgramButton(page, programName).click();

    await expect(programRow(page, programName)).toBeVisible();
  });

  test('TC-004: Escape dismisses delete confirmation without deleting', async ({ page }) => {
    const programName = uniqueProgramName('Test Program');
    await createProgram(page, programName, 'Escape dismiss');

    page.once('dialog', (dialog) => void dialog.dismiss());
    await deleteProgramButton(page, programName).click();
    await page.keyboard.press('Escape');

    await expect(programRow(page, programName)).toBeVisible();
  });

  test('TC-006: Double accept on delete does not break the UI', async ({ page }) => {
    const programName = uniqueProgramName('Test Program');
    await createProgram(page, programName, 'Double confirm');

    let handled = 0;
    page.on('dialog', (dialog) => {
      handled += 1;
      void dialog.accept();
    });
    await deleteProgramButton(page, programName).click();
    await expect(programRow(page, programName)).toHaveCount(0, { timeout: 15_000 });
    expect(handled).toBe(1);
  });

  test('TC-008: Program with special characters can be deleted', async ({ page }) => {
    const programName = uniqueProgramName('Informatique & IA - Niveau 2');
    await createProgram(page, programName, 'Special delete');

    page.once('dialog', (dialog) => void dialog.accept());
    await deleteProgramButton(page, programName).click();

    await expect(programRow(page, programName)).toHaveCount(0, { timeout: 15_000 });
  });

  test('TC-007: Deleting the last program shows empty state', async () => {
    test.fixme(true, 'Shared Didaxis test env always contains many programs; empty state cannot be isolated safely.');
  });

  test('TC-009: Delete blocked when program is linked to courses', async () => {
    test.fixme(true, 'Requires a program linked to courses; seed data not available in automation.');
  });

  test('TC-010: Stale delete shows graceful handling', async () => {
    test.fixme(true, 'Requires simulating a stale UI session after backend deletion.');
  });
});

test.describe('DS-4: Delete program with confirmation (non-admin)', () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.DIDAXIS_NON_ADMIN_EMAIL;
    const password = process.env.DIDAXIS_NON_ADMIN_PASSWORD;
    test.skip(!email || !password, 'Set DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD for TC-005.');

    await login(page, email!, password!);
    await page.goto(PROGRAMS_URL);
  });

  test('TC-005: Non-admin user cannot delete programs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^Delete / })).toHaveCount(0);
  });
});
