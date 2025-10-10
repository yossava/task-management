# Feature Development Workflow

**IMPORTANT:** Every new feature MUST include documentation updates before committing.

## Required Documentation Updates for Every Feature

### 1. User Manual (`docs/USER_MANUAL.md`)
- Add new section explaining the feature
- Include step-by-step usage instructions
- Add examples and use cases
- Update Table of Contents
- Add keyboard shortcuts if applicable

### 2. README.md
- Add feature to the features list
- Update feature count/badges if needed
- Add to tech stack if new dependencies

### 3. Wiki Feature Page (`docs/wiki/features/{Feature-Name}.md`)
- Create dedicated page for the feature
- Include both user and developer guides
- Add code examples
- Document API/service methods

### 4. Wiki Home (`docs/wiki/Home.md`)
- Add link to new feature page
- Update feature index

### 5. Developer Guide (`docs/wiki/Developer-Guide.md`) - If applicable
- Document new services/APIs
- Add component examples
- Update patterns if introducing new ones

### 6. Architecture (`docs/wiki/Architecture.md`) - If architecture changes
- Update diagrams
- Document new patterns
- Update data flow

---

## Workflow Checklist

Use this checklist for every feature:

### Phase 1: Planning
- [ ] Define feature requirements
- [ ] Identify which docs need updates
- [ ] Plan documentation structure

### Phase 2: Implementation
- [ ] Implement types
- [ ] Build services
- [ ] Create components
- [ ] Integrate into app
- [ ] Fix compilation errors
- [ ] Test feature

### Phase 3: Documentation (REQUIRED)
- [ ] Update User Manual with feature section
- [ ] Update README.md features list
- [ ] Create feature wiki page
- [ ] Update wiki home with link
- [ ] Update Developer Guide (if needed)
- [ ] Update Architecture (if needed)

### Phase 4: Commit
- [ ] Include documentation in same commit
- [ ] Use format: `feat: add {feature} with documentation`

---

## Quick Commit Template

```bash
git commit -m "feat: add {feature name}

Implementation:
- Created {Service}Service for business logic
- Built {Component} component for UI
- Integrated into {Location}
- Added types to type system

Documentation:
- Updated User Manual with {Feature} section
- Created wiki page at docs/wiki/features/{Feature}.md
- Updated README.md features list
- Updated Developer Guide (if applicable)
- Updated wiki Home with navigation link

Features:
- {Key feature 1}
- {Key feature 2}
- {Key feature 3}"
```

---

## Example: Recent "Subtasks" Feature

When we added subtasks, we documented:

1. **User Manual** - "Subtasks & Nested Tasks" section with:
   - How to create subtasks
   - Managing subtasks
   - Progress calculation
   - Promoting subtasks

2. **README.md** - Added "🔢 Subtasks" to features list

3. **Developer Guide** - Documented SubtaskService API

4. **Architecture** - Showed subtask hierarchy in type system

---

## Documentation Quality Standards

### Must Include:
- ✅ Clear usage instructions
- ✅ Code examples (for developer docs)
- ✅ Step-by-step tutorials
- ✅ Use cases/examples
- ✅ Keyboard shortcuts (if any)

### Must Avoid:
- ❌ Committing features without docs
- ❌ Placeholder "TODO" sections
- ❌ Incomplete examples
- ❌ Broken links

---

## Pre-Commit Validation

Before committing, verify:

```bash
# 1. Type check passes
npm run type-check

# 2. Feature is documented
grep -i "{feature-name}" docs/USER_MANUAL.md

# 3. README updated
grep -i "{feature-name}" README.md

# 4. Build succeeds
npm run build
```

---

## Documentation File Locations

```
docs/
├── USER_MANUAL.md              # Main user guide - UPDATE EVERY FEATURE
├── wiki/
│   ├── Home.md                 # Wiki homepage - UPDATE EVERY FEATURE
│   ├── Developer-Guide.md      # Developer reference
│   ├── Architecture.md         # Technical architecture
│   └── features/               # Feature-specific docs
│       └── {New-Feature}.md    # CREATE FOR EACH FEATURE
└── README.md                   # Project overview - UPDATE EVERY FEATURE
```

---

## Rule: No Feature Without Documentation

**If you implement a feature, you MUST update the documentation in the same commit.**

This is non-negotiable and ensures the project stays maintainable and user-friendly.

---

**Last Updated:** 2025-10-10
