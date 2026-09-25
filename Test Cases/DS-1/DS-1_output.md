# Test Plan: DS-1 — Create new academic program

## Positive flows

### TC-001 — Program creation form displays required fields
- **Preconditions:** User is logged in as admin.
- **Steps:**
  1. Navigate to the Programs page.
  2. Click "+ New Program".
- **Expected result:** A program creation form (modal or page) is shown with **Program Name** and **Description** fields and a **Create** action.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am logged in as admin
When I navigate to the Programs page
And I click "+ New Program"
Then I see the program creation form with fields: Program Name, Description
```

### TC-002 — New program appears in list after successful create
- **Preconditions:** User is logged in as admin; program creation form is open.
- **Steps:**
  1. Enter `Web Development 2026` in Program Name.
  2. Enter `Full-stack web development program` in Description.
  3. Click **Create**.
- **Expected result:** The creation modal closes; the Programs list includes a row for **Web Development 2026** with the entered description.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Web Development 2026"
And I fill in Description with "Full-stack web development program"
And I click Create
Then the modal closes
And the program list shows "Web Development 2026"
```

### TC-003 — Program can be created with description only as optional content
- **Preconditions:** User is logged in as admin; creation form is open.
- **Steps:**
  1. Enter `Data Science Fundamentals` in Program Name.
  2. Leave Description empty (if allowed) or enter minimal text per product rules.
  3. Click **Create** if enabled.
- **Expected result:** If Description is optional, program is created and listed; if required, inline validation explains the requirement (document actual behavior).
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "Data Science Fundamentals"
And I leave Description empty
Then the Create button is enabled or disabled according to Description required rules
```

## Negative flows

### TC-004 — Create remains unavailable when Program Name is empty
- **Preconditions:** User is on the program creation form.
- **Steps:**
  1. Clear Program Name.
  2. Optionally fill Description.
  3. Attempt to click **Create**.
- **Expected result:** **Create** is disabled; no program is created; form stays open.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I leave the Program Name field empty
Then the Create button is disabled
```

### TC-005 — Non-admin cannot access program creation
- **Preconditions:** User is logged in with a non-admin role (e.g. instructor or student).
- **Steps:**
  1. Navigate to Programs page.
  2. Look for "+ New Program".
- **Expected result:** "+ New Program" is hidden or disabled; direct URL to create (if any) returns forbidden or redirects.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am logged in as a non-admin user
When I navigate to the Programs page
Then I do not see "+ New Program" or cannot open the program creation form
```

### TC-006 — Closing modal without save does not create a program
- **Preconditions:** Creation form is open with partial data entered.
- **Steps:**
  1. Fill Program Name with `Draft Program`.
  2. Close modal via X, Cancel, or Escape (per UI).
- **Expected result:** Modal closes; **Draft Program** does not appear in the list.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I am on the program creation form
And I fill in Program Name with "Draft Program"
When I close the modal without saving
Then the program list does not show "Draft Program"
```

## Edge cases

### TC-007 — Long program name at system maximum
- **Preconditions:** Admin on creation form; know max length N for Program Name (e.g. 255 if unspecified, verify in UI).
- **Steps:**
  1. Enter a name of exactly N characters.
  2. Fill Description and click **Create**.
  3. Repeat with N+1 characters.
- **Expected result:** N characters succeeds; N+1 is rejected or truncated with clear validation (document actual rule).
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with a string of maximum allowed length
And I click Create
Then the program is created successfully or I see a clear max-length validation message
```

### TC-008 — Description with multiline and unicode content
- **Preconditions:** Admin on creation form.
- **Steps:**
  1. Program Name: `UX Design 2026`.
  2. Description: multiline text including `café`, emoji, and line breaks.
  3. Click **Create**.
- **Expected result:** Program is created; list/detail shows description with formatting preserved or safely normalized (no corruption).
- **Priority:** Low
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I fill in Program Name with "UX Design 2026"
And I fill in Description with multiline unicode text
And I click Create
Then the program list shows "UX Design 2026" with the description stored correctly
```

### TC-009 — Double-click Create does not create duplicate rows
- **Preconditions:** Valid data on creation form.
- **Steps:**
  1. Click **Create** twice rapidly.
- **Expected result:** Exactly one program row appears; no duplicate API submissions or duplicate names (unless duplicate names are allowed elsewhere — see DS-3).
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I am on the program creation form with valid Program Name and Description
When I click Create twice in quick succession
Then only one new program appears in the program list
```

---

## Ambiguities and gaps in ACs

1. **Description required or optional** — AC always fills Description; empty Description behavior is undefined.
2. **Modal vs full page** — AC says "modal closes"; confirm behavior if implementation uses a dedicated route.
3. **Non-admin access** — Only "logged in as admin" is specified; other roles are not covered.
4. **Max length and character set** for Program Name and Description — not specified (partially covered in DS-3 for names).
5. **Success feedback** — No toast/notification AC beyond list update.
6. **Sort order** — New program position in list (top, alphabetical) is not defined.
