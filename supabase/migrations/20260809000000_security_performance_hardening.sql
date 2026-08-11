-- Security and query-performance hardening identified in the 2026-08-09 audit.

-- Bound user-controlled text so a valid session cannot create unbounded rows.
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_settings_size_check
  CHECK (octet_length(settings::text) <= 65536);

ALTER TABLE public.projects
  ADD CONSTRAINT projects_name_length_check CHECK (char_length(name) <= 200),
  ADD CONSTRAINT projects_description_length_check
    CHECK (description IS NULL OR char_length(description) <= 5000);

ALTER TABLE public.tasks
  ADD CONSTRAINT tasks_title_length_check CHECK (char_length(title) <= 500);

ALTER TABLE public.inbox_items
  ADD CONSTRAINT inbox_items_content_length_check CHECK (char_length(content) <= 10000);

ALTER TABLE public.content_pieces
  ADD CONSTRAINT content_pieces_title_length_check CHECK (char_length(title) <= 500),
  ADD CONSTRAINT content_pieces_notes_length_check
    CHECK (notes IS NULL OR char_length(notes) <= 20000),
  ADD CONSTRAINT content_pieces_platform_count_check CHECK (cardinality(platforms) <= 20);

ALTER TABLE public.english_words
  ADD CONSTRAINT english_words_term_length_check CHECK (char_length(term) <= 200),
  ADD CONSTRAINT english_words_definition_length_check
    CHECK (char_length(definition) <= 5000),
  ADD CONSTRAINT english_words_example_length_check
    CHECK (example IS NULL OR char_length(example) <= 5000);

-- Match the authenticated list queries: owner equality followed by newest first.
CREATE INDEX IF NOT EXISTS idx_projects_user_created_at
  ON public.projects (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_user_created_at
  ON public.tasks (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_items_user_created_at
  ON public.inbox_items (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_pieces_user_created_at
  ON public.content_pieces (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_english_words_user_created_at
  ON public.english_words (user_id, created_at DESC);

-- The import RPC loops over a client-provided snapshot. Keep malformed or
-- unexpectedly large imports from occupying a database worker indefinitely.
ALTER FUNCTION public.import_local_snapshot(JSONB)
  SET statement_timeout = '15s';
