import { expect, test } from '@playwright/test';
import { TodoPage } from './todo-page';

test.describe('React TodoMVC', () => {
  let todo: TodoPage;

  test.beforeEach(async ({ page }) => {
    todo = new TodoPage(page);
    await todo.open();
  });

  test.describe('Positive flows', () => {
    test('TC-001 new todo is appended and the input is cleared', async () => {
      await expect(todo.footer).toHaveCount(0);

      await todo.newTodo.click();
      await todo.add('Buy milk');

      await todo.expectTitles(['Buy milk']);
      await expect(todo.toggle('Buy milk')).not.toBeChecked();
      await expect(todo.newTodo).toHaveValue('');
      await todo.expectCount('1 item left');
      await expect(todo.filter('All')).toHaveClass(/selected/);
    });

    test('TC-002 each new todo is added after the existing items', async () => {
      await todo.add('Buy milk');
      await todo.add('Walk dog');
      await todo.add('Read book');

      await todo.expectTitles(['Buy milk', 'Walk dog', 'Read book']);
      await todo.expectCount('3 items left');
    });

    test('TC-003 completing an item marks it done and reduces the remaining count', async () => {
      await todo.add('Buy milk');
      await todo.add('Walk dog');
      await todo.add('Read book');

      await todo.complete('Buy milk');

      await todo.expectCompleted('Buy milk');
      await todo.expectActive('Walk dog');
      await todo.expectActive('Read book');
      await todo.expectCount('2 items left');
      await expect(todo.clearCompleted).toBeVisible();
    });

    test('TC-004 clearing the checkbox makes a completed item active again', async () => {
      await todo.add('Buy milk');
      await todo.add('Walk dog');
      await todo.add('Read book');
      await todo.complete('Buy milk');

      await todo.uncomplete('Buy milk');

      await todo.expectActive('Buy milk');
      await todo.expectCount('3 items left');
      await expect(todo.clearCompleted).toHaveCount(0);
    });

    test('TC-005 deleting an item removes only that item', async () => {
      await todo.add('Buy milk');
      await todo.add('Walk dog');
      await todo.add('Read book');

      await todo.delete('Walk dog');

      await todo.expectTitles(['Buy milk', 'Read book']);
      await todo.expectCount('2 items left');
    });

    test('TC-006 mark all as complete finishes every item', async () => {
      await todo.add('Buy milk');
      await todo.add('Read book');

      await todo.markAll.check();

      await todo.expectCompleted('Buy milk');
      await todo.expectCompleted('Read book');
      await expect(todo.markAll).toBeChecked();
      await todo.expectCount('0 items left');
      await expect(todo.clearCompleted).toBeVisible();
    });

    test('TC-007 mark all as complete reopens every item when all are already complete', async () => {
      await todo.add('Buy milk');
      await todo.add('Read book');
      await todo.markAll.check();

      await todo.markAll.uncheck();

      await todo.expectActive('Buy milk');
      await todo.expectActive('Read book');
      await todo.expectCount('2 items left');
      await expect(todo.clearCompleted).toHaveCount(0);
    });

    test('TC-008 clear completed removes only finished items', async () => {
      await todo.add('Buy milk');
      await todo.add('Read book');
      await todo.complete('Buy milk');

      await todo.clearCompleted.click();

      await todo.expectTitles(['Read book']);
      await todo.expectActive('Read book');
      await todo.expectCount('1 item left');
      await expect(todo.clearCompleted).toHaveCount(0);
    });

    test('TC-009 filters show the matching items and keep the same remaining count', async ({ page }) => {
      await todo.add('Buy milk');
      await todo.add('Walk dog');
      await todo.add('Read book');
      await todo.complete('Buy milk');

      await todo.filter('Active').click();
      await expect(page).toHaveURL(/#\/active$/);
      await expect(todo.filter('Active')).toHaveClass(/selected/);
      await todo.expectTitles(['Walk dog', 'Read book']);
      await todo.expectCount('2 items left');

      await todo.filter('Completed').click();
      await expect(page).toHaveURL(/#\/completed$/);
      await expect(todo.filter('Completed')).toHaveClass(/selected/);
      await todo.expectTitles(['Buy milk']);
      await todo.expectCount('2 items left');

      await todo.filter('All').click();
      await expect(page).toHaveURL(/todomvc\/#\/$/);
      await expect(todo.filter('All')).toHaveClass(/selected/);
      await todo.expectTitles(['Buy milk', 'Walk dog', 'Read book']);
      await todo.expectCount('2 items left');
    });

    test('TC-010 edited title is saved with Enter', async () => {
      await todo.add('Buy milk');

      const edit = await todo.startEdit('Buy milk');
      await edit.fill('Buy oat milk');
      await edit.press('Enter');

      await expect(todo.page.getByRole('textbox', { name: 'Edit' })).toHaveCount(0);
      await todo.expectTitles(['Buy oat milk']);
      await todo.expectActive('Buy oat milk');
    });

    test('TC-011 edited title is saved when the edit field loses focus', async () => {
      await todo.add('Walk dog');

      const edit = await todo.startEdit('Walk dog');
      await edit.fill('Walk the dog');
      await todo.page.getByRole('heading', { name: 'todos' }).click();

      await expect(todo.page.getByRole('textbox', { name: 'Edit' })).toHaveCount(0);
      await todo.expectTitles(['Walk the dog']);
    });

    test('TC-012 todos remain after the page is reloaded', async ({ page }) => {
      await todo.add('Buy oat milk');
      await todo.add('Read book');
      await todo.complete('Read book');

      await page.reload();

      await todo.expectTitles(['Buy oat milk', 'Read book']);
      await todo.expectActive('Buy oat milk');
      await todo.expectCompleted('Read book');
      await todo.expectCount('1 item left');
    });
  });

  test.describe('Negative flows', () => {
    test('TC-013 an empty entry does not create a todo', async () => {
      await todo.newTodo.press('Enter');

      await expect(todo.todoItems).toHaveCount(0);
      await expect(todo.footer).toHaveCount(0);
      await expect(todo.newTodo).toHaveValue('');
    });

    test('TC-014 a whitespace-only entry does not create a todo', async () => {
      await todo.add('Buy milk');

      await todo.add('   ');

      await todo.expectTitles(['Buy milk']);
      await todo.expectCount('1 item left');
      await expect(todo.newTodo).toHaveValue('   ');
    });

    test('TC-015 completing an item does not remove it from All', async () => {
      await todo.add('Buy milk');
      await expect(todo.filter('All')).toHaveClass(/selected/);

      await todo.complete('Buy milk');

      await todo.expectTitles(['Buy milk']);
      await todo.expectCompleted('Buy milk');
    });

    test('TC-016 deleting one item does not change the other items', async ({ page }) => {
      const dialogs: string[] = [];
      page.on('dialog', (dialog) => {
        dialogs.push(dialog.message());
      });
      await todo.add('Buy milk');
      await todo.add('Walk dog');
      await todo.add('Read book');
      await todo.complete('Walk dog');

      await todo.delete('Buy milk');

      await todo.expectTitles(['Walk dog', 'Read book']);
      await todo.expectCompleted('Walk dog');
      await todo.expectActive('Read book');
      expect(dialogs).toEqual([]);
    });

    test('TC-017 Escape discards an in-progress edit', async () => {
      await todo.add('Buy milk');

      const edit = await todo.startEdit('Buy milk');
      await edit.fill('SHOULD NOT SAVE');
      await edit.press('Escape');

      await expect(todo.page.getByRole('textbox', { name: 'Edit' })).toHaveCount(0);
      await todo.expectTitles(['Buy milk']);
    });

    test('TC-018 markup typed as a title is stored as text', async ({ page }) => {
      const dialogs: string[] = [];
      page.on('dialog', (dialog) => {
        dialogs.push(dialog.message());
      });
      const title = '<script>alert(1)</script>';

      await todo.add(title);

      await todo.expectTitles([title]);
      await todo.expectCount('1 item left');
      expect(dialogs).toEqual([]);
    });

    test('TC-019 there is no separate Add button for a blank submit', async () => {
      await expect(todo.page.getByRole('button', { name: /^add$/i })).toHaveCount(0);
      await expect(todo.page.getByRole('alert')).toHaveCount(0);

      await todo.newTodo.press('Enter');

      await expect(todo.todoItems).toHaveCount(0);
      await expect(todo.page.getByRole('alert')).toHaveCount(0);
    });
  });

  test.describe('Edge cases', () => {
    test('TC-020 leading and trailing spaces are removed from a new title', async () => {
      await todo.add('  Walk dog  ');

      await todo.expectTitles(['Walk dog']);
      await todo.expectCount('1 item left');
    });

    test('TC-021 a duplicate title is allowed', async ({ page }) => {
      const dialogs: string[] = [];
      page.on('dialog', (dialog) => {
        dialogs.push(dialog.message());
      });
      await todo.add('Buy milk');

      await todo.add('Buy milk');

      await expect(todo.todoTitles).toHaveText(['Buy milk', 'Buy milk']);
      await todo.expectCount('2 items left');
      await expect(todo.page.getByRole('alert')).toHaveCount(0);
      expect(dialogs).toEqual([]);
    });

    test('TC-022 letters, symbols, and punctuation are saved as entered', async () => {
      const title = 'Café & "quotes" — ☃';

      await todo.add(title);

      await todo.expectTitles([title]);
      await todo.expectCount('1 item left');
    });

    test('TC-023 a 300-character title is accepted', async () => {
      const title = 'A'.repeat(300);
      await expect(todo.newTodo).not.toHaveAttribute('maxlength');

      await todo.add(title);

      await todo.expectTitles([title]);
      await todo.expectCount('1 item left');
      await expect(todo.newTodo).toHaveValue('');
    });

    test('TC-024 the remaining count uses the singular only for one active item', async () => {
      await todo.add('Buy milk');
      await todo.expectCount('1 item left');

      await todo.add('Walk dog');
      await todo.expectCount('2 items left');

      await todo.markAll.check();
      await todo.expectCount('0 items left');
    });

    test('TC-025 a blank edit removes the item', async () => {
      await todo.add('Buy milk');
      await todo.add('Walk dog');

      const edit = await todo.startEdit('Buy milk');
      await edit.fill('   ');
      await edit.press('Enter');

      await todo.expectTitles(['Walk dog']);
      await todo.expectCount('1 item left');
    });

    test('TC-026 a new item added on the Completed filter is hidden until All', async () => {
      await todo.add('Buy milk');
      await todo.filter('Completed').click();
      await expect(todo.todoItems).toHaveCount(0);
      await todo.expectCount('1 item left');

      await todo.add('Read book');

      await expect(todo.todoItems).toHaveCount(0);
      await todo.expectCount('2 items left');

      await todo.filter('All').click();
      await todo.expectTitles(['Buy milk', 'Read book']);
    });

    test('TC-027 the list and footer disappear when the last item is deleted', async () => {
      await todo.add('Buy milk');

      await todo.delete('Buy milk');

      await expect(todo.todoItems).toHaveCount(0);
      await expect(todo.footer).toHaveCount(0);
      await expect(todo.filter('All')).toHaveCount(0);
      await expect(todo.markAll).toHaveCount(0);
      await expect(todo.newTodo).toBeVisible();
    });

    test('TC-028 Delete stays hidden until the row is hovered', async () => {
      await todo.add('Buy milk');
      const destroy = todo.item('Buy milk').locator('button[aria-label="Delete"]');

      await expect(destroy).toBeHidden();

      await todo.item('Buy milk').hover();

      await expect(destroy).toBeVisible();
    });

    test('TC-029 the new-todo field is ready when the page loads', async ({ page }) => {
      await expect(todo.newTodo).toBeFocused();

      await page.keyboard.type('Buy milk');
      await page.keyboard.press('Enter');

      await todo.expectTitles(['Buy milk']);
    });
  });
});
