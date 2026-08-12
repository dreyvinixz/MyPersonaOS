import assert from "node:assert/strict";
import test from "node:test";
import { formatDateOnly, toDateOnly } from "../src/lib/domain/date-only.ts";
import {
  compactProjectTaskCache,
  projectPersistenceChanged,
  reconcileProjects,
} from "../src/lib/domain/project-reconciler.ts";

const NOW = "2026-08-12T12:00:00.000Z";

function task(overrides = {}) {
  return {
    id: "task-1",
    title: "Tarefa",
    status: "pending",
    priority: "medium",
    isToday: false,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function project(overrides = {}) {
  return {
    id: "project-1",
    name: "Projeto",
    progress: 0,
    tasks: [],
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

function state(overrides = {}) {
  return {
    mainFocus: "",
    tasks: [],
    projects: [],
    contentPieces: [],
    inboxItems: [],
    englishWords: [],
    ...overrides,
  };
}

test("reconcileProjects derives task membership and progress", () => {
  const pending = task({ id: "task-1", projectId: "project-1" });
  const completed = task({
    id: "task-2",
    projectId: "project-1",
    status: "done",
  });
  const input = state({
    tasks: [pending, completed],
    projects: [project({ progress: 100 })],
  });

  const result = reconcileProjects(input, { now: NOW });

  assert.notStrictEqual(result, input);
  assert.deepEqual(result.projects[0].tasks, [pending, completed]);
  assert.equal(result.projects[0].progress, 50);
  assert.equal(result.projects[0].updatedAt, NOW);
});

test("reconcileProjects returns the same state when it is already consistent", () => {
  const completed = task({ projectId: "project-1", status: "done" });
  const input = state({
    tasks: [completed],
    projects: [project({ tasks: [completed], progress: 100 })],
  });

  assert.strictEqual(reconcileProjects(input, { now: NOW }), input);
});

test("reconcileProjects clears dangling project references", () => {
  const input = state({
    tasks: [task({ projectId: "deleted-project", updatedAt: "old" })],
  });

  const result = reconcileProjects(input, { now: NOW });

  assert.equal(result.tasks[0].projectId, undefined);
  assert.equal(result.tasks[0].updatedAt, NOW);
});

test("project cloud comparison ignores derived fields", () => {
  const before = project();
  const afterTaskChange = project({
    progress: 100,
    tasks: [task({ projectId: "project-1", status: "done" })],
  });
  const afterRename = project({ name: "Projeto renomeado", updatedAt: "later" });

  assert.equal(projectPersistenceChanged(before, afterTaskChange), false);
  assert.equal(projectPersistenceChanged(before, afterRename), true);
});

test("compactProjectTaskCache removes duplicated project tasks", () => {
  const assignedTask = task({ projectId: "project-1" });
  const input = state({
    tasks: [assignedTask],
    projects: [project({ tasks: [assignedTask] })],
  });

  const result = compactProjectTaskCache(input);

  assert.deepEqual(result.projects[0].tasks, []);
  assert.strictEqual(result.tasks[0], assignedTask);
});

test("date-only helpers preserve the selected calendar day", () => {
  assert.equal(toDateOnly("2026-08-12T00:00:00.000Z"), "2026-08-12");
  assert.equal(formatDateOnly("2026-08-12T00:00:00.000Z"), "12/08/2026");
  assert.equal(toDateOnly("2026-02-30"), "");
});
