# Test Plan: DS-2 — Edit existing program details

## Positive flows

### TC-001 — Edit form shows current program data
- **Preconditions:** Admin logged in; program **Web Development 2026** exists with known Description.
- **Steps:**
  1. Open Programs page.
  2. Click edit icon on **Web Development 2026**.
- **Expected result:** Edit form opens with Program Name and Description matching stored values.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am on the Programs page
And a program "Web Development 2026" exists
When I click the edit icon on "Web Development 2026"
Then I see the edit form pre-populated with the program's current data
```

### TC-002 — Program name update reflects immediately in list
- **Preconditions:** Edit form open for **Web Development 2026**.
- **Steps:**
  1. Change Name to `Web Development 2026 - Updated`.
  2. Click **Save**.
- **Expected result:** Modal closes; list shows **Web Development 2026 - Updated** without full page reload (if SPA).
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am editing "Web Development 2026"
When I change the Name to "Web Development 2026 - Updated"
And I click Save
Then the modal closes
And the program list immediately shows "Web Development 2026 - Updated"
```

### TC-003 — Description-only edit leaves name unchanged
- **Preconditions:** Program exists: Name `Cloud Computing 2026`, Description `AWS and Azure basics`.
- **Steps:**
  1. Open edit for that program.
  2. Change Description to `AWS, Azure, and GCP basics`.
  3. Click **Save**.
- **Expected result:** Name remains **Cloud Computing 2026**; Description updates in list/detail.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am editing a program
When I only change the Description
And I click Save
Then the Name and other fields remain unchanged
```

### TC-004 — Cancel discards unsaved edits
- **Preconditions:** Edit form open with changes not saved.
- **Steps:**
  1. Change Name to `Should Not Persist`.
  2. Click **Cancel** or close modal.
- **Expected result:** List still shows original name; no server update.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I am editing "Web Development 2026"
When I change the Name to "Should Not Persist"
And I click Cancel
Then the program list still shows "Web Development 2026"
```

## Negative flows

### TC-005 — Save disabled when Program Name cleared
- **Preconditions:** Edit form open for an existing program.
- **Steps:**
  1. Clear Program Name.
  2. Attempt **Save**.
- **Expected result:** Save disabled or validation error; existing program data unchanged in list after closing.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am editing a program
When I clear the Program Name field
Then the Save button is disabled or validation prevents submission
```

### TC-006 — Non-admin cannot edit programs
- **Preconditions:** Non-admin logged in; program exists.
- **Steps:**
  1. Open Programs page.
  2. Verify edit icon availability.
- **Expected result:** No edit action or edit API returns forbidden.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am logged in as a non-admin user
And a program "Web Development 2026" exists
When I navigate to the Programs page
Then I cannot edit "Web Development 2026"
```

### TC-007 — Edit rejected when renaming to existing duplicate name
- **Preconditions:** Programs **Web Development 2026** and **Data Science 2026** exist.
- **Steps:**
  1. Edit **Data Science 2026**.
  2. Change Name to **Web Development 2026**.
  3. Click **Save**.
- **Expected result:** Error that name already exists; **Data Science 2026** unchanged in list.
- **Priority:** High
- **Gherkin:**
```gherkin
Given programs "Web Development 2026" and "Data Science 2026" exist
When I edit "Data Science 2026"
And I change the Name to "Web Development 2026"
And I click Save
Then I see an error indicating the name already exists
And the program list still shows "Data Science 2026"
```

## Edge cases

### TC-008 — Whitespace-only name on edit treated as invalid
- **Preconditions:** Edit form open.
- **Steps:**
  1. Set Name to `   `.
  2. Click **Save**.
- **Expected result:** Form not submitted; same rules as create (trim → empty).
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I am editing a program
When I change the Name to "   "
And I click Save
Then the form is not submitted and the name is treated as empty after trim
```

### TC-009 — Special characters preserved on rename
- **Preconditions:** Edit form open.
- **Steps:**
  1. Set Name to `Informatique & IA - Niveau 2`.
  2. Save.
- **Expected result:** List displays exact name; no HTML/script injection in UI.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I am editing a program
When I change the Name to "Informatique & IA - Niveau 2"
And I click Save
Then the program list shows "Informatique & IA - Niveau 2"
```

### TC-010 — Concurrent edit (two admins)
- **Preconditions:** Same program open in two sessions.
- **Steps:**
  1. Admin A saves Name change first.
  2. Admin B saves different Name without refresh.
- **Expected result:** Last-write-wins or conflict message (document product rule); no corrupted record.
- **Priority:** Low
- **Gherkin:**
```gherkin
Given two admins edit the same program concurrently
When both click Save with different names
Then the system applies a defined conflict or last-save policy without data corruption
```

---

## Ambiguities and gaps in ACs

1. **Field label** — AC uses "Name" in one scenario and form may say "Program Name" (DS-1); confirm single label.
2. **Duplicate name on edit** — Not in DS-2 ACs; implied by DS-3 for create only.
3. **Edit entry point** — Only "edit icon"; no row click or kebab menu specified.
4. **Optimistic vs pessimistic UI** — "Immediately shows" implies client update; error rollback not defined.
5. **Programs in use** — Can programs linked to courses be renamed? No constraint in ACs.
