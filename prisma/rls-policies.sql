-- ==============================================================================
-- Zenith Software Hub: PostgreSQL Row-Level Security (RLS) Isolation Policies
-- ==============================================================================
-- This SQL script defines the database-level isolation policies for Zenith Software Hub.
-- When deployed to Managed PostgreSQL (e.g. Neon, Supabase, Railway), these policies
-- ensure that every user's private data (download history, saved items, draft reviews)
-- is strictly isolated at the database engine layer.
-- ==============================================================================

-- 1. Enable Row-Level Security on User-Scoped Tables
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 2. Force RLS for Table Owners as well (Prevents accidental bypass)
ALTER TABLE saved_items FORCE ROW LEVEL SECURITY;
ALTER TABLE download_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE reviews FORCE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. Policies for `saved_items` (User Wishlist / Saved Catalog Items)
-- ==============================================================================

-- Users can only select/view their own saved items
CREATE POLICY saved_items_select_own ON saved_items
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id', true)
    OR (current_setting('app.user_role', true) = 'ADMIN')
  );

-- Users can only insert saved items belonging to themselves
CREATE POLICY saved_items_insert_own ON saved_items
  FOR INSERT
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)
  );

-- Users can only delete their own saved items
CREATE POLICY saved_items_delete_own ON saved_items
  FOR DELETE
  USING (
    user_id = current_setting('app.current_user_id', true)
    OR (current_setting('app.user_role', true) = 'ADMIN')
  );

-- ==============================================================================
-- 4. Policies for `download_logs` (Isolated User Download History)
-- ==============================================================================

-- Users can only read their own download history logs; Admins can view all logs
CREATE POLICY download_logs_select_own ON download_logs
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id', true)
    OR (current_setting('app.user_role', true) = 'ADMIN')
  );

-- Allow inserting download logs for the active user session or system logger
CREATE POLICY download_logs_insert_own ON download_logs
  FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR user_id = current_setting('app.current_user_id', true)
    OR (current_setting('app.user_role', true) = 'ADMIN')
  );

-- Only admins can delete/purge download logs
CREATE POLICY download_logs_delete_admin ON download_logs
  FOR DELETE
  USING (
    current_setting('app.user_role', true) = 'ADMIN'
  );

-- ==============================================================================
-- 5. Policies for `reviews` (User Reviews & Ratings)
-- ==============================================================================

-- Anyone can view approved reviews; Users can always view their own submitted reviews
CREATE POLICY reviews_select_public ON reviews
  FOR SELECT
  USING (
    is_approved = true
    OR user_id = current_setting('app.current_user_id', true)
    OR (current_setting('app.user_role', true) = 'ADMIN')
  );

-- Users can only submit reviews authored by themselves
CREATE POLICY reviews_insert_own ON reviews
  FOR INSERT
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)
  );

-- Users can update their own reviews; Admins can moderate/update any review
CREATE POLICY reviews_update_own ON reviews
  FOR UPDATE
  USING (
    user_id = current_setting('app.current_user_id', true)
    OR (current_setting('app.user_role', true) = 'ADMIN')
  );

-- Users can delete their own reviews; Admins can delete any review
CREATE POLICY reviews_delete_own ON reviews
  FOR DELETE
  USING (
    user_id = current_setting('app.current_user_id', true)
    OR (current_setting('app.user_role', true) = 'ADMIN')
  );

-- ==============================================================================
-- Note for Solo-Developer Operations:
-- Next.js API routes / Prisma middleware can set session parameters before query:
--   SET LOCAL app.current_user_id = '<user_id>';
--   SET LOCAL app.user_role = '<role>';
-- When using Supabase Auth, replace `current_setting('app.current_user_id', true)`
-- with Supabase's native `auth.uid()::text`.
-- ==============================================================================
