-- Cover the tasks.project_id foreign key used for project assignment and deletes.
-- This also satisfies the Supabase unindexed-foreign-key advisor.

CREATE INDEX IF NOT EXISTS idx_tasks_project_id
  ON public.tasks (project_id);
