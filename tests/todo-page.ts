import { expect, type Locator, type Page } from '@playwright/test';

export const TODO_URL = 'https://demo.playwright.dev/todomvc/#/';

export class TodoPage {
  readonly page: Page;
  readonly newTodo: Locator;
  readonly todoItems: Locator;
  readonly todoTitles: Locator;
  readonly todoCount: Locator;
  readonly markAll: Locator;
  readonly clearCompleted: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodo = page.getByRole('textbox', { name: 'What needs to be done?' });
    this.todoItems = page.getByTestId('todo-item');
    this.todoTitles = page.getByTestId('todo-title');
    this.todoCount = page.locator('.todo-count');
    this.markAll = page.getByRole('checkbox', { name: 'Mark all as complete' });
    this.clearCompleted = page.getByRole('button', { name: 'Clear completed' });
    this.footer = page.locator('footer.footer');
  }

  async open() {
    await this.page.goto(TODO_URL);
  }

  async add(title: string) {
    await this.newTodo.fill(title);
    await this.newTodo.press('Enter');
  }

  item(title: string) {
    return this.todoItems.filter({
      has: this.page.getByTestId('todo-title').getByText(title, { exact: true }),
    });
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
    await expect(this.todoCount).toHaveText(text);
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
