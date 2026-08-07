import { createClient } from "@/lib/supabase/client";
import type {
  PersonaState,
  Task,
  Project,
  InboxItem,
  ContentPiece,
  EnglishWord,
} from "@/types";

export class SupabaseRepository {
  private get supabase() {
    return createClient();
  }

  async fetchAllState(userId: string): Promise<PersonaState> {
    const [
      tasksRes,
      projectsRes,
      inboxRes,
      contentRes,
      englishRes,
      profileRes,
    ] = await Promise.all([
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

    const tasks: Task[] = (tasksRes.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      isToday: t.is_today,
      dueDate: t.due_date,
      projectId: t.project_id,
      createdAt: t.created_at,
      completedAt: t.completed_at,
      updatedAt: t.updated_at,
    }));

    const projects: Project[] = (projectsRes.data || []).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      progress: p.progress,
      deadline: p.deadline,
      tasks: tasks.filter((t) => t.projectId === p.id),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));

    const inboxItems: InboxItem[] = (inboxRes.data || []).map((i) => ({
      id: i.id,
      content: i.content,
      type: i.type,
      status: i.status,
      convertedToType: i.converted_to_type,
      convertedToId: i.converted_to_id,
      createdAt: i.created_at,
      processedAt: i.processed_at,
      updatedAt: i.updated_at,
    }));

    const contentPieces: ContentPiece[] = (contentRes.data || []).map((c) => ({
      id: c.id,
      title: c.title,
      brand: c.brand,
      stage: c.stage,
      notes: c.notes,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    const englishWords: EnglishWord[] = (englishRes.data || []).map((w) => ({
      id: w.id,
      term: w.term,
      definition: w.definition,
      example: w.example,
      masteryLevel: w.mastery_level,
      lastReviewedAt: w.last_reviewed_at,
      createdAt: w.created_at,
      updatedAt: w.updated_at,
    }));

    const mainFocus =
      ((profileRes.data?.settings as Record<string, unknown>)?.mainFocus as string) ||
      "Finish CodeToday video #01";

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
    const { data: profile } = await this.supabase
      .from("user_profiles")
      .select("settings")
      .eq("id", userId)
      .maybeSingle();

    const settings = {
      ...((profile?.settings as Record<string, unknown>) || {}),
      mainFocus,
    };

    await this.supabase.from("user_profiles").upsert({
      id: userId,
      settings,
      updated_at: new Date().toISOString(),
    });
  }

  async upsertInboxItem(userId: string, item: InboxItem): Promise<void> {
    await this.supabase.from("inbox_items").upsert({
      id: item.id,
      user_id: userId,
      content: item.content,
      type: item.type,
      status: item.status,
      converted_to_type: item.convertedToType,
      converted_to_id: item.convertedToId,
      created_at: item.createdAt,
      processed_at: item.processedAt,
      updated_at: item.updatedAt,
    });
  }

  async deleteInboxItem(userId: string, id: string): Promise<void> {
    await this.supabase
      .from("inbox_items")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
  }

  async upsertTask(userId: string, task: Task): Promise<void> {
    await this.supabase.from("tasks").upsert({
      id: task.id,
      user_id: userId,
      title: task.title,
      status: task.status,
      priority: task.priority,
      is_today: task.isToday,
      project_id: task.projectId,
      due_date: task.dueDate,
      created_at: task.createdAt,
      completed_at: task.completedAt,
      updated_at: task.updatedAt,
    });
  }

  async deleteTask(userId: string, id: string): Promise<void> {
    await this.supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
  }

  async upsertProject(userId: string, project: Project): Promise<void> {
    await this.supabase.from("projects").upsert({
      id: project.id,
      user_id: userId,
      name: project.name,
      description: project.description,
      progress: project.progress,
      deadline: project.deadline,
      created_at: project.createdAt,
      updated_at: project.updatedAt,
    });
  }

  async deleteProject(userId: string, id: string): Promise<void> {
    await this.supabase
      .from("projects")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
  }

  async upsertContentPiece(userId: string, content: ContentPiece): Promise<void> {
    await this.supabase.from("content_pieces").upsert({
      id: content.id,
      user_id: userId,
      brand: content.brand,
      title: content.title,
      stage: content.stage,
      notes: content.notes,
      created_at: content.createdAt,
      updated_at: content.updatedAt,
    });
  }

  async deleteContentPiece(userId: string, id: string): Promise<void> {
    await this.supabase
      .from("content_pieces")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
  }

  async upsertEnglishWord(userId: string, word: EnglishWord): Promise<void> {
    await this.supabase.from("english_words").upsert({
      id: word.id,
      user_id: userId,
      term: word.term,
      definition: word.definition,
      example: word.example,
      mastery_level: word.masteryLevel,
      last_reviewed_at: word.lastReviewedAt,
      created_at: word.createdAt,
      updated_at: word.updatedAt,
    });
  }

  async deleteEnglishWord(userId: string, id: string): Promise<void> {
    await this.supabase
      .from("english_words")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
  }
}

export const supabaseRepository = new SupabaseRepository();
