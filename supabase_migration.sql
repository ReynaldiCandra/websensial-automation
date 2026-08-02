-- ============================================================================
-- WEBSENSIAL v1.0 DATABASE REBUILD
-- Fresh schema per 03_DATABASE.md (terverifikasi 2 Agustus 2026)
-- TASK-002: Perbaiki RLS policies (DEC-002 — atasi BUG-E06)
-- ============================================================================

-- ENABLE REQUIRED EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- DEC-002: Fix BUG-E06 — Helper function untuk multi-user workspace access
CREATE OR REPLACE FUNCTION public.my_company_ids()
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public AS $$
  SELECT id FROM companies WHERE owner_id = auth.uid()
  UNION
  SELECT workspace_id FROM team_members
   WHERE user_id = auth.uid() AND status = 'active';
$$;

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- 1. COMPANIES (tenant table)
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url text,
  whatsapp_number text,
  whatsapp_business_account_id text,
  subscription_plan text DEFAULT 'starter',
  subscription_status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY companies_select_own ON companies FOR SELECT
  USING (owner_id = auth.uid() OR id IN (SELECT workspace_id FROM team_members WHERE user_id = auth.uid() AND status = 'active'));
CREATE POLICY companies_insert_own ON companies FOR INSERT
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY companies_update_own ON companies FOR UPDATE
  USING (owner_id = auth.uid());
CREATE POLICY companies_delete_own ON companies FOR DELETE
  USING (owner_id = auth.uid());

-- 2. PROFILES (user metadata)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  avatar_url text,
  timezone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_own ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY profiles_insert_own ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update_own ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. TEAM_MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text DEFAULT 'sales',
  status text DEFAULT 'invited',
  invited_at timestamptz DEFAULT now(),
  joined_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY team_members_select_workspace ON team_members FOR SELECT
  USING (workspace_id IN (SELECT public.my_company_ids()));
CREATE POLICY team_members_insert_admin ON team_members FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM companies WHERE owner_id = auth.uid()));

-- 4. ROTATORS (WhatsApp rotator rules)
CREATE TABLE IF NOT EXISTS rotators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  distribution text DEFAULT 'round_robin',
  is_active boolean DEFAULT true,
  fallback_url text,
  use_deeplink boolean DEFAULT true,
  greeting_template text DEFAULT '[kode]',
  total_clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE rotators ENABLE ROW LEVEL SECURITY;
CREATE POLICY rotators_select_workspace ON rotators FOR SELECT
  USING (workspace_id IN (SELECT public.my_company_ids()));
CREATE POLICY rotators_insert_workspace ON rotators FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.my_company_ids()));
CREATE POLICY rotators_update_workspace ON rotators FOR UPDATE
  USING (workspace_id IN (SELECT public.my_company_ids()));
CREATE POLICY rotators_delete_workspace ON rotators FOR DELETE
  USING (workspace_id IN (SELECT public.my_company_ids()));

-- 5. WHATSAPP_SESSIONS (NEW — tabel yang hilang, per BUG-W01)
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text NOT NULL,
  provider text DEFAULT 'fonnte',
  provider_device_id text,
  status text DEFAULT 'pending',
  last_status_at timestamptz,
  last_activity_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(company_id, phone)
);

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY whatsapp_sessions_select_workspace ON whatsapp_sessions FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY whatsapp_sessions_insert_workspace ON whatsapp_sessions FOR INSERT
  WITH CHECK (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY whatsapp_sessions_update_workspace ON whatsapp_sessions FOR UPDATE
  USING (company_id IN (SELECT public.my_company_ids()));

-- 6. ROTATOR_MEMBERS
CREATE TABLE IF NOT EXISTS rotator_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rotator_id uuid NOT NULL REFERENCES rotators(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  phone text NOT NULL,
  name text NOT NULL,
  provider text DEFAULT 'fonnte',
  weight integer DEFAULT 100,
  is_available boolean DEFAULT true,
  total_assigned integer DEFAULT 0,
  last_assigned_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE rotator_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY rotator_members_select_workspace ON rotator_members FOR SELECT
  USING (workspace_id IN (SELECT public.my_company_ids()));
CREATE POLICY rotator_members_insert_workspace ON rotator_members FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.my_company_ids()));
CREATE POLICY rotator_members_update_workspace ON rotator_members FOR UPDATE
  USING (workspace_id IN (SELECT public.my_company_ids()));

-- 7. LEADS
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone text,
  email text,
  source text,
  status text DEFAULT 'new',
  pipeline_stage text DEFAULT 'tanya_produk',
  lead_score integer DEFAULT 0,
  temperature text,
  notes text,
  assigned_to uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deal_value numeric DEFAULT 0,
  stage_changed_at timestamptz DEFAULT now(),
  is_escalated boolean DEFAULT false,
  escalated_at timestamptz,
  last_message text,
  last_seen_at timestamptz,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  ttclid text,
  rotator_id uuid REFERENCES rotators(id),
  tracking_code text,
  lead_click_id uuid,
  first_message_text text,
  entered_at timestamptz,
  campaign_id text,
  adset_id text,
  ad_id text,
  wbraid text,
  gbraid text
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY leads_select_workspace ON leads FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY leads_insert_workspace ON leads FOR INSERT
  WITH CHECK (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY leads_update_workspace ON leads FOR UPDATE
  USING (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY leads_delete_workspace ON leads FOR DELETE
  USING (company_id IN (SELECT public.my_company_ids()));

-- 8. LEAD_CLICKS
CREATE TABLE IF NOT EXISTS lead_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rotator_id uuid NOT NULL REFERENCES rotators(id),
  member_id uuid REFERENCES rotator_members(id),
  workspace_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tracking_code text NOT NULL,
  customer_ip text,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  campaign_id text,
  adset_id text,
  ad_id text,
  fbclid text,
  gclid text,
  ttclid text,
  wbraid text,
  gbraid text,
  landing_url text,
  is_claimed boolean DEFAULT false,
  lead_id uuid REFERENCES leads(id),
  clicked_at timestamptz DEFAULT now()
);

ALTER TABLE lead_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY lead_clicks_select_workspace ON lead_clicks FOR SELECT
  USING (workspace_id IN (SELECT public.my_company_ids()));
CREATE POLICY lead_clicks_insert_workspace ON lead_clicks FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.my_company_ids()));

-- 9. CHATS
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  whatsapp_contact_id text,
  status text DEFAULT 'active',
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY chats_select_workspace ON chats FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY chats_insert_workspace ON chats FOR INSERT
  WITH CHECK (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY chats_update_workspace ON chats FOR UPDATE
  USING (company_id IN (SELECT public.my_company_ids()));

-- 10. CHAT_MESSAGES (Chat history per GAP-CH01)
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_type text,
  sender_id uuid,
  message_text text,
  message_type text DEFAULT 'text',
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_messages_select_via_chat ON chat_messages FOR SELECT
  USING (chat_id IN (SELECT id FROM chats WHERE company_id IN (SELECT public.my_company_ids())));
CREATE POLICY chat_messages_insert_via_chat ON chat_messages FOR INSERT
  WITH CHECK (chat_id IN (SELECT id FROM chats WHERE company_id IN (SELECT public.my_company_ids())));

-- 11. PENDING_ATTRIBUTION
CREATE TABLE IF NOT EXISTS pending_attribution (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text NOT NULL,
  rotator_id uuid REFERENCES rotators(id),
  workspace_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  target_phone text NOT NULL,
  customer_ip text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  fbclid text,
  gclid text,
  ttclid text,
  is_claimed boolean DEFAULT false,
  claimed_lead_id uuid,
  expires_at timestamptz DEFAULT (now() + interval '24 hours'),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pending_attribution ENABLE ROW LEVEL SECURITY;
CREATE POLICY pending_attribution_select_workspace ON pending_attribution FOR SELECT
  USING (workspace_id IN (SELECT public.my_company_ids()));
CREATE POLICY pending_attribution_insert_workspace ON pending_attribution FOR INSERT
  WITH CHECK (workspace_id IN (SELECT public.my_company_ids()));

-- 12. TRACKING_SESSIONS (FIX RLS-NULL-02)
CREATE TABLE IF NOT EXISTS tracking_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  landing_page_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  campaign_id text,
  adset_id text,
  ad_id text,
  fbclid text,
  gclid text,
  wbraid text,
  gbraid text,
  ttclid text,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now()
);

ALTER TABLE tracking_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tracking_sessions_select_workspace ON tracking_sessions FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY tracking_sessions_insert_workspace ON tracking_sessions FOR INSERT
  WITH CHECK (company_id IN (SELECT public.my_company_ids()));

-- 13. WEBHOOK_QUEUE
CREATE TABLE IF NOT EXISTS webhook_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  source text DEFAULT 'fonnte',
  payload jsonb NOT NULL,
  status text DEFAULT 'pending',
  retry_count integer DEFAULT 0,
  error_message text,
  received_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY webhook_queue_select_workspace ON webhook_queue FOR SELECT
  USING (workspace_id IN (SELECT public.my_company_ids()));

-- 14. PROCESSED_MESSAGES
CREATE TABLE IF NOT EXISTS processed_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  waha_message_id text,
  source text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE processed_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY processed_messages_select_workspace ON processed_messages FOR SELECT
  USING (workspace_id IN (SELECT public.my_company_ids()));

-- 15. AUTOMATION_RULES
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text,
  action_type text,
  is_active boolean DEFAULT true,
  rule_config jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY automation_rules_select_workspace ON automation_rules FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY automation_rules_insert_workspace ON automation_rules FOR INSERT
  WITH CHECK (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY automation_rules_update_workspace ON automation_rules FOR UPDATE
  USING (company_id IN (SELECT public.my_company_ids()));

-- 16. ANALYTICS_EVENTS
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  event_type text,
  event_data jsonb,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY analytics_events_select_workspace ON analytics_events FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));

-- 17. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  invoice_number text NOT NULL,
  status text DEFAULT 'draft',
  total_amount numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  subtotal numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  due_date date,
  paid_date date,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  is_sent boolean DEFAULT false,
  sent_at timestamptz
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoices_select_workspace ON invoices FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY invoices_insert_workspace ON invoices FOR INSERT
  WITH CHECK (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY invoices_update_workspace ON invoices FOR UPDATE
  USING (company_id IN (SELECT public.my_company_ids()));

-- 18. INVOICE_ITEMS (FIX RLS-NULL-01)
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY invoice_items_select_workspace ON invoice_items FOR SELECT
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (SELECT public.my_company_ids())
  ));
CREATE POLICY invoice_items_insert_workspace ON invoice_items FOR INSERT
  WITH CHECK (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (SELECT public.my_company_ids())
  ));
CREATE POLICY invoice_items_update_workspace ON invoice_items FOR UPDATE
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE company_id IN (SELECT public.my_company_ids())
  ));

-- 19. QUOTATIONS
CREATE TABLE IF NOT EXISTS quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  quotation_number text NOT NULL,
  status text DEFAULT 'draft',
  total_amount numeric DEFAULT 0,
  tax_amount numeric DEFAULT 0,
  subtotal numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  valid_until date,
  created_by uuid REFERENCES auth.users(id),
  notes text
);

ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY quotations_select_workspace ON quotations FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY quotations_insert_workspace ON quotations FOR INSERT
  WITH CHECK (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY quotations_update_workspace ON quotations FOR UPDATE
  USING (company_id IN (SELECT public.my_company_ids()));

-- 20. QUOTATION_ITEMS (FIX RLS-NULL-01)
CREATE TABLE IF NOT EXISTS quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
  description text,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL,
  total numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY quotation_items_select_workspace ON quotation_items FOR SELECT
  USING (quotation_id IN (
    SELECT id FROM quotations WHERE company_id IN (SELECT public.my_company_ids())
  ));
CREATE POLICY quotation_items_insert_workspace ON quotation_items FOR INSERT
  WITH CHECK (quotation_id IN (
    SELECT id FROM quotations WHERE company_id IN (SELECT public.my_company_ids())
  ));
CREATE POLICY quotation_items_update_workspace ON quotation_items FOR UPDATE
  USING (quotation_id IN (
    SELECT id FROM quotations WHERE company_id IN (SELECT public.my_company_ids())
  ));

-- 21. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  description text,
  price numeric DEFAULT 0,
  cost numeric DEFAULT 0,
  sku text,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  image_url text
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_select_workspace ON products FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY products_insert_workspace ON products FOR INSERT
  WITH CHECK (company_id IN (SELECT public.my_company_ids()));
CREATE POLICY products_update_workspace ON products FOR UPDATE
  USING (company_id IN (SELECT public.my_company_ids()));

-- 22. USER_CREDITS
CREATE TABLE IF NOT EXISTS user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric DEFAULT 0,
  total_earned numeric DEFAULT 0,
  total_spent numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_credits_select_own ON user_credits FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY user_credits_update_own ON user_credits FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 23. CREDIT_TRANSACTIONS
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  transaction_type text,
  related_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY credit_transactions_select_own ON credit_transactions FOR SELECT
  USING (user_id = auth.uid());

-- 24. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  transaction_type text,
  status text DEFAULT 'pending',
  related_entity text,
  related_id uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY transactions_select_own ON transactions FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY transactions_insert_own ON transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY transactions_update_own ON transactions FOR UPDATE
  USING (user_id = auth.uid());

-- 25. AI_SUGGESTIONS
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  suggestion_type text,
  content text,
  confidence numeric DEFAULT 0,
  is_accepted boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_suggestions_select_own ON ai_suggestions FOR SELECT
  USING (user_id = auth.uid());

-- 26. AI_TRAINING
CREATE TABLE IF NOT EXISTS ai_training (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_type text,
  model_name text,
  dataset_size integer,
  training_status text DEFAULT 'pending',
  accuracy numeric,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  metadata jsonb
);

ALTER TABLE ai_training ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_training_select_own ON ai_training FOR SELECT
  USING (user_id = auth.uid());

-- 27. AI_TRAINING_DOCUMENTS
CREATE TABLE IF NOT EXISTS ai_training_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_id uuid REFERENCES ai_training(id) ON DELETE CASCADE,
  document_name text,
  document_url text,
  document_type text,
  file_size integer,
  upload_status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_training_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_training_documents_select_own ON ai_training_documents FOR SELECT
  USING (user_id = auth.uid());

-- 28. ACTIVITY_LOG
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text,
  entity_type text,
  entity_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY activity_log_select_own ON activity_log FOR SELECT
  USING (user_id = auth.uid());

-- 29. CUSTOM_CATEGORIES
CREATE TABLE IF NOT EXISTS custom_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE custom_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY custom_categories_select_own ON custom_categories FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY custom_categories_insert_own ON custom_categories FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY custom_categories_update_own ON custom_categories FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY custom_categories_delete_own ON custom_categories FOR DELETE
  USING (user_id = auth.uid());

-- 30. WISHLISTS
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  items jsonb DEFAULT '[]'::jsonb
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY wishlists_select_own ON wishlists FOR SELECT
  USING (user_id = auth.uid() OR is_public = true);
CREATE POLICY wishlists_insert_own ON wishlists FOR INSERT
  WITH CHECK (user_id = auth.uid());
CREATE POLICY wishlists_update_own ON wishlists FOR UPDATE
  USING (user_id = auth.uid());
CREATE POLICY wishlists_delete_own ON wishlists FOR DELETE
  USING (user_id = auth.uid());

-- 31. REMINDER_LOGS
CREATE TABLE IF NOT EXISTS reminder_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  reminder_type text,
  message text,
  is_sent boolean DEFAULT false,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY reminder_logs_select_workspace ON reminder_logs FOR SELECT
  USING (company_id IN (SELECT public.my_company_ids()));

-- 32. FAQS
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text,
  category text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY faqs_select_own ON faqs FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY faqs_insert_own ON faqs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 33. ENTITLEMENTS
CREATE TABLE IF NOT EXISTS entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entitlement_key text NOT NULL,
  entitlement_value text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY entitlements_select_own ON entitlements FOR SELECT
  USING (user_id = auth.uid());

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_companies_owner ON companies(owner_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_workspace ON team_members(workspace_id);
CREATE INDEX idx_leads_company ON leads(company_id);
CREATE INDEX idx_leads_rotator ON leads(rotator_id);
CREATE INDEX idx_lead_clicks_workspace ON lead_clicks(workspace_id);
CREATE INDEX idx_chats_company ON chats(company_id);
CREATE INDEX idx_chats_lead ON chats(lead_id);
CREATE INDEX idx_chat_messages_chat ON chat_messages(chat_id);
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_quotations_company ON quotations(company_id);
CREATE INDEX idx_rotators_workspace ON rotators(workspace_id);
CREATE INDEX idx_whatsapp_sessions_company ON whatsapp_sessions(company_id);
CREATE INDEX idx_tracking_sessions_company ON tracking_sessions(company_id);

-- ============================================================================
-- COMPLETE
-- ============================================================================
-- Schema rebuilt successfully per 03_DATABASE.md
-- DEC-002 implemented: my_company_ids() function + workspace-aware RLS
-- BUG-E06 fixed: All workspace tables use my_company_ids() instead of owner_id
-- BUG-W01 fixed: whatsapp_sessions table created (NEW)
-- RLS-NULL-01 fixed: invoice_items & quotation_items now have RLS policies
-- RLS-NULL-02 fixed: tracking_sessions now has RLS policies
