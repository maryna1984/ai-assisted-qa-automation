# Test Plan: React TodoMVC

**Application:** [https://demo.playwright.dev/todomvc/#/](https://demo.playwright.dev/todomvc/#/)
**Page title:** React • TodoMVC

## Acceptance criteria

- User can add a todo item to the list
- User can complete an item
- User can delete an item from the list

## UI under test

| Control | Name in the UI |
| --- | --- |
| New todo field | Textbox placeholder `What needs to be done?` |
| Item checkbox | `Toggle Todo` |
| Complete all | Checkbox label `Mark all as complete` |
| Remove one item | Button `Delete` (shown on hover) |
| Remove finished items | `Clear completed` |
| Filters | `All` (`#/`), `Active` (`#/active`), `Completed` (`#/completed`) |
| Edit field | Textbox `Edit` (opened by double-click) |
| Remaining count | `1 item left` or `N items left` |

## Positive flows

### TC-001 — New todo is appended and the input is cleared
- **Preconditions:** Browser is open on `https://demo.playwright.dev/todomvc/#/`. The list is empty, so the footer is not shown.
- **Steps:**
  1. Click the `What needs to be done?` textbox.
  2. Type `Buy milk`.
  3. Press Enter.
- **Expected result:** The list shows one item, `Buy milk`, with an unchecked `Toggle Todo` checkbox. The textbox is empty. The footer shows `1 item left`, and `All` is selected.

### TC-002 — Each new todo is added after the existing items
- **Preconditions:** The list contains `Buy milk`.
- **Steps:**
  1. Type `Walk dog` in `What needs to be done?`.
  2. Press Enter.
  3. Type `Read book` in `What needs to be done?`.
  4. Press Enter.
- **Expected result:** The list order is `Buy milk`, `Walk dog`, `Read book`. The footer shows `3 items left`.

### TC-003 — Completing an item marks it done and reduces the remaining count
- **Preconditions:** The list contains active items `Buy milk`, `Walk dog`, and `Read book`. `All` is selected. The footer shows `3 items left`.
- **Steps:**
  1. Check `Toggle Todo` on `Buy milk`.
- **Expected result:** `Buy milk` has the completed style (line through the title) and its checkbox stays checked. `Walk dog` and `Read book` stay active. The footer shows `2 items left`. `Clear completed` is visible.

### TC-004 — Clearing the checkbox makes a completed item active again
- **Preconditions:** `Buy milk` is completed. `Walk dog` and `Read book` are active. The footer shows `2 items left`.
- **Steps:**
  1. Uncheck `Toggle Todo` on `Buy milk`.
- **Expected result:** `Buy milk` no longer has a line through it and its checkbox is unchecked. The footer shows `3 items left`. `Clear completed` is not shown.

### TC-005 — Deleting an item removes only that item
- **Preconditions:** The list contains `Buy milk`, `Walk dog`, and `Read book`, all active. The footer shows `3 items left`.
- **Steps:**
  1. Hover over `Walk dog`.
  2. Click `Delete` on `Walk dog`.
- **Expected result:** `Walk dog` is gone. `Buy milk` and `Read book` remain, in that order. The footer shows `2 items left`.

### TC-006 — Mark all as complete finishes every item
- **Preconditions:** The list contains active items `Buy milk` and `Read book`.
- **Steps:**
  1. Check `Mark all as complete`.
- **Expected result:** Both items are completed and struck through. Both `Toggle Todo` checkboxes are checked. `Mark all as complete` is checked. The footer shows `0 items left`. `Clear completed` is visible.

### TC-007 — Mark all as complete reopens every item when all are already complete
- **Preconditions:** `Buy milk` and `Read book` are both completed. `Mark all as complete` is checked. The footer shows `0 items left`.
- **Steps:**
  1. Uncheck `Mark all as complete`.
- **Expected result:** Both items are active again, with no line through. The footer shows `2 items left`. `Clear completed` is not shown.

### TC-008 — Clear completed removes only finished items
- **Preconditions:** `Buy milk` is completed. `Read book` is active. `Clear completed` is visible.
- **Steps:**
  1. Click `Clear completed`.
- **Expected result:** `Buy milk` is removed. `Read book` remains active. The footer shows `1 item left`. `Clear completed` is not shown.

### TC-009 — Filters show the matching items and keep the same remaining count
- **Preconditions:** `Buy milk` is completed. `Walk dog` and `Read book` are active. The footer shows `2 items left`.
- **Steps:**
  1. Click `Active`.
  2. Click `Completed`.
  3. Click `All`.
- **Expected result:**
  1. The URL hash is `#/active`. `Active` is selected. The list shows `Walk dog` and `Read book` only. The footer still shows `2 items left`.
  2. The URL hash is `#/completed`. `Completed` is selected. The list shows `Buy milk` only. The footer still shows `2 items left`.
  3. The URL hash is `#/`. `All` is selected. The list shows `Buy milk`, `Walk dog`, and `Read book`.

### TC-010 — Edited title is saved with Enter
- **Preconditions:** The list contains `Buy milk`.
- **Steps:**
  1. Double-click the `Buy milk` title.
  2. In the `Edit` textbox, replace the text with `Buy oat milk`.
  3. Press Enter.
- **Expected result:** Edit mode closes. The item title is `Buy oat milk`. The item stays in the same position and keeps its completed or active state.

### TC-011 — Edited title is saved when the edit field loses focus
- **Preconditions:** The list contains `Walk dog`.
- **Steps:**
  1. Double-click the `Walk dog` title.
  2. In the `Edit` textbox, replace the text with `Walk the dog`.
  3. Click outside the edit field.
- **Expected result:** Edit mode closes. The item title is `Walk the dog`.

### TC-012 — Todos remain after the page is reloaded
- **Preconditions:** The list contains active `Buy oat milk` and completed `Read book`.
- **Steps:**
  1. Reload `https://demo.playwright.dev/todomvc/#/`.
- **Expected result:** Both items are still listed in the same order. `Buy oat milk` is active. `Read book` is completed. The remaining count matches the number of active items.

## Negative flows

### TC-013 — An empty entry does not create a todo
- **Preconditions:** The list is empty. Focus is in `What needs to be done?`.
- **Steps:**
  1. Leave the textbox empty.
  2. Press Enter.
- **Expected result:** No item is added. The footer and the todo list stay hidden. The textbox stays empty.

### TC-014 — A whitespace-only entry does not create a todo
- **Preconditions:** The list contains `Buy milk`. The footer shows `1 item left`.
- **Steps:**
  1. Type three spaces in `What needs to be done?`.
  2. Press Enter.
- **Expected result:** The list still contains only `Buy milk`. The footer still shows `1 item left`. The textbox still contains the three spaces.

### TC-015 — Completing an item does not remove it from All
- **Preconditions:** `All` is selected. The list contains active `Buy milk`.
- **Steps:**
  1. Check `Toggle Todo` on `Buy milk`.
- **Expected result:** `Buy milk` is still visible under `All`, with a line through the title. It is not deleted.

### TC-016 — Deleting one item does not change the other items
- **Preconditions:** The list contains `Buy milk`, `Walk dog`, and `Read book`. `Walk dog` is completed. The others are active.
- **Steps:**
  1. Hover over `Buy milk`.
  2. Click `Delete` on `Buy milk`.
- **Expected result:** `Buy milk` is removed. `Walk dog` stays completed. `Read book` stays active. No confirmation dialog appears.

### TC-017 — Escape discards an in-progress edit
- **Preconditions:** The list contains `Buy milk`.
- **Steps:**
  1. Double-click the `Buy milk` title.
  2. In the `Edit` textbox, replace the text with `SHOULD NOT SAVE`.
  3. Press Escape.
- **Expected result:** Edit mode closes. The title is still `Buy milk`.

### TC-018 — Markup typed as a title is stored as text
- **Preconditions:** The list is empty.
- **Steps:**
  1. Type `<script>alert(1)</script>` in `What needs to be done?`.
  2. Press Enter.
- **Expected result:** One item is added whose visible title is the literal text `<script>alert(1)</script>`. No alert runs. The footer shows `1 item left`.

### TC-019 — There is no separate Add button for a blank submit
- **Preconditions:** The list is empty. The page has just loaded.
- **Steps:**
  1. Look for a submit or Add button next to `What needs to be done?`.
  2. Press Enter with the textbox empty.
- **Expected result:** The only way to add an item is Enter in `What needs to be done?`. An empty Enter does not add an item and does not show an error message.

## Edge cases

### TC-020 — Leading and trailing spaces are removed from a new title
- **Preconditions:** The list is empty.
- **Steps:**
  1. Type `  Walk dog  ` in `What needs to be done?`, with two spaces before and after the words.
  2. Press Enter.
- **Expected result:** The saved title is `Walk dog`, without the extra spaces. The footer shows `1 item left`.

### TC-021 — A duplicate title is allowed
- **Preconditions:** The list already contains `Buy milk`.
- **Steps:**
  1. Type `Buy milk` in `What needs to be done?`.
  2. Press Enter.
- **Expected result:** The list contains two items titled `Buy milk`. The remaining count increases by 1. No duplicate warning is shown.

### TC-022 — Letters, symbols, and punctuation are saved as entered
- **Preconditions:** The list is empty.
- **Steps:**
  1. Type `Café & "quotes" — ☃` in `What needs to be done?`.
  2. Press Enter.
- **Expected result:** The item title is exactly `Café & "quotes" — ☃`. The footer shows `1 item left`.

### TC-023 — A 300-character title is accepted
- **Preconditions:** The list is empty. The `What needs to be done?` field has no `maxlength`.
- **Steps:**
  1. Type a string of 300 `A` characters in `What needs to be done?`.
  2. Press Enter.
- **Expected result:** One item is created whose title is those 300 characters. The footer shows `1 item left`. The field does not truncate the value.

### TC-024 — The remaining count uses the singular only for one active item
- **Preconditions:** The list is empty.
- **Steps:**
  1. Add `Buy milk` and read the footer.
  2. Add `Walk dog` and read the footer.
  3. Check `Mark all as complete` and read the footer.
- **Expected result:** The footer text is `1 item left`, then `2 items left`, then `0 items left`. The word is `item` only when exactly one item is active.

### TC-025 — A blank edit removes the item
- **Preconditions:** The list contains `Buy milk` and `Walk dog`.
- **Steps:**
  1. Double-click the `Buy milk` title.
  2. Clear the `Edit` textbox so it contains only spaces.
  3. Press Enter.
- **Expected result:** `Buy milk` is removed. `Walk dog` remains. The remaining count decreases by 1 if `Buy milk` was active.

### TC-026 — A new item added on the Completed filter is hidden until Active or All
- **Preconditions:** The list contains active `Buy milk`, so the footer is visible. `Completed` is selected (`#/completed`). No item is completed, so the visible list is empty. The footer shows `1 item left`.
- **Steps:**
  1. Type `Read book` in `What needs to be done?`.
  2. Press Enter.
  3. Click `All`.
- **Expected result:** After Enter, `Read book` is not shown on `Completed` because it is active. The footer shows `2 items left`. After clicking `All`, the list is `Buy milk`, then `Read book`.

### TC-027 — The list and footer disappear when the last item is deleted
- **Preconditions:** The list contains only `Buy milk`.
- **Steps:**
  1. Hover over `Buy milk`.
  2. Click `Delete`.
- **Expected result:** No todo rows remain. The footer, the filters, `Mark all as complete`, and the item list are not shown. `What needs to be done?` stays on the page.

### TC-028 — Delete stays hidden until the row is hovered
- **Preconditions:** The list contains `Buy milk`. The pointer is not over that row.
- **Steps:**
  1. Look at the `Buy milk` row without hovering.
  2. Hover over the `Buy milk` row.
- **Expected result:** Before hover, the `Delete` button is not displayed. During hover, `Delete` is displayed on that row only.

### TC-029 — The new-todo field is ready when the page loads
- **Preconditions:** None. Open a fresh visit to `https://demo.playwright.dev/todomvc/#/`.
- **Steps:**
  1. Load the page.
  2. Type `Buy milk` without clicking the field first, then press Enter.
- **Expected result:** The `What needs to be done?` textbox is focused on load, so the title is entered into that field. `Buy milk` is added to the list.

## Ambiguities and gaps in the acceptance criteria

- The criteria say a user can add, complete, and delete an item, but they do not name the controls. On this page, add is Enter in `What needs to be done?` (there is no Add button), complete is the `Toggle Todo` checkbox, and delete is the hover-only `Delete` button.
- Empty and whitespace-only input is ignored with no error message. The criteria do not say whether that should be rejected or whether a message is required.
- No maximum length is stated. The field has no `maxlength`, and a 300-character title is saved. The criteria do not say whether a limit should exist.
- Duplicate titles are allowed. The criteria do not say whether duplicates should be blocked.
- Titles are trimmed on create. The criteria do not say whether surrounding spaces are part of the title.
- The page also supports edit (`Double-click to edit a todo`), `Mark all as complete`, `Clear completed`, and the `All` / `Active` / `Completed` filters. None of these are in the criteria, including the rule that a whitespace-only edit deletes the item.
- The remaining-count wording (`1 item left`, `2 items left`, `0 items left`) is not specified. `0 items left` keeps the plural `items`.
- Persistence after reload is not in the criteria. The page keeps items in `localStorage` under the key `react-todos`.
- There is no undo, confirmation before delete, or validation message for rejected input. The criteria do not say whether any of those are required.
