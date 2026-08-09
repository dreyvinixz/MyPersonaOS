import { createClient } from "@/lib/supabase/client";
import type {
  PersonaState,
  Task,
  Project,
  InboxItem,
  ContentPiece,
  EnglishWord,
} from "@/types";

type SupabaseErrorLike = { message?: string; code?: string } | null;

type TaskRow = {
  id: string;
  title: string;
  status: Task["status"];
  priority: NonNullable<Task["priority"]>;
  is_today: boolean;
  due_date: string | null;
  project_id: string | null;
  created_at: string;
  completed_at: string | null;
  updated_at: string;
};

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  progress: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
};

type InboxItemRow = {
  id: string;
  content: string;
  type: InboxItem["type"];
  status: InboxItem["status"];
  converted_to_type: InboxItem["convertedToType"] | null;
  converted_to_id: string | null;
  created_at: string;
  processed_at: string | null;
  updated_at: string;
};

type ContentPieceRow = {
  id: string;
  title: string;
  brand: ContentPiece["brand"];
  stage: ContentPiece["stage"];
  platforms: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type EnglishWordRow = {
  id: string;
  term: string;
  definition: string;
  example: string | null;
  mastery_level: number;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
};

function assertNoError(error: SupabaseErrorLike, context: string): void {
  if (!error) return;
  const suffix = error.code ? ` (${error.code})` : "";
  throw new Error(`${context}: ${error.message || "Supabase request failed"}${suffix}`);
}

export class SupabaseRepository {
  private get supabase() {
    return createClient();
  }

  async fetchAllState(userId: string): Promise<PersonaState> {
    const [tasksRes, projectsRes, inboxRes, contentRes, englishRes, profileRes] =
      await Promise.all([
        this.supabase
          .from("tasks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        this.supabase
          .from("projects")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        this.supabase
          .from("inbox_items")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        this.supabase
          .from("content_pieces")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        this.supabase
          .from("english_words")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
        this.supabase
          .from("user_profiles")
          .select("settings")
          .eq("id", userId)
          .maybeSingle(),
      ]);

    assertNoError(tasksRes.error, "Failed to fetch tasks");
    assertNoError(projectsRes.error, "Failed to fetch projects");
    assertNoError(inboxRes.error, "Failed to fetch inbox items");
    assertNoError(contentRes.error, "Failed to fetch content pieces");
    assertNoError(englishRes.error, "Failed to fetch English words");
    assertNoError(profileRes.error, "Failed to fetch user profile");

    const tasks: Task[] = (tasksRes.data || []).map((task: TaskRow) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      isToday: task.is_today,
      dueDate: task.due_date ?? undefined,
      projectId: task.project_id ?? undefined,
      createdAt: task.created_at,
      completedAt: task.completed_at ?? undefined,
      updatedAt: task.updated_at,
    }));

    const tasksByProjectId = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (!task.projectId) return;
      const projectTasks = tasksByProjectId.get(task.projectId);
      if (projectTasks) projectTasks.push(task);
      else tasksByProjectId.set(task.projectId, [task]);
    });

    const projects: Project[] = (projectsRes.data || []).map(
      (project: ProjectRow) => ({
        id: project.id,
        name: project.name,
        description: project.description ?? undefined,
        progress: project.progress,
        deadline: project.deadline ?? undefined,
        tasks: tasksByProjectId.get(project.id) || [],
        createdAt: project.created_at,
        updatedAt: project.updated_at,
      })
    );

    const inboxItems: InboxItem[] = (inboxRes.data || []).map(
      (item: InboxItemRow) => ({
        id: item.id,
        content: item.content,
        type: item.type,
        status: item.status,
        convertedToType: item.converted_to_type ?? undefined,
        convertedToId: item.converted_to_id ?? undefined,
        createdAt: item.created_at,
        processedAt: item.processed_at ?? undefined,
        updatedAt: item.updated_at,
      })
    );

    const contentPieces: ContentPiece[] = (contentRes.data || []).map(
      (content: ContentPieceRow) => ({
        id: content.id,
        title: content.title,
        brand: content.brand,
        stage: content.stage,
        platforms: content.platforms || [],
        notes: content.notes ?? undefined,
        createdAt: content.created_at,
        updatedAt: content.updated_at,
      })
    );

    const englishWords: EnglishWord[] = (englishRes.data || []).map(
      (word: EnglishWordRow) => ({
        id: word.id,
        term: word.term,
        definition: word.definition,
        example: word.example ?? undefined,
        masteryLevel: word.mastery_level,
        lastReviewedAt: word.last_reviewed_at ?? undefined,
        createdAt: word.created_at,
        updatedAt: word.updated_at,
      })
    );

    const mainFocus =
      ((profileRes.data?.settings as Record<string, unknown> | null)?.mainFocus as
        | string
        | undefined) || "";

    return {
      mainFocus,
      tasks,
      projects,
      contentPieces,
      inboxItems,
      englishWords,
    };
  }

  async saveMainFocus(userId: string, mainFocus: string): Promise<void> {
    const { data: profile, error: profileError } = await this.supabase
      .from("user_profiles")
      .select("settings")
      .eq("id", userId)
      .maybeSingle();

    assertNoError(profileError, "Failed to read profile settings");

    const settings = {
      ...((profile?.settings as Record<string, unknown> | null) || {}),
      mainFocus,
    };

    const { error } = await this.supabase.from("user_profiles").upsert({
      id: userId,
      settings,
    });
    assertNoError(error, "Failed to save main focus");
  }

  async upsertInboxItem(userId: string, item: InboxItem): Promise<void> {
    const { error } = await this.supabase.from("inbox_items").upsert({
      id: item.id,
      user_id: userId,
      content: item.content,
      type: item.type,
      status: item.status,
      converted_to_type: item.convertedToType ?? null,
      converted_to_id: item.convertedToId ?? null,
      created_at: item.createdAt,
      processed_at: item.processedAt ?? null,
      updated_at: item.updatedAt,
    });
    assertNoError(error, "Failed to upsert inbox item");
  }

  async deleteInboxItem(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from("inbox_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    assertNoError(error, "Failed to delete inbox item");
  }

  async upsertTask(userId: string, task: Task): Promise<void> {
    const { error } = await this.supabase.from("tasks").upsert({
      id: task.id,
      user_id: userId,
      title: task.title,
      status: task.status,
      priority: task.priority ?? "medium",
      is_today: task.isToday ?? false,
      project_id: task.projectId ?? null,
      due_date: task.dueDate ?? null,
      created_at: task.createdAt,
      completed_at: task.completedAt ?? null,
      updated_at: task.updatedAt,
    });
    assertNoError(error, "Failed to upsert task");
  }

  async deleteTask(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    assertNoError(error, "Failed to delete task");
  }

  async upsertProject(userId: string, project: Project): Promise<void> {
    const { error } = await this.supabase.from("projects").upsert({
      id: project.id,
      user_id: userId,
      name: project.name,
      description: project.description ?? null,
      progress: project.progress,
      deadline: project.deadline ?? null,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    });
    assertNoError(error, "Failed to upsert project");
  }

  async deleteProject(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    assertNoError(error, "Failed to delete project");
  }

  async upsertContentPiece(userId: string, content: ContentPiece): Promise<void> {
    const { error } = await this.supabase.from("content_pieces").upsert({
      id: content.id,
      user_id: userId,
      brand: content.brand,
      title: content.title,
      stage: content.stage,
      platforms: content.platforms ?? [],
      notes: content.notes ?? null,
      created_at: content.createdAt,
      updated_at: content.updatedAt,
    });
    assertNoError(error, "Failed to upsert content piece");
  }

  async deleteContentPiece(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from("content_pieces")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    assertNoError(error, "Failed to delete content piece");
  }

  async upsertEnglishWord(userId: string, word: EnglishWord): Promise<void> {
    const { error } = await this.supabase.from("english_words").upsert({
      id: word.id,
      user_id: userId,
      term: word.term,
      definition: word.definition,
      example: word.example ?? null,
      mastery_level: word.masteryLevel,
      last_reviewed_at: word.lastReviewedAt ?? null,
      created_at: word.createdAt,
      updated_at: word.updatedAt,
    });
    assertNoError(error, "Failed to upsert English word");
  }

  async deleteEnglishWord(userId: string, id: string): Promise<void> {
    const { error } = await this.supabase
      .from("english_words")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
    assertNoError(error, "Failed to delete English word");
  }
}

export const supabaseRepository = new SupabaseRepository();
