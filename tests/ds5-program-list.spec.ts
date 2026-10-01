// Jira: DS-5 — Program list filtering and display
import { expect, test } from '@playwright/test';
import {
  PROGRAMS_URL,
  createProgram,
  login,
  loginAsAdmin,
  openCreateProgramDialog,
  programDescriptionCell,
  programNameCell,
  programRow,
  programsTable,
  uniqueProgramName,
} from './didaxis-programs';

test.describe('DS-5: Program list display (admin)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto(PROGRAMS_URL);
  });

  test('TC-001: Programs list shows name and description for each row', async ({ page }) => {
    const programName = uniqueProgramName('Web Development 2026');
    const description = 'Full-stack web development program';
    await createProgram(page, programName, description);

    const row = programRow(page, programName);
    await expect(programNameCell(row)).toHaveText(programName);
    await expect(programDescriptionCell(row)).toHaveText(description);
  });

  test('TC-002: Empty state when no programs exist', async ({ page }) => {
    const rowCount = await programsTable(page).getByRole('row').count();
    test.skip(rowCount > 2, 'Shared test environment always contains programs.');

    await expect(page.getByText(/no programs have been created/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'New Program' }).or(page.getByText(/create.*first program/i)),
    ).toBeVisible();
  });

  test('TC-003: Empty state CTA opens program creation form', async ({ page }) => {
    const rowCount = await programsTable(page).getByRole('row').count();
    test.skip(rowCount > 2, 'Shared test environment always contains programs.');

    const cta = page.getByRole('button', { name: 'New Program' });
    await cta.click();
    await expect(page.getByRole('heading', { name: 'New Program' })).toBeVisible();
  });

  test('TC-005: Failed programs load shows error instead of misleading empty list', async ({ page }) => {
    await page.route('**/programs**', (route) => route.abort('failed'));
    await page.goto(PROGRAMS_URL);

    await expect(page.getByText(/error|failed|try again|retry/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(programsTable(page)).toHaveCount(0);
  });

  test('TC-006: Long description is visible in the program row', async ({ page }) => {
    const programName = uniqueProgramName('Long description');
    const description = `${'Long description '.repeat(40)}`.trim();
    await createProgram(page, programName, description);

    const row = programRow(page, programName);
    await expect(programDescriptionCell(row)).toContainText('Long description');
  });

  test('TC-007: Program with empty description is shown consistently', async ({ page }) => {
    const programName = uniqueProgramName('Minimal Program');
    await createProgram(page, programName, '');

    const row = programRow(page, programName);
    await expect(programNameCell(row)).toHaveText(programName);
    await expect(programDescriptionCell(row)).toHaveText('');
  });

  test('TC-009: Large program list remains reachable in the UI', async ({ page }) => {
    const table = programsTable(page);
    await expect(table).toBeVisible();
    const rows = await table.getByRole('row').count();
    expect(rows).toBeGreaterThan(10);
  });

  test('TC-008: Special characters render safely in name and description', async ({ page }) => {
    const programName = uniqueProgramName('Informatique & IA - Niveau 2');
    const description = 'Covers TLS 1.3 & "secure by design" — 100% hands-on.';
    await createProgram(page, programName, description);

    const row = programRow(page, programName);
    await expect(programNameCell(row)).toHaveText(programName);
    await expect(programDescriptionCell(row)).toHaveText(description);
  });

  test('TC-010: List updates after create without manual refresh', async ({ page }) => {
    const programName = uniqueProgramName('New Program 2026');
    const description = 'Test desc';

    const dialog = await openCreateProgramDialog(page);
    await dialog.getByLabel('Program Name').fill(programName);
    await dialog.getByLabel('Description').fill(description);
    await dialog.getByRole('button', { name: 'Create' }).click();

    await expect(programRow(page, programName)).toBeVisible();
    await expect(programDescriptionCell(programRow(page, programName))).toHaveText(description);
  });
});

test.describe('DS-5: Program list display (non-admin)', () => {
  test.beforeEach(async ({ page }) => {
    const email = process.env.DIDAXIS_NON_ADMIN_EMAIL;
    const password = process.env.DIDAXIS_NON_ADMIN_PASSWORD;
    test.skip(!email || !password, 'Set DIDAXIS_NON_ADMIN_EMAIL and DIDAXIS_NON_ADMIN_PASSWORD for TC-004.');

    await login(page, email!, password!);
    await page.goto(PROGRAMS_URL);
  });

  test('TC-004: Non-admin empty state does not expose unauthorized create', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New Program' })).toHaveCount(0);
  });
});
