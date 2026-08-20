import assert from "node:assert/strict";
import {
  validateTask,
  validateProject,
  validateInboxItem,
  validateContentPiece,
  validateEnglishWord,
  validatePersonaState,
  validateCloudMutation,
  SCHEMA_LIMITS,
} from "../src/lib/validation/persona-schema.ts";

console.log("🧪 Running SEC-11 Runtime Schema Validation Test Suite...\n");

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`  ✗ ${name}`);
    console.error(error);
  }
}

// 1. Task Validation
test("validateTask: valid task passes", () => {
  const input = {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "Implement runtime validation",
    status: "pending",
    priority: "high",
    isToday: true,
    createdAt: "2026-08-19T20:00:00.000Z",
    updatedAt: "2026-08-19T20:00:00.000Z",
  };
  const result = validateTask(input);
  assert.ok(result);
  assert.equal(result.id, input.id);
  assert.equal(result.title, input.title);
  assert.equal(result.status, "pending");
  assert.equal(result.priority, "high");
  assert.equal(result.isToday, true);
});

test("validateTask: rejects invalid task (missing id or title)", () => {
  assert.equal(validateTask({ title: "No ID" }), null);
  assert.equal(validateTask({ id: "123", title: "   " }), null);
  assert.equal(validateTask(null), null);
  assert.equal(validateTask("string"), null);
});

test("validateTask: bounds and sanitizes task fields", () => {
  const longTitle = "a".repeat(1000);
  const result = validateTask({
    id: "task-1",
    title: longTitle,
    status: "invalid-status",
    priority: "invalid-priority",
  });
  assert.ok(result);
  assert.equal(result.title.length, SCHEMA_LIMITS.TASK_TITLE_MAX_LENGTH);
  assert.equal(result.status, "pending");
  assert.equal(result.priority, undefined);
});

// 2. Project Validation
test("validateProject: clamps progress and sanitizes nested tasks", () => {
  const result = validateProject({
    id: "proj-1",
    name: "PersonaOS Core",
    progress: 150, // exceeds 100
    tasks: [
      { id: "t1", title: "Valid task" },
      { id: "t2", title: "   " }, // invalid task should be dropped
    ],
  });
  assert.ok(result);
  assert.equal(result.progress, 100);
  assert.equal(result.tasks.length, 1);
  assert.equal(result.tasks[0].id, "t1");
});

// 3. Inbox Item Validation
test("validateInboxItem: normalizes legacy processed boolean", () => {
  const result = validateInboxItem({
    id: "inbox-1",
    content: "Remember to review PR",
    processed: true,
  });
  assert.ok(result);
  assert.equal(result.status, "archived");
});

test("validateInboxItem: rejects empty content", () => {
  assert.equal(validateInboxItem({ id: "inbox-2", content: "   " }), null);
});

// 4. Content Piece Validation
test("validateContentPiece: bounds platform list count and lengths", () => {
  const longPlatforms = Array.from({ length: 20 }, (_, i) => `Platform-${i}-` + "x".repeat(100));
  const result = validateContentPiece({
    id: "cp-1",
    title: "Video on AI Systems",
    brand: "codetoday",
    stage: "script",
    platforms: longPlatforms,
  });
  assert.ok(result);
  assert.equal(result.platforms.length, SCHEMA_LIMITS.CONTENT_PLATFORM_MAX_COUNT);
  assert.ok(result.platforms[0].length <= SCHEMA_LIMITS.CONTENT_PLATFORM_MAX_LENGTH);
});

// 5. English Word Validation
test("validateEnglishWord: clamps mastery level between 1 and 5", () => {
  const low = validateEnglishWord({
    id: "w1",
    term: "ephemeral",
    definition: "lasting for a very short time",
    masteryLevel: -5,
  });
  assert.ok(low);
  assert.equal(low.masteryLevel, 1);

  const high = validateEnglishWord({
    id: "w2",
    term: "resilient",
    definition: "able to withstand or recover quickly",
    masteryLevel: 99,
  });
  assert.ok(high);
  assert.equal(high.masteryLevel, 5);
});

// 6. Full PersonaState Validation
test("validatePersonaState: valid state passes with zero repairs/drops", () => {
  const validState = {
    mainFocus: "Ship V0.3 Hardening",
    tasks: [{ id: "t1", title: "Task 1", status: "pending", createdAt: "2026-08-19T00:00:00Z", updatedAt: "2026-08-19T00:00:00Z" }],
    projects: [{ id: "p1", name: "Project 1", progress: 50, tasks: [], createdAt: "2026-08-19T00:00:00Z", updatedAt: "2026-08-19T00:00:00Z" }],
    contentPieces: [],
    inboxItems: [],
    englishWords: [],
  };
  const result = validatePersonaState(validState);
  assert.equal(result.isValid, true);
  assert.equal(result.droppedCount, 0);
  assert.equal(result.repairedCount, 0);
  assert.equal(result.state.mainFocus, "Ship V0.3 Hardening");
  assert.equal(result.state.tasks.length, 1);
});

test("validatePersonaState: corrupt state safely repairs and returns valid structure", () => {
  const corruptInput = {
    mainFocus: 12345, // invalid type
    tasks: [
      { id: "valid-t", title: "Valid Task" },
      { id: "invalid-t", title: "" }, // corrupt task
    ],
    projects: "not-an-array", // corrupt array
  };
  const result = validatePersonaState(corruptInput);
  assert.equal(result.isValid, false);
  assert.equal(result.droppedCount, 1); // 1 dropped task
  assert.ok(result.repairedCount >= 1); // projects repaired to empty array
  assert.equal(result.state.tasks.length, 1);
  assert.equal(Array.isArray(result.state.projects), true);
});

// 7. CloudMutation Validation
test("validateCloudMutation: validates valid mutation and rejects malformed", () => {
  const validMutation = {
    mutationId: "m1",
    userId: "u1",
    createdAt: "2026-08-19T00:00:00Z",
    kind: "upsertTask",
    entity: { id: "t1", title: "Task Mutation" },
  };
  const validResult = validateCloudMutation(validMutation);
  assert.ok(validResult);
  assert.equal(validResult.kind, "upsertTask");

  const invalidMutation = {
    mutationId: "m2",
    userId: "u2",
    kind: "upsertTask",
    entity: { id: "t2", title: "" }, // empty title invalid
  };
  assert.equal(validateCloudMutation(invalidMutation), null);

  const missingUser = {
    mutationId: "m3",
    kind: "deleteTask",
    entityId: "t1",
  };
  assert.equal(validateCloudMutation(missingUser), null);
});

console.log(`\nResults: ${passed}/${total} tests passed.`);
if (passed !== total) {
  process.exit(1);
}
