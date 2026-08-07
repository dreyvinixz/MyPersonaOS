-- MyPersonaOS V0.2 PostgreSQL Schema & Security Rules

-- 1. Automatic updated_at Trigger Function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = clock_timestamp();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{}'::jsonb,
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 6. Content Pieces
CREATE TABLE IF NOT EXISTS public.content_pieces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL CHECK (brand IN ('codetoday', 'personal', 'quantbase')),
  title TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'idea',
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
CREATE TRIGGER trg_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_inbox_items_updated_at BEFORE UPDATE ON public.inbox_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_content_pieces_updated_at BEFORE UPDATE ON public.content_pieces FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_english_words_updated_at BEFORE UPDATE ON public.english_words FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 9. Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.english_words ENABLE ROW LEVEL SECURITY;

-- Profile RLS Policy (auth.uid() = id)
CREATE POLICY "Users access own profile" ON public.user_profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Domain RLS Policies (auth.uid() = user_id)
CREATE POLICY "Users access own projects" ON public.projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own tasks" ON public.tasks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own inbox" ON public.inbox_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own content" ON public.content_pieces
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users access own english words" ON public.english_words
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10. Atomic Local Import RPC
CREATE OR REPLACE FUNCTION public.import_local_snapshot(snapshot JSONB)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile public.user_profiles%ROWTYPE;
  v_item JSONB;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Unauthenticated call to import_local_snapshot';
  END IF;

  -- Ensure profile exists
  INSERT INTO public.user_profiles (id, migration_version)
  VALUES (v_user_id, 0)
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO v_profile FROM public.user_profiles WHERE id = v_user_id;

  -- Idempotency check: if migration_version >= 1, skip import
  IF v_profile.migration_version >= 1 THEN
    RETURN jsonb_build_object('imported', false, 'reason', 'already_migrated', 'version', v_profile.migration_version);
  END IF;

  -- Import projects
  IF snapshot ? 'projects' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'projects') LOOP
      INSERT INTO public.projects (id, user_id, name, description, progress, created_at)
      VALUES (
        COALESCE((v_item->>'id')::uuid, gen_random_uuid()),
        v_user_id,
        COALESCE(v_item->>'name', 'Untitled Project'),
        v_item->>'description',
        COALESCE((v_item->>'progress')::integer, 0),
        COALESCE((v_item->>'createdAt')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  -- Import tasks
  IF snapshot ? 'tasks' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'tasks') LOOP
      INSERT INTO public.tasks (id, user_id, title, status, priority, is_today, project_id, created_at)
      VALUES (
        COALESCE((v_item->>'id')::uuid, gen_random_uuid()),
        v_user_id,
        COALESCE(v_item->>'title', 'Untitled Task'),
        COALESCE(v_item->>'status', 'pending'),
        COALESCE(v_item->>'priority', 'medium'),
        COALESCE((v_item->>'isToday')::boolean, false),
        (v_item->>'projectId')::uuid,
        COALESCE((v_item->>'createdAt')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  -- Import inbox items
  IF snapshot ? 'inboxItems' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'inboxItems') LOOP
      INSERT INTO public.inbox_items (id, user_id, content, type, status, converted_to_type, converted_to_id, created_at)
      VALUES (
        COALESCE((v_item->>'id')::uuid, gen_random_uuid()),
        v_user_id,
        COALESCE(v_item->>'content', ''),
        COALESCE(v_item->>'type', 'text'),
        CASE WHEN (v_item->>'processed')::boolean IS TRUE THEN 'archived' ELSE COALESCE(v_item->>'status', 'pending') END,
        v_item->>'convertedToType',
        (v_item->>'convertedToId')::uuid,
        COALESCE((v_item->>'createdAt')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  -- Import content pieces
  IF snapshot ? 'contentPieces' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'contentPieces') LOOP
      INSERT INTO public.content_pieces (id, user_id, brand, title, stage, notes, created_at)
      VALUES (
        COALESCE((v_item->>'id')::uuid, gen_random_uuid()),
        v_user_id,
        COALESCE(v_item->>'brand', 'personal'),
        COALESCE(v_item->>'title', 'Untitled Content'),
        COALESCE(v_item->>'stage', 'idea'),
        v_item->>'notes',
        COALESCE((v_item->>'createdAt')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  -- Import english words
  IF snapshot ? 'englishWords' THEN
    FOR v_item IN SELECT * FROM jsonb_array_elements(snapshot->'englishWords') LOOP
      INSERT INTO public.english_words (id, user_id, term, definition, example, mastery_level, created_at)
      VALUES (
        COALESCE((v_item->>'id')::uuid, gen_random_uuid()),
        v_user_id,
        COALESCE(v_item->>'term', ''),
        COALESCE(v_item->>'definition', ''),
        v_item->>'example',
        COALESCE((v_item->>'masteryLevel')::integer, 1),
        COALESCE((v_item->>'createdAt')::timestamptz, clock_timestamp())
      ) ON CONFLICT (id) DO NOTHING;
    END LOOP;
  END IF;

  -- Update migration version
  UPDATE public.user_profiles
  SET migration_version = 1, local_imported_at = clock_timestamp()
  WHERE id = v_user_id;

  RETURN jsonb_build_object('imported', true, 'version', 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Enable Postgres Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.inbox_items, public.tasks, public.projects, public.content_pieces, public.english_words;
