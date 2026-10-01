import { expect, type Locator, type Page } from '@playwright/test';

export const TODO_URL = 'https://demo.playwright.dev/todomvc/#/';

export class TodoPage {
  readonly page: Page;
  readonly newTodo: Locator;
  readonly todoItems: Locator;
  readonly todoTitles: Locator;
  readonly markAll: Locator;
  readonly clearCompleted: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodo = page.getByRole('textbox', { name: 'What needs to be done?' });
    this.todoItems = page.getByTestId('todo-item');
    this.todoTitles = page.getByTestId('todo-title');
    this.markAll = page.getByRole('checkbox', { name: /Mark all as complete/ });
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
  }

  async open() {
    await this.page.goto(TODO_URL);
    await this.page.evaluate(() => localStorage.clear());
    await this.page.reload();
  }

  /** Todo row in the main list (not All / Active / Completed filters). */
  todoRow(title: string) {
    return this.page
      .getByRole('listitem')
      .filter({ has: this.page.getByRole('checkbox', { name: 'Toggle Todo' }) })
      .filter({ has: this.page.getByText(title, { exact: true }) });
  }

  itemsLeft(text: string) {
    return this.page.getByText(text, { exact: true });
  }

  async expectNoTodos() {
    await expect(this.todoItems).toHaveCount(0);
    await expect(this.filter('All')).toHaveCount(0);
    await expect(this.page.getByText(/item left/)).toHaveCount(0);
  }

  async add(title: string) {
    await this.newTodo.fill(title);
    await this.newTodo.press('Enter');
  }

  item(title: string) {
    return this.todoRow(title);
  }

  toggle(title: string) {
    return this.item(title).getByRole('checkbox', { name: 'Toggle Todo' });
  }

  async complete(title: string) {
    await this.toggle(title).check();
  }

  async uncomplete(title: string) {
    await this.toggle(title).uncheck();
  }

  async delete(title: string) {
    const row = this.item(title);
    await row.hover();
    await row.getByRole('button', { name: 'Delete' }).click();
  }

  async startEdit(title: string) {
    await this.item(title).getByTestId('todo-title').dblclick();
    return this.page.getByRole('textbox', { name: 'Edit' });
  }

  filter(name: 'All' | 'Active' | 'Completed') {
    return this.page.getByRole('link', { name, exact: true });
  }

  async expectTitles(titles: string[]) {
    await expect(this.todoTitles).toHaveText(titles);
  }

  async expectCount(text: string) {
    await expect(this.itemsLeft(text)).toBeVisible();
  }

  async expectCompleted(title: string) {
    const row = this.item(title);
    await expect(row).toHaveClass(/completed/);
    await expect(row.getByTestId('todo-title')).toHaveCSS('text-decoration-line', 'line-through');
    await expect(this.toggle(title)).toBeChecked();
  }

  async expectActive(title: string) {
    const row = this.item(title);
    await expect(row).not.toHaveClass(/completed/);
    await expect(row.getByTestId('todo-title')).toHaveCSS('text-decoration-line', 'none');
    await expect(this.toggle(title)).not.toBeChecked();
  }
}
