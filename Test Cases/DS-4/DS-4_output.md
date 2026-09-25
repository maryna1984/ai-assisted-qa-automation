# Test Plan: DS-4 — Delete program with confirmation

## Positive flows

### TC-001 — Confirmed deletion removes program from list
- **Preconditions:** Admin logged in; program **Test Program** exists.
- **Steps:**
  1. On Programs page, click delete icon for **Test Program**.
  2. Verify confirmation dialog appears.
  3. Confirm deletion (e.g. **Delete** / **Confirm**).
- **Expected result:** **Test Program** no longer appears in the program list.
- **Priority:** High
- **Gherkin:**
```gherkin
Given a program "Test Program" exists
When I click the delete icon for "Test Program"
Then I see a confirmation dialog
When I confirm deletion
Then "Test Program" is removed from the program list
```

### TC-002 — Confirmation dialog shows identifiable program name
- **Preconditions:** Program **Test Program** exists.
- **Steps:**
  1. Click delete icon for **Test Program**.
- **Expected result:** Dialog text references **Test Program** (or clear context) so user avoids wrong delete.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given a program "Test Program" exists
When I click the delete icon for "Test Program"
Then the confirmation dialog identifies "Test Program"
```

## Negative flows

### TC-003 — Cancel keeps program in list
- **Preconditions:** At least one program exists (e.g. **Test Program**).
- **Steps:**
  1. Click delete icon.
  2. On confirmation dialog, click **Cancel**.
- **Expected result:** Dialog closes; program remains in list unchanged.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I click the delete icon for a program
When I see the confirmation dialog
And I click Cancel
Then the program still exists in the list
```

### TC-004 — Dismiss dialog via Escape or backdrop (if supported)
- **Preconditions:** Delete confirmation open.
- **Steps:**
  1. Press Escape or click outside modal (if product allows).
- **Expected result:** Same as Cancel — no deletion.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I see the confirmation dialog for program deletion
When I dismiss the dialog without confirming
Then the program still exists in the list
```

### TC-005 — Non-admin cannot delete programs
- **Preconditions:** Non-admin user; program exists.
- **Steps:**
  1. Open Programs page.
  2. Attempt delete via UI or API.
- **Expected result:** Delete action unavailable or returns forbidden; program remains.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am logged in as a non-admin user
And a program "Test Program" exists
When I attempt to delete "Test Program"
Then the program is not deleted
```

### TC-006 — Double confirm does not cause error state
- **Preconditions:** Delete confirmation open.
- **Steps:**
  1. Click Confirm twice quickly.
- **Expected result:** Single deletion; no 404 spam or duplicate error toasts.
- **Priority:** Low
- **Gherkin:**
```gherkin
Given I see the confirmation dialog for "Test Program"
When I confirm deletion twice in quick succession
Then "Test Program" is removed once and no duplicate error occurs
```

## Edge cases

### TC-007 — Delete last program transitions to empty state (DS-5)
- **Preconditions:** Only **Test Program** exists in system.
- **Steps:**
  1. Delete **Test Program** with confirmation.
- **Expected result:** List shows empty state message and create-first-program prompt (cross-feature).
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given only the program "Test Program" exists
When I confirm deletion of "Test Program"
Then I see a message indicating no programs have been created
And I see a prompt to create the first program
```

### TC-008 — Delete program with long name or special characters
- **Preconditions:** Program **Informatique & IA - Niveau 2** exists.
- **Steps:**
  1. Delete with confirmation.
- **Expected result:** Removed cleanly; dialog displayed name correctly.
- **Priority:** Low
- **Gherkin:**
```gherkin
Given a program "Informatique & IA - Niveau 2" exists
When I confirm deletion of that program
Then the program is removed from the program list
```

### TC-009 — Delete while program referenced by courses (if applicable)
- **Preconditions:** **Test Program** linked to active courses (if domain supports links).
- **Steps:**
  1. Attempt delete and confirm.
- **Expected result:** Block with explanation OR cascade delete — not specified in ACs (verify with product).
- **Priority:** High
- **Gherkin:**
```gherkin
Given "Test Program" is linked to existing courses
When I confirm deletion of "Test Program"
Then deletion is blocked with a clear message or cascades per business rules
```

### TC-010 — Stale list: delete already removed program
- **Preconditions:** Two browser tabs; program deleted in tab A.
- **Steps:**
  1. In tab B, confirm delete on same program.
- **Expected result:** Graceful message (already deleted); list refreshes.
- **Priority:** Low
- **Gherkin:**
```gherkin
Given "Test Program" was already deleted in another session
When I confirm deletion again from a stale view
Then I see a clear message and the list reflects the current state
```

---

## Ambiguities and gaps in ACs

1. **Confirmation copy and button labels** — Not specified (Delete vs Confirm danger styling).
2. **Soft delete vs hard delete** — Recovery and audit not mentioned.
3. **Dependencies** — Courses, enrollments, or archives blocking delete not in ACs.
4. **Keyboard/accessibility** — Focus trap and default button on dialog not defined.
5. **Undo** — No undo-after-delete requirement.
