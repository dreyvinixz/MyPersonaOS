export function createEntityId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  throw new Error(
    "MyPersonaOS requires crypto.randomUUID() to create cloud-compatible entity IDs."
  );
}
