import { expect, type Locator, type Page } from '@playwright/test';

export const BASE_URL = process.env.DIDAXIS_URL ?? 'https://test.didaxis.studio';
export const LOGIN_URL = `${BASE_URL}/login`;
export const PROGRAMS_URL = `${BASE_URL}/programs`;

export function requireAdminCredentials(): { email: string; password: string } {
  const email = process.env.DIDAXIS_EMAIL;
  const password = process.env.DIDAXIS_PASSWORD;
  if (!email || !password) {
    throw new Error('Set DIDAXIS_EMAIL and DIDAXIS_PASSWORD in .env before running Didaxis tests.');
  }
  return { email, password };
}

export async function login(page: Page, email: string, password: string) {
  await page.goto(LOGIN_URL);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });
}

export async function loginAsAdmin(page: Page) {
  const { email, password } = requireAdminCredentials();
  await login(page, email, password);
}

export function programsTable(page: Page) {
  return page.getByRole('main').getByRole('table');
}

export function programRow(page: Page, programName: string) {
  return programsTable(page)
    .getByRole('row')
    .filter({ has: page.getByText(programName, { exact: true }) });
}

export function editProgramButton(page: Page, programName: string) {
  return page.getByRole('button', { name: `Edit ${programName}` });
}

export function deleteProgramButton(page: Page, programName: string) {
  return page.getByRole('button', { name: `Delete ${programName}` });
}

export function createProgramDialog(page: Page) {
  return page.getByRole('dialog').filter({
    has: page.getByRole('heading', { name: 'New Program' }),
  });
}

export function editProgramDialog(page: Page) {
  return page.getByRole('dialog').filter({
    has: page.getByRole('heading', { name: 'Edit Program' }),
  });
}

export async function openCreateProgramDialog(page: Page) {
  await page.getByRole('button', { name: 'New Program' }).click();
  const dialog = createProgramDialog(page);
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function openEditProgramDialog(page: Page, programName: string) {
  await editProgramButton(page, programName).click();
  const dialog = editProgramDialog(page);
  await expect(dialog).toBeVisible();
  return dialog;
}

export async function createProgram(
  page: Page,
  programName: string,
  description = 'Automation test program',
) {
  const dialog = await openCreateProgramDialog(page);
  await dialog.getByLabel('Program Name').fill(programName);
  if (description.length > 0) {
    await dialog.getByLabel('Description').fill(description);
  }
  await dialog.getByRole('button', { name: 'Create' }).click();
  await expect(dialog).toBeHidden({ timeout: 15_000 });
  await expect(programRow(page, programName)).toBeVisible();
}

export function programNameCell(row: Locator) {
  return row.locator('p').first();
}

export function programDescriptionCell(row: Locator) {
  return row.locator('p').nth(1);
}

export async function expectDuplicateNameError(page: Page) {
  await expect(page.getByText(/duplicate|already exists/i).first()).toBeVisible({
    timeout: 10_000,
  });
}

export function uniqueProgramName(label: string) {
  return `${label}-${Date.now()}`;
}
