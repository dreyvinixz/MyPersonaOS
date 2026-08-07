-- MyPersonaOS V0.2 PostgreSQL Schema & Security Rules

-- 1. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  migration_version INTEGER NOT NULL DEFAULT 0,
  local_imported_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 4. Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'in-progress')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  is_today BOOLEAN NOT NULL DEFAULT false,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. Inbox Items
CREATE TABLE IF NOT EXISTS public.inbox_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'link', 'audio', 'image')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'archived', 'converted')),
  converted_to_type TEXT CHECK (converted_to_type IS NULL OR converted_to_type IN ('task', 'project')),
  converted_to_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  CHECK (
    (status = 'converted' AND converted_to_type IS NOT NULL AND converted_to_id IS NOT NULL)
    OR status <> 'converted'
  )
);

-- 6. Content Pieces
CREATE TABLE IF NOT EXISTS public.content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL CHECK (brand IN ('codetoday', 'personal', 'quantbase')),
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'idea' CHECK (
    stage IN ('idea', 'research', 'script', 'recording', 'editing', 'thumbnail', 'scheduled', 'published')
  ),
  platforms TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 7. English Words
CREATE TABLE IF NOT EXISTS public.english_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  example TEXT,
  mastery_level INTEGER NOT NULL DEFAULT 1 CHECK (mastery_level BETWEEN 1 AND 5),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 8. Attach updated_at Triggers
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_inbox_items_updated_at BEFORE UPDATE ON public.inbox_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_content_pieces_updated_at BEFORE UPDATE ON public.content_pieces FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_english_words_updated_at BEFORE UPDATE ON public.english_words FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 9. Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.english_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access own profile" ON public.user_profiles
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Users access own projects" ON public.projects
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users access own tasks" ON public.tasks
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users access own inbox" ON public.inbox_items
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users access own content" ON public.content_pieces
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users access own english words" ON public.english_words
  FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- 10. Atomic Local Import RPC
CREATE OR REPLACE FUNCTION public.import_local_snapshot(snapshot JSONB)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile public.user_profiles%ROWTYPE;
  v_item JSONB;
  v_has_cloud_data BOOLEAN := false;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated call to import_local_snapshot';
  END IF;

  INSERT INTO public.user_profiles (id, migration_version)
  VALUES (v_user_id, 0)
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO v_profile
  FROM public.user_profiles
  WHERE id = v_user_id
  FOR UPDATE;

  IF v_profile.migration_version >= 1 THEN
    RETURN jsonb_build_object(
      'imported', false,
      'reason', 'already_migrated',
      'version', v_profile.migration_version
    );
  END IF;

  SELECT
    EXISTS (SELECT 1 FROM public.projects WHERE user_id = v_user_id)
    OR EXISTS (SELECT 1 FROM public.tasks WHERE user_id = v_user_id)
    OR EXISTS (SELECT 1 FROM public.inbox_items WHERE user_id = v_user_id)
    OR EXISTS (SELECT 1 FROM public.content_pieces WHERE user_id = v_user_id)
    OR EXISTS (SELECT 1 FROM public.english_words WHERE user_id = v_user_id)
    OR COALESCE(v_profile.settings, '{}'::jsonb) <> '{}'::jsonb
  INTO v_has_cloud_data;

  -- Cloud wins if it already contains user data. Mark migration complete without importing local state.
  IF v_has_cloud_data THEN
    UPDATE public.user_profiles
    SET migration_version = 1
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
      'imported', false,
      'reason', 'cloud_has_data',
      'version', 1
    );
  END IF;

  -- Preserve the local main focus in profile settings.
  IF snapshot ? 'mainFocus' THEN
    UPDATE public.user_profiles
    SET settings = COALESCE(settings, '{}'::jsonb) || jsonb_build_object('mainFocus', snapshot->>'mainFocus')
    WHERE id = v_user_id;
  END IF;

  -- Import projects first so task project_id references are valid.
  IF snapshot ? 'projects' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'projects') LOOP
      INSERT INTO public.projects (id, user_id, name, description, progress, deadline, created_at, updated_at)
      VALUES (
        (v_item->>'id')::uuid,
        v_user_id,
        COALESCE(v_item->>'name', 'Untitled Project'),
        v_item->>'description',
        COALESCE((v_item->>'progress')::integer, 0),
        NULLIF(v_item->>'deadline', '')::timestamptz,
        COALESCE(NULLIF(v_item->>'createdAt', '')::timestamptz, clock_timestamp()),
        COALESCE(NULLIF(v_item->>'updatedAt', '')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  IF snapshot ? 'tasks' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'tasks') LOOP
      INSERT INTO public.tasks (
        id, user_id, title, status, priority, is_today, project_id,
        due_date, created_at, completed_at, updated_at
      )
      VALUES (
        (v_item->>'id')::uuid,
        v_user_id,
        COALESCE(v_item->>'title', 'Untitled Task'),
        COALESCE(v_item->>'status', 'pending'),
        COALESCE(v_item->>'priority', 'medium'),
        COALESCE((v_item->>'isToday')::boolean, false),
        NULLIF(v_item->>'projectId', '')::uuid,
        NULLIF(v_item->>'dueDate', '')::timestamptz,
        COALESCE(NULLIF(v_item->>'createdAt', '')::timestamptz, clock_timestamp()),
        NULLIF(v_item->>'completedAt', '')::timestamptz,
        COALESCE(NULLIF(v_item->>'updatedAt', '')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  IF snapshot ? 'inboxItems' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'inboxItems') LOOP
      INSERT INTO public.inbox_items (
        id, user_id, content, type, status, converted_to_type,
        converted_to_id, created_at, processed_at, updated_at
      )
      VALUES (
        (v_item->>'id')::uuid,
        v_user_id,
        COALESCE(v_item->>'content', ''),
        COALESCE(v_item->>'type', 'text'),
        CASE
          WHEN v_item ? 'status' THEN COALESCE(v_item->>'status', 'pending')
          WHEN COALESCE((v_item->>'processed')::boolean, false) THEN 'archived'
          ELSE 'pending'
        END,
        NULLIF(v_item->>'convertedToType', ''),
        NULLIF(v_item->>'convertedToId', '')::uuid,
        COALESCE(NULLIF(v_item->>'createdAt', '')::timestamptz, clock_timestamp()),
        NULLIF(v_item->>'processedAt', '')::timestamptz,
        COALESCE(NULLIF(v_item->>'updatedAt', '')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  IF snapshot ? 'contentPieces' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'contentPieces') LOOP
      INSERT INTO public.content_pieces (
        id, user_id, brand, title, stage, platforms, notes, created_at, updated_at
      )
      VALUES (
        (v_item->>'id')::uuid,
        v_user_id,
        COALESCE(v_item->>'brand', 'personal'),
        COALESCE(v_item->>'title', 'Untitled Content'),
        COALESCE(v_item->>'stage', 'idea'),
        CASE
          WHEN jsonb_typeof(v_item->'platforms') = 'array'
          THEN ARRAY(SELECT jsonb_array_elements_text(v_item->'platforms'))
          ELSE '{}'::TEXT[]
        END,
        v_item->>'notes',
        COALESCE(NULLIF(v_item->>'createdAt', '')::timestamptz, clock_timestamp()),
        COALESCE(NULLIF(v_item->>'updatedAt', '')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  IF snapshot ? 'englishWords' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'englishWords') LOOP
      INSERT INTO public.english_words (
        id, user_id, term, definition, example, mastery_level,
        last_reviewed_at, created_at, updated_at
      )
      VALUES (
        (v_item->>'id')::uuid,
        v_user_id,
        COALESCE(v_item->>'term', ''),
        COALESCE(v_item->>'definition', ''),
        v_item->>'example',
        COALESCE((v_item->>'masteryLevel')::integer, 1),
        NULLIF(v_item->>'lastReviewedAt', '')::timestamptz,
        COALESCE(NULLIF(v_item->>'createdAt', '')::timestamptz, clock_timestamp()),
        COALESCE(NULLIF(v_item->>'updatedAt', '')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  UPDATE public.user_profiles
  SET migration_version = 1, local_imported_at = clock_timestamp()
  WHERE id = v_user_id;

  RETURN jsonb_build_object('imported', true, 'reason', 'local_imported', 'version', 1);
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = '';

REVOKE ALL ON FUNCTION public.import_local_snapshot(JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.import_local_snapshot(JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION public.import_local_snapshot(JSONB) TO authenticated;

-- 11. Enable Postgres Realtime Publication.
-- No per-user filter is required in the client; RLS remains the authorization boundary.
ALTER PUBLICATION supabase_realtime ADD TABLE
  public.user_profiles,
  public.inbox_items,
  public.tasks,
  public.projects,
  public.content_pieces,
  public.english_words;
