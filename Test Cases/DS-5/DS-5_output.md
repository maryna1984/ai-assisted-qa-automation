# Test Plan: DS-5 — Program list filtering and display

## Positive flows

### TC-001 — Programs list shows name and description for each row
- **Preconditions:** Admin logged in; multiple programs exist, e.g. **Web Development 2026** / `Full-stack web development program` and **Data Science 2026** / `Statistics and ML`.
- **Steps:**
  1. Navigate to Programs page.
- **Expected result:** Each program row displays its **name** and **description** visibly (not truncated beyond agreed UX without expand).
- **Priority:** High
- **Gherkin:**
```gherkin
Given programs exist in the system
When I navigate to the Programs page
Then I see a list showing each program's name and description
```

### TC-002 — Empty state when no programs exist
- **Preconditions:** No programs in system (fresh tenant or all deleted).
- **Steps:**
  1. Navigate to Programs page.
- **Expected result:** Message that no programs have been created; CTA/prompt to create the first program (e.g. link or **+ New Program** emphasis).
- **Priority:** High
- **Gherkin:**
```gherkin
Given no programs exist
When I navigate to the Programs page
Then I see a message indicating no programs have been created
And I see a prompt to create the first program
```

### TC-003 — Empty state CTA opens creation flow
- **Preconditions:** No programs exist; admin logged in.
- **Steps:**
  1. Open Programs page.
  2. Use empty-state prompt to create first program.
- **Expected result:** Program creation form opens (same as **+ New Program**).
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given no programs exist
And I am logged in as admin
When I navigate to the Programs page
And I follow the prompt to create the first program
Then I see the program creation form
```

## Negative flows

### TC-004 — Non-admin empty state does not expose unauthorized create
- **Preconditions:** No programs; non-admin logged in.
- **Steps:**
  1. Open Programs page.
- **Expected result:** Empty message shown; create prompt hidden or disabled per role.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given no programs exist
And I am logged in as a non-admin user
When I navigate to the Programs page
Then I see the empty state message
And I do not see an actionable create prompt I cannot use
```

### TC-005 — List does not show stale data after failed load
- **Preconditions:** Simulate API failure loading programs.
- **Steps:**
  1. Navigate to Programs page.
- **Expected result:** Error state with retry — not incorrect empty state or phantom rows (document UX).
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given the programs API fails to load
When I navigate to the Programs page
Then I see an error message with retry option
And I do not see a misleading empty program list
```

## Edge cases

### TC-006 — Long description display
- **Preconditions:** Program with 500+ character Description exists.
- **Steps:**
  1. Open Programs page.
- **Expected result:** Truncation with tooltip/expand OR full wrap — readable without breaking layout.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given a program exists with a very long description
When I navigate to the Programs page
Then the description is displayed without breaking the layout
```

### TC-007 — Program with empty description in list
- **Preconditions:** Program **Minimal Program** with blank Description exists.
- **Steps:**
  1. Open Programs page.
- **Expected result:** Name shown; description shows em dash, "—", or empty placeholder — consistent across rows.
- **Priority:** Low
- **Gherkin:**
```gherkin
Given a program exists with an empty description
When I navigate to the Programs page
Then I see the program name and a consistent empty description presentation
```

### TC-008 — Many programs (pagination or virtual scroll)
- **Preconditions:** 50+ programs seeded.
- **Steps:**
  1. Open Programs page; scroll or paginate.
- **Expected result:** All programs reachable; performance acceptable (AC title mentions "filtering" but ACs only cover display — see gaps).
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given more than fifty programs exist
When I navigate to the Programs page
Then I can view all programs via scrolling or pagination
```

### TC-009 — Special characters in name and description render safely
- **Preconditions:** Program **Informatique & IA - Niveau 2** with Description containing `<b>not html</b>`.
- **Steps:**
  1. View list.
- **Expected result:** Text rendered as plain text; no HTML injection.
- **Priority:** Medium
- **Gherkin:**
```gherkin
Given a program exists with special characters in name and description
When I navigate to the Programs page
Then name and description are displayed as plain text without script execution
```

### TC-010 — List updates after create without manual refresh
- **Preconditions:** Programs page open.
- **Steps:**
  1. Create **New Program 2026** from modal.
  2. Observe list.
- **Expected result:** New row appears with name and description (integration with DS-1).
- **Priority:** High
- **Gherkin:**
```gherkin
Given I am on the Programs page
When I create a new program "New Program 2026" with description "Test desc"
Then the list shows "New Program 2026" and "Test desc" without manual refresh
```

---

## Ambiguities and gaps in ACs

1. **"Filtering" in ticket title** — ACs only cover display and empty state; no search, sort, or filter criteria defined.
2. **Exact empty-state copy and CTA** — Wording and control type not specified.
3. **List columns** — Only name and description; no created date, status, or actions column in ACs.
4. **Sort order** — Alphabetical, created date, or manual order undefined.
5. **Role-based list content** — Whether non-admins see the same list or subset not specified.
6. **Loading skeleton** — No AC for in-progress fetch state.
