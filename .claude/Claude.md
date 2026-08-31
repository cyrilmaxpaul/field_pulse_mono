# Claude Code — Common Development Instructions

These instructions apply to all repositories, frontend and backend projects.

## 1. Primary Goal

Work efficiently and make the smallest correct change required by the user's request.

Priorities:

1. Correctness
2. Minimal scope
3. Token efficiency
4. Maintainability
5. Verification

Do not over-engineer simple tasks.

---

## 2. Token Efficiency

### Prefer direct work

- Prefer working directly in the current Claude Code session.
- Do not spawn subagents by default.
- Only spawn a subagent when parallel investigation provides meaningful benefit.
- Use at most 1 subagent for ordinary tasks.
- Multiple subagents are justified only when there are genuinely independent tasks
  that can be investigated in parallel.

### Subagent usage

When a subagent is appropriate:

- Use the cheapest suitable model for simple exploration, searching, file discovery,
  or straightforward analysis.
- Use a stronger model only when the subtask requires substantial reasoning.
- Keep subagent prompts narrowly scoped.
- Ask subagents to return concise, actionable results.
- Do not ask subagents to repeat information already known.
- Do not ask a subagent to perform work that can easily be done directly.

Preferred subagent output:

- Root cause
- Relevant files
- Important findings
- Recommended action

Avoid unnecessarily long reports.

### Repository exploration

- Do not scan the entire repository unless the task genuinely requires it.
- Start with files directly related to the user's request.
- Prefer targeted searches and file inspection.
- Search for references/usages before making structural changes.
- Do not repeatedly rediscover the project structure.
- Reuse information already established in the current context.
- Avoid opening large numbers of unrelated files.
- Do not inspect generated files, build output, dependencies, or lockfiles unless
  they are relevant to the task.

---

## 3. Context Management

Keep the active context focused on the current task.

### Use `/compact`

Use `/compact` when:

- The current task is still ongoing.
- The conversation has accumulated substantial context.
- Earlier investigation details are no longer all necessary.

Before compacting, preserve the important state:

- Current objective
- Root cause
- Files being changed
- Changes already made
- Remaining work
- Tests already run
- Known issues

### Use `/clear`

Use `/clear` when:

- The current task is complete.
- Switching to a substantially unrelated task.
- The current conversation contains large amounts of irrelevant context.

Do not keep unrelated tasks in one long-running session.

---

## 4. Task Scope

Before making changes:

1. Understand exactly what the user requested.
2. Identify the smallest relevant area of the codebase.
3. Inspect the existing implementation.
4. Identify the root cause or required change.
5. Make the smallest appropriate change.

Do not expand the scope without a clear reason.

If the request is ambiguous:

- Ask a concise clarification when the ambiguity materially affects the implementation.
- Otherwise make the safest reasonable assumption and state it briefly.

---

## 5. Code Changes

### Minimal changes

- Modify only files relevant to the task.
- Avoid unrelated refactoring.
- Avoid changing architecture unless required.
- Avoid renaming unrelated variables, functions, components, or files.
- Avoid formatting unrelated code.
- Avoid introducing abstractions that are unnecessary for the task.
- Avoid adding dependencies when an existing dependency or utility can solve the problem.
- Reuse existing project patterns and utilities.

### Existing architecture

Before introducing something new, look for:

- Existing utilities
- Existing components
- Existing hooks
- Existing services
- Existing API clients
- Existing validation logic
- Existing error handling
- Existing types/interfaces
- Existing test patterns

Prefer extending an existing pattern over creating a competing pattern.

### Preserve behavior

Unless explicitly requested:

- Do not change public APIs.
- Do not change unrelated behavior.
- Do not change configuration unnecessarily.
- Do not change dependency versions unnecessarily.
- Do not alter database schemas or API contracts unnecessarily.

---

## 6. Frontend Code

When working on frontend code:

- Follow the existing framework and project conventions.
- Reuse existing UI components and design-system patterns.
- Reuse existing state-management patterns.
- Reuse existing form and validation patterns.
- Preserve accessibility and existing UX behavior.
- Avoid introducing a new library for functionality already available in the project.
- Keep components focused and avoid unnecessary component restructuring.
- Follow existing TypeScript conventions.
- Prefer existing shared types and utilities.

For React projects specifically:

- Reuse existing components, hooks, utilities, and patterns.
- Avoid unnecessary state.
- Avoid unnecessary effects.
- Avoid unnecessary re-renders.
- Preserve existing component APIs unless the task requires changing them.

---

## 7. Backend Code

When working on backend code:

- Follow the existing backend architecture.
- Reuse existing services, repositories, middleware, utilities, and helpers.
- Preserve existing API contracts unless the task explicitly requires changing them.
- Follow existing authentication and authorization patterns.
- Follow existing validation and error-handling patterns.
- Avoid introducing duplicate business logic.
- Avoid unnecessary database queries.
- Avoid unnecessary schema or migration changes.
- Preserve existing logging and observability conventions.

---

## 8. Testing and Verification

After making a change:

- Run the smallest relevant verification first.
- Prefer targeted tests/type checks/linting over expensive full-project operations.
- If the project has an existing test for the changed behavior, use it.
- Add or update tests when the change modifies behavior and the project has an
  established testing pattern.
- Do not repeatedly run expensive commands when a targeted check is sufficient.

Before finishing, confirm:

1. The requested change was implemented.
2. No unrelated files were modified.
3. Relevant verification was performed.
4. Any remaining issue is clearly stated.

---

## 9. Debugging

When debugging:

1. Reproduce or understand the failure.
2. Locate the relevant code path.
3. Identify the root cause.
4. Make the smallest fix.
5. Verify the fix.

Do not immediately rewrite or refactor large sections of code.

Avoid speculative fixes when the actual cause can be investigated.

---

## 10. Refactoring

Do not refactor code merely because you notice something that could be improved.

Only refactor when:

- The user explicitly requests it.
- It is necessary to safely implement the requested change.
- The existing structure directly prevents the required behavior.

If a separate improvement is discovered, mention it briefly instead of expanding the
current task.

---

## 11. Git and Files

- Do not make unrelated changes.
- Do not modify `.git` internals.
- Do not rewrite Git history unless explicitly requested.
- Do not reset, revert, or discard user changes unless explicitly requested.
- Preserve existing uncommitted work.
- Before modifying a file with existing user changes, understand those changes first.
- Do not commit changes unless explicitly requested.

---

## 12. Generated and Dependency Files

Avoid modifying:

- `node_modules`
- Build output
- Generated files
- Cache directories
- Lockfiles
- Environment files
- IDE metadata

unless the task specifically requires them.

Do not read large generated files just to understand the source implementation.

---

## 13. Communication

Keep responses concise and useful.

Before implementation:

- Briefly state the approach when the task is non-trivial.

During implementation:

- Avoid unnecessary narration.
- Do not repeatedly explain obvious actions.

After implementation, report:

- What changed
- Files changed
- Verification performed
- Any important remaining concern

Do not provide a long explanation unless requested.

---

## 14. Important Rule

Do not optimize for doing more work.

Optimize for solving the user's actual problem with the fewest necessary:

- Files inspected
- Tool calls
- Subagents
- Context
- Code changes
- Verification steps

When two approaches are functionally equivalent, prefer the simpler and more
token-efficient approach.