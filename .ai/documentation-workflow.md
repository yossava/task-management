# Documentation Workflow

**CRITICAL RULE:** Every new feature MUST include documentation updates in the same commit.

## Required Documentation Updates

When implementing ANY new feature, you MUST update these files:

### 1. User Manual (REQUIRED)
**File:** `docs/USER_MANUAL.md`

- Add new section for the feature
- Include step-by-step usage instructions
- Add examples and use cases
- Update Table of Contents
- Add keyboard shortcuts if applicable

### 2. README.md (REQUIRED)
**File:** `README.md`

- Add feature to the features list with emoji
- Update feature count if displayed
- Add to tech stack if new dependencies added

### 3. Feature Wiki Page (REQUIRED)
**File:** `docs/wiki/features/{Feature-Name}.md`

- Create dedicated page for the feature
- Include user guide section
- Include developer guide section
- Add code examples
- Document service methods/APIs

### 4. Wiki Home (REQUIRED)
**File:** `docs/wiki/Home.md`

- Add link to new feature page
- Update features documentation list

### 5. Developer Guide (IF APPLICABLE)
**File:** `docs/wiki/Developer-Guide.md`

Update if:
- Adding new service class
- Introducing new pattern
- Adding major component
- Changing architecture

### 6. Architecture (IF APPLICABLE)
**File:** `docs/wiki/Architecture.md`

Update if:
- System architecture changes
- Adding new layer
- Changing data flow
- Introducing new design pattern

---

## Feature Development Checklist

Copy this for every feature:

```markdown
## {Feature Name} Development

### Implementation
- [ ] Create types in src/lib/types.ts
- [ ] Implement service in src/lib/services/
- [ ] Build UI components
- [ ] Integrate into app
- [ ] Fix TypeScript errors
- [ ] Test feature end-to-end

### Documentation (REQUIRED)
- [ ] Add section to docs/USER_MANUAL.md
- [ ] Update README.md features list
- [ ] Create docs/wiki/features/{Feature}.md
- [ ] Update docs/wiki/Home.md with link
- [ ] Update docs/wiki/Developer-Guide.md (if needed)
- [ ] Update docs/wiki/Architecture.md (if needed)

### Commit
- [ ] Use format: "feat: add {feature} with documentation"
- [ ] Include implementation + docs in same commit
```

---

## Commit Message Format

```
feat: add {feature name}

Implementation:
- Created {Service}Service for business logic
- Built {Component} component for UI
- Integrated into {Location}
- Added {Types} to type system

Documentation:
- Updated User Manual with {Feature} section
- Created wiki page at docs/wiki/features/{Feature}.md
- Updated README.md features list
- Updated Developer Guide API reference
- Updated wiki Home navigation

Features:
- {Key feature 1}
- {Key feature 2}
- {Key feature 3}
```

---

## Pre-Commit Validation

Before committing, verify:

```bash
# 1. Type check passes
npm run type-check

# 2. Feature is documented in User Manual
grep -i "{feature-name}" docs/USER_MANUAL.md

# 3. Feature is in README
grep -i "{feature-name}" README.md

# 4. Feature wiki page exists
ls docs/wiki/features/ | grep -i "{feature-name}"

# 5. Build succeeds
npm run build
```

---

## Example: Subtasks Feature

When we added subtasks, we documented:

**Implementation:**
- `SubtaskService` in `src/lib/services/subtaskService.ts`
- `SubtasksSection` component
- Integrated into `TaskDetailModal`
- Added subtask types to `types.ts`

**Documentation:**
- Added "Subtasks & Nested Tasks" section to User Manual
- Created `docs/wiki/features/Subtasks.md`
- Added "🔢 Subtasks" to README.md features
- Updated wiki Home with Subtasks link
- Documented SubtaskService API in Developer Guide

**Commit:**
```
feat: add subtasks, collaboration, search, time tracking, command palette, and PWA support

Implementation:
[full implementation details]

Documentation:
- Updated User Manual with Subtasks section
- Created wiki page at docs/wiki/features/Subtasks.md
- Updated README.md features list
...
```

---

## Documentation Quality Standards

### Must Have:
- ✅ Clear step-by-step instructions
- ✅ Real examples
- ✅ Code snippets (for dev docs)
- ✅ Use cases
- ✅ Complete sentences

### Must NOT Have:
- ❌ TODO placeholders
- ❌ Incomplete examples
- ❌ Broken links
- ❌ Missing sections

---

## Golden Rule

**NO FEATURE COMMITS WITHOUT DOCUMENTATION**

If you implement it, you document it. No exceptions.

This keeps the project maintainable, user-friendly, and professional.

---

## Quick Reference

### Files That ALWAYS Need Updates:
1. `docs/USER_MANUAL.md` - Add feature section
2. `README.md` - Add to features list
3. `docs/wiki/features/{Feature}.md` - Create page
4. `docs/wiki/Home.md` - Add navigation link

### Files That SOMETIMES Need Updates:
5. `docs/wiki/Developer-Guide.md` - If new service/API
6. `docs/wiki/Architecture.md` - If architecture changes

---

**Last Updated:** 2025-10-10
**Status:** ACTIVE - MUST BE FOLLOWED
