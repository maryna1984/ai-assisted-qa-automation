# Test Plan: DS-3 — Program name validation and duplicate prevention

## Positive flows

### TC-001 — Program name with special characters is accepted
- **Preconditions:** Admin on program creation form; no existing program with same name.
- **Steps:**
  1. Program Name: `Informatique & IA - Niveau 2`.
  2. Description: `Advanced track`.
  3. Click **Create**.
- **Expected result:** Program created; appears in list with exact name.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I enter "Informatique & IA - Niveau 2" as the program name
And I fill other required fields
And I click Create
Then the program is created successfully
```

### TC-002 — Trimmed valid name after leading/trailing spaces
- **Preconditions:** Creation form open; name `  Mobile Dev 2026  ` is unique after trim.
- **Steps:**
  1. Enter name with leading/trailing spaces.
  2. Fill Description; click **Create**.
- **Expected result:** Program saved as `Mobile Dev 2026` (trimmed) OR validation message if spaces not allowed mid-save (document behavior).
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I enter "  Mobile Dev 2026  " as the program name
And I fill other required fields
And I click Create
Then the program is created with name "Mobile Dev 2026"
```

## Negative flows

### TC-003 — Whitespace-only name cannot be submitted
- **Preconditions:** Admin on creation form.
- **Steps:**
  1. Program Name: `   ` (spaces only).
  2. Click **Create** (if enabled).
- **Expected result:** Form not submitted; name treated as empty after trim; Create disabled or inline error.
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I enter "   " as the program name
And I click Create
Then the form is not submitted (name is trimmed, treated as empty)
```

### TC-004 — Duplicate program name blocked on create
- **Preconditions:** **Web Development 2026** already exists.
- **Steps:**
  1. Open create form.
  2. Enter **Web Development 2026** and valid Description.
  3. Click **Create**.
- **Expected result:** Clear error (inline or toast): name already exists; list still has single **Web Development 2026**.
- **Priority:** High
- **Gherkin:**
```gherkin
Given a program "Web Development 2026" already exists
When I try to create a new program with the same name
Then I see an error indicating the name already exists
```

### TC-005 — Duplicate check is case-sensitive or insensitive (verify)
- **Preconditions:** Program **Web Development 2026** exists.
- **Steps:**
  1. Create with name `web development 2026`.
  2. Create with name `WEB DEVELOPMENT 2026`.
- **Expected result:** Product-defined: either rejected as duplicate or allowed as distinct (document and align with DB unique index).
- **Priority:** High
- **Gherkin:**
```gherkin
Given a program "Web Development 2026" already exists
When I try to create a new program with the name "web development 2026"
Then I see an error indicating the name already exists or the program is created per case-sensitivity rules
```

### TC-006 — Duplicate after trim
- **Preconditions:** **Web Development 2026** exists.
- **Steps:**
  1. Create with name `  Web Development 2026  `.
- **Expected result:** Rejected as duplicate after trim.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given a program "Web Development 2026" already exists
When I try to create a new program with the name "  Web Development 2026  "
Then I see an error indicating the name already exists
```

## Edge cases

### TC-007 — Maximum length name boundary
- **Preconditions:** Know max length N for Program Name.
- **Steps:**
  1. Create with unique name of length N.
  2. Attempt duplicate of that exact name.
- **Expected result:** First succeeds; second fails with duplicate error, not length error conflation.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given a program exists with a name at maximum allowed length
When I try to create another program with the same name
Then I see an error indicating the name already exists
```

### TC-008 — Names with only special characters (if non-whitespace)
- **Preconditions:** Creation form open.
- **Steps:**
  1. Name: `---`.
  2. Fill Description; submit.
- **Expected result:** Accepted or rejected with business rule message (AC only guarantees `&` and `-` in a longer string).
- **Priority:** Low
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I enter "---" as the program name
And I fill other required fields
And I click Create
Then the program is created or I see a clear validation message
```

### TC-009 — HTML/script in name sanitized or rejected
- **Preconditions:** Creation form open.
- **Steps:**
  1. Name: `<script>alert(1)</script>`.
  2. Submit.
- **Expected result:** No script execution in list; stored value escaped or validation rejects.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given I am on the program creation form
When I enter "<script>alert(1)</script>" as the program name
And I click Create
Then the program is not created with executable content or the name is safely escaped in the UI
```

### TC-010 — Unicode normalization duplicates
- **Preconditions:** Program `Cafe Program` exists.
- **Steps:**
  1. Create `Café Program` (composed vs decomposed unicode if applicable).
- **Expected result:** Duplicate policy documented (often treated as different unless normalized).
- **Priority:** Low
- **Gherkin:**
```gherkin
Given a program "Cafe Program" already exists
When I try to create "Café Program"
Then duplicate handling follows defined unicode normalization rules
```

---

## Ambiguities and gaps in ACs

1. **Case sensitivity** for duplicate names — not specified.
2. **Trim on blur vs on submit** — AC describes outcome on Create only.
3. **Edit flow duplicates** — AC focuses on create; edit rename conflicts not listed here.
4. **Error UX** — Message text, field highlight, and HTTP vs inline error not specified.
5. **Allowed character set** — One positive example with `&` and `-`; full charset not defined.
6. **Uniqueness scope** — Global vs per-organization/tenant not stated.
