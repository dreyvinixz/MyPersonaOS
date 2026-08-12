import type { PersonaState, Task } from "@/types";

export function reconcileProjects(
  previous: PersonaState,
  next: PersonaState
): PersonaState {
  if (previous.tasks === next.tasks && previous.projects === next.projects) {
    return next;
  }

  let changed = false;
  const now = new Date().toISOString();

  // Cascade delete: if a task references a project that no longer exists, clear it.
  const nextProjectIds = new Set(next.projects.map((p) => p.id));
  let tasksWereUpdated = false;
  const validatedTasks = next.tasks.map((task) => {
    if (task.projectId && !nextProjectIds.has(task.projectId)) {
      tasksWereUpdated = true;
      return { ...task, projectId: undefined, updatedAt: now };
    }
    return task;
  });

  if (tasksWereUpdated) {
    next = { ...next, tasks: validatedTasks };
    changed = true;
  }

  const tasksByProjectId = new Map<string, Task[]>();
  next.tasks.forEach((task) => {
    if (!task.projectId) return;
    const projectTasks = tasksByProjectId.get(task.projectId);
    if (projectTasks) projectTasks.push(task);
    else tasksByProjectId.set(task.projectId, [task]);
  });

  const updatedProjects = next.projects.map((project) => {
    const projectTasks = tasksByProjectId.get(project.id) || [];
    const doneTasks = projectTasks.filter((t) => t.status === "done").length;
    const progress =
      projectTasks.length > 0
        ? Math.round((doneTasks / projectTasks.length) * 100)
        : 0;

    const progressChanged = project.progress !== progress;

    let tasksChanged = project.tasks.length !== projectTasks.length;
    if (!tasksChanged) {
      for (let i = 0; i < project.tasks.length; i++) {
        if (project.tasks[i] !== projectTasks[i]) {
          tasksChanged = true;
          break;
        }
      }
    }

    if (progressChanged || tasksChanged) {
      changed = true;
      return {
        ...project,
        progress,
        tasks: projectTasks,
        updatedAt: progressChanged ? now : project.updatedAt,
      };
    }

    return project;
  });

  if (!changed) {
    return next;
  }

  return {
    ...next,
    projects: updatedProjects,
  };
}
