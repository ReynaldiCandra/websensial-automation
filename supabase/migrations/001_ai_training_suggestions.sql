-- AI training per user
CREATE TABLE IF NOT EXISTS ai_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_prompt TEXT NOT NULL DEFAULT '',
  products JSONB NOT NULL DEFAULT '[]',
  faqs JSONB NOT NULL DEFAULT '[]',
  tone TEXT NOT NULL DEFAULT 'ramah',
  business_name TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- AI suggestions log
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL,
  suggested_reply TEXT NOT NULL,
  confidence NUMERIC(5,2) NOT NULL,
  action TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('suggestion', 'semi_auto', 'full_auto')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_created
  ON ai_suggestions(user_id, created_at DESC);

ALTER TABLE ai_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ai_training"
  ON ai_training FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own ai_suggestions"
  ON ai_suggestions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
