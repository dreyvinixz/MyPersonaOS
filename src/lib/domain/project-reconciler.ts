import type { PersonaState, Project, Task } from "@/types";

export function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;

  let completedTasks = 0;
  for (const task of tasks) {
    if (task.status === "done") completedTasks += 1;
  }

  return Math.round((completedTasks / tasks.length) * 100);
}

function taskListsMatch(left: Task[], right: Task[]): boolean {
  if (left.length !== right.length) return false;

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }

  return true;
}

/**
 * Projects contain a task list and progress for convenient rendering, but Tasks
 * remain the only source of truth for both values. This keeps Local and Cloud
 * reads deterministic even when two devices update different tasks at once.
 */
export function reconcileProjects(
  state: PersonaState,
  options: { now?: string; previous?: PersonaState } = {}
): PersonaState {
  if (
    options.previous &&
    options.previous.tasks === state.tasks &&
    options.previous.projects === state.projects
  ) {
    return state;
  }

  const now = options.now ?? new Date().toISOString();
  const projectIds = new Set(state.projects.map((project) => project.id));
  let tasksChanged = false;

  const tasks = state.tasks.map((task) => {
    if (!task.projectId || projectIds.has(task.projectId)) return task;

    tasksChanged = true;
    return { ...task, projectId: undefined, updatedAt: now };
  });

  const tasksByProjectId = new Map<string, Task[]>();
  for (const task of tasks) {
    if (!task.projectId) continue;

    const projectTasks = tasksByProjectId.get(task.projectId);
    if (projectTasks) projectTasks.push(task);
    else tasksByProjectId.set(task.projectId, [task]);
  }

  let projectsChanged = false;
  const projects = state.projects.map((project) => {
    const projectTasks = tasksByProjectId.get(project.id) ?? [];
    const progress = calculateProjectProgress(projectTasks);

    if (
      project.progress === progress &&
      taskListsMatch(project.tasks, projectTasks)
    ) {
      return project;
    }

    projectsChanged = true;
    return {
      ...project,
      progress,
      tasks: projectTasks,
    };
  });

  if (!tasksChanged && !projectsChanged) return state;

  return {
    ...state,
    tasks: tasksChanged ? tasks : state.tasks,
    projects: projectsChanged ? projects : state.projects,
  };
}

/**
 * Ignore fields derived from Tasks when deciding whether a project needs a
 * Cloud upsert. Persisted project edits still include their updatedAt change.
 */
export function projectPersistenceChanged(
  before: Project,
  after: Project
): boolean {
  return (
    before.name !== after.name ||
    before.description !== after.description ||
    before.deadline !== after.deadline ||
    before.createdAt !== after.createdAt ||
    before.updatedAt !== after.updatedAt
  );
}

/** Avoid duplicating the global task collection inside every local project. */
export function compactProjectTaskCache(state: PersonaState): PersonaState {
  if (state.projects.every((project) => project.tasks.length === 0)) return state;

  return {
    ...state,
    projects: state.projects.map((project) =>
      project.tasks.length === 0 ? project : { ...project, tasks: [] }
    ),
  };
}
