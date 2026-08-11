-- MyPersonaOS V0.2 hardening follow-up
-- Keeps tenant ownership relationships explicit and adds common query indexes.

CREATE INDEX IF NOT EXISTS idx_projects_user_id
  ON public.projects (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id
  ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_today
  ON public.tasks (user_id, is_today);
CREATE INDEX IF NOT EXISTS idx_inbox_items_user_id
  ON public.inbox_items (user_id);
CREATE INDEX IF NOT EXISTS idx_inbox_items_user_status
  ON public.inbox_items (user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_pieces_user_id
  ON public.content_pieces (user_id);
CREATE INDEX IF NOT EXISTS idx_english_words_user_id
  ON public.english_words (user_id);

CREATE OR REPLACE FUNCTION public.enforce_task_project_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.project_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.projects AS project
    WHERE project.id = NEW.project_id
      AND project.user_id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'Task project_id must reference a project owned by the same user';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

DROP TRIGGER IF EXISTS trg_tasks_project_owner ON public.tasks;
CREATE TRIGGER trg_tasks_project_owner
  BEFORE INSERT OR UPDATE OF project_id, user_id
  ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_task_project_owner();
