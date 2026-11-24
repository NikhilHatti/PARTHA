-- =============================================================================
-- PARTHA — Supabase PostgreSQL Schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 0. SAFE CLEANUP (Removes old partial tables to ensure clean recreation)
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS senior_form_imported CASCADE;
DROP TABLE IF EXISTS senior_forms CASCADE;
DROP TABLE IF EXISTS user_bookmarks CASCADE;
DROP TABLE IF EXISTS guide_upvotes CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS mentorship_messages CASCADE;
DROP TABLE IF EXISTS alumni_private_contacts CASCADE;
DROP TABLE IF EXISTS mentorships CASCADE;
DROP TABLE IF EXISTS alumni CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ---------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'alumni', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('verified', 'pending', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE branch_code AS ENUM ('CSE', 'ISE', 'ECE', 'ME', 'EEE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE opportunity_type AS ENUM ('Internship', 'Full-time Job', 'Collaborative Project');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE alumni_source AS ENUM ('self-registered', 'google-form', 'admin-added');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ---------------------------------------------------------------------------
-- 2. CREATE ALL TABLES
-- ---------------------------------------------------------------------------

-- ADMINS
CREATE TABLE admins (
  uid        TEXT PRIMARY KEY,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS
CREATE TABLE users (
  uid                      TEXT PRIMARY KEY,
  role                     user_role NOT NULL DEFAULT 'student',
  name                     TEXT NOT NULL DEFAULT '',
  email                    TEXT NOT NULL DEFAULT '',
  subtitle                 TEXT NOT NULL DEFAULT '',
  usn                      TEXT NOT NULL DEFAULT '',
  branch                   branch_code NOT NULL DEFAULT 'CSE',
  semester                 INTEGER NOT NULL DEFAULT 6 CHECK (semester BETWEEN 1 AND 8),
  target_skills            TEXT[] NOT NULL DEFAULT '{}',
  target_domain            TEXT NOT NULL DEFAULT '',
  target_company           TEXT NOT NULL DEFAULT '',
  looking_for_internship   BOOLEAN NOT NULL DEFAULT TRUE,
  looking_for_project_help BOOLEAN NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ALUMNI
CREATE TABLE alumni (
  id                           TEXT PRIMARY KEY,
  uid                          TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  name                         TEXT NOT NULL DEFAULT '',
  graduation_year              INTEGER NOT NULL DEFAULT 2022,
  branch                       branch_code NOT NULL DEFAULT 'CSE',
  role                         TEXT NOT NULL DEFAULT '',
  company                      TEXT NOT NULL DEFAULT '',
  domain                       TEXT NOT NULL DEFAULT '',
  skills                       TEXT[] NOT NULL DEFAULT '{}',
  location                     TEXT NOT NULL DEFAULT 'Bengaluru',
  open_to_internship_referrals BOOLEAN NOT NULL DEFAULT TRUE,
  open_to_project_mentoring    BOOLEAN NOT NULL DEFAULT TRUE,
  shared_project_guides_count  INTEGER NOT NULL DEFAULT 0,
  bio                          TEXT NOT NULL DEFAULT '',
  reg_number                   TEXT NOT NULL DEFAULT '',
  verification_status          verification_status NOT NULL DEFAULT 'pending',
  source                       alumni_source NOT NULL DEFAULT 'self-registered',
  avatar_url                   TEXT,
  submitted_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX alumni_verification_idx ON alumni(verification_status);
CREATE INDEX alumni_uid_idx ON alumni(uid);

-- MENTORSHIPS
CREATE TABLE mentorships (
  id                     TEXT PRIMARY KEY,
  student_id             TEXT NOT NULL,
  student_name           TEXT NOT NULL DEFAULT '',
  student_branch         branch_code NOT NULL DEFAULT 'CSE',
  student_semester       INTEGER NOT NULL DEFAULT 6,
  student_usn            TEXT NOT NULL DEFAULT '',
  alumni_id              TEXT NOT NULL,
  alumni_owner_uid       TEXT NOT NULL,
  alumni_name            TEXT NOT NULL DEFAULT '',
  alumni_role            TEXT NOT NULL DEFAULT '',
  alumni_company         TEXT NOT NULL DEFAULT '',
  alumni_branch          branch_code NOT NULL DEFAULT 'CSE',
  alumni_graduation_year INTEGER NOT NULL DEFAULT 2022,
  goal                   TEXT NOT NULL DEFAULT 'Career Guidance',
  message                TEXT NOT NULL DEFAULT '',
  status                 mentorship_status NOT NULL DEFAULT 'pending',
  responded_at           TIMESTAMPTZ,
  session_booking        JSONB,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX mentorships_student_idx ON mentorships(student_id);
CREATE INDEX mentorships_alumni_owner_idx ON mentorships(alumni_owner_uid);
CREATE INDEX mentorships_status_idx ON mentorships(status);

-- ALUMNI PRIVATE CONTACTS (Privacy-Gated)
CREATE TABLE alumni_private_contacts (
  alumni_id    TEXT PRIMARY KEY REFERENCES alumni(id) ON DELETE CASCADE,
  owner_uid    TEXT NOT NULL,
  email        TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- MENTORSHIP MESSAGES
CREATE TABLE mentorship_messages (
  id               TEXT PRIMARY KEY,
  mentorship_id    TEXT NOT NULL REFERENCES mentorships(id) ON DELETE CASCADE,
  student_id       TEXT NOT NULL,
  alumni_owner_uid TEXT NOT NULL,
  sender_id        TEXT NOT NULL,
  sender_name      TEXT NOT NULL DEFAULT '',
  sender_role      TEXT NOT NULL DEFAULT 'student',
  text             TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX messages_mentorship_idx ON mentorship_messages(mentorship_id);

-- OPPORTUNITIES
CREATE TABLE opportunities (
  id                  TEXT PRIMARY KEY,
  title               TEXT NOT NULL DEFAULT '',
  company             TEXT NOT NULL DEFAULT '',
  type                opportunity_type NOT NULL DEFAULT 'Internship',
  domain              TEXT NOT NULL DEFAULT '',
  location            TEXT NOT NULL DEFAULT '',
  stipend_or_ctc      TEXT NOT NULL DEFAULT '',
  skills              TEXT[] NOT NULL DEFAULT '{}',
  description         TEXT NOT NULL DEFAULT '',
  apply_url           TEXT NOT NULL DEFAULT '',
  posted_by_id        TEXT NOT NULL,
  posted_by_alumni_id TEXT NOT NULL,
  posted_by_name      TEXT NOT NULL DEFAULT '',
  posted_by_role      TEXT NOT NULL DEFAULT '',
  is_remote           BOOLEAN NOT NULL DEFAULT FALSE,
  is_published        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX opp_published_idx ON opportunities(is_published);
CREATE INDEX opp_poster_idx ON opportunities(posted_by_id);

-- GUIDES
CREATE TABLE guides (
  id                TEXT PRIMARY KEY,
  title             TEXT NOT NULL DEFAULT '',
  domain            TEXT NOT NULL DEFAULT '',
  summary           TEXT NOT NULL DEFAULT '',
  content           TEXT NOT NULL DEFAULT '',
  read_time_minutes INTEGER NOT NULL DEFAULT 5,
  author_id         TEXT NOT NULL,
  author_alumni_id  TEXT NOT NULL,
  author_name       TEXT NOT NULL DEFAULT '',
  author_role       TEXT NOT NULL DEFAULT '',
  author_company    TEXT NOT NULL DEFAULT '',
  author_batch      TEXT NOT NULL DEFAULT '',
  upvotes           INTEGER NOT NULL DEFAULT 0,
  is_published      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX guides_published_idx ON guides(is_published);
CREATE INDEX guides_author_idx ON guides(author_id);

-- GUIDE UPVOTES
CREATE TABLE guide_upvotes (
  guide_id   TEXT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  uid        TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (guide_id, uid)
);

-- USER BOOKMARKS
CREATE TABLE user_bookmarks (
  id         TEXT PRIMARY KEY,
  owner_uid  TEXT NOT NULL,
  target_id  TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('alumni', 'opportunity')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX bookmarks_owner_idx ON user_bookmarks(owner_uid);

-- SENIOR FORMS
CREATE TABLE senior_forms (
  form_id          TEXT PRIMARY KEY,
  title            TEXT NOT NULL DEFAULT '',
  responder_uri    TEXT NOT NULL DEFAULT '',
  edit_uri         TEXT NOT NULL DEFAULT '',
  created_by_uid   TEXT NOT NULL,
  created_by_email TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- SENIOR FORM IMPORTED
CREATE TABLE senior_form_imported (
  id               TEXT PRIMARY KEY,
  form_id          TEXT NOT NULL REFERENCES senior_forms(form_id) ON DELETE CASCADE,
  response_id      TEXT NOT NULL,
  alumni_id        TEXT NOT NULL,
  created_by_uid   TEXT NOT NULL,
  imported_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX imported_form_idx ON senior_form_imported(form_id);

-- ---------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ---------------------------------------------------------------------------

-- ADMINS POLICIES
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_select_own" ON admins FOR SELECT USING (uid = auth.uid()::text);
CREATE POLICY "admins_service_insert" ON admins FOR INSERT WITH CHECK (true);

-- USERS POLICIES
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (uid = auth.uid()::text);
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (uid = auth.uid()::text);
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (uid = auth.uid()::text);

-- ALUMNI POLICIES
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumni_select_verified" ON alumni FOR SELECT
  USING (verification_status = 'verified' OR uid = auth.uid()::text);
CREATE POLICY "alumni_insert_own" ON alumni FOR INSERT WITH CHECK (uid = auth.uid()::text);
CREATE POLICY "alumni_update_own" ON alumni FOR UPDATE USING (uid = auth.uid()::text);

-- MENTORSHIPS POLICIES
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentorships_participant_select" ON mentorships FOR SELECT
  USING (student_id = auth.uid()::text OR alumni_owner_uid = auth.uid()::text);
CREATE POLICY "mentorships_student_insert" ON mentorships FOR INSERT
  WITH CHECK (student_id = auth.uid()::text);
CREATE POLICY "mentorships_participant_update" ON mentorships FOR UPDATE
  USING (student_id = auth.uid()::text OR alumni_owner_uid = auth.uid()::text);

-- ALUMNI PRIVATE CONTACTS POLICIES
ALTER TABLE alumni_private_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_owner_access" ON alumni_private_contacts FOR SELECT
  USING (
    owner_uid = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM mentorships
      WHERE mentorships.alumni_id = alumni_private_contacts.alumni_id
        AND mentorships.student_id = auth.uid()::text
        AND mentorships.status = 'accepted'
    )
  );
CREATE POLICY "contacts_insert_own" ON alumni_private_contacts FOR INSERT WITH CHECK (owner_uid = auth.uid()::text);
CREATE POLICY "contacts_update_own" ON alumni_private_contacts FOR UPDATE USING (owner_uid = auth.uid()::text);

-- MENTORSHIP MESSAGES POLICIES
ALTER TABLE mentorship_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_participant_select" ON mentorship_messages FOR SELECT
  USING (student_id = auth.uid()::text OR alumni_owner_uid = auth.uid()::text);
CREATE POLICY "messages_participant_insert" ON mentorship_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid()::text);

-- OPPORTUNITIES POLICIES
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opp_select_published" ON opportunities FOR SELECT USING (is_published = TRUE);
CREATE POLICY "opp_insert_own" ON opportunities FOR INSERT WITH CHECK (posted_by_id = auth.uid()::text);
CREATE POLICY "opp_update_own" ON opportunities FOR UPDATE USING (posted_by_id = auth.uid()::text);

-- GUIDES POLICIES
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guides_select_published" ON guides FOR SELECT USING (is_published = TRUE);
CREATE POLICY "guides_insert_own" ON guides FOR INSERT WITH CHECK (author_id = auth.uid()::text);
CREATE POLICY "guides_update_author" ON guides FOR UPDATE USING (author_id = auth.uid()::text);

-- GUIDE UPVOTES POLICIES
ALTER TABLE guide_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "upvotes_select_own" ON guide_upvotes FOR SELECT USING (uid = auth.uid()::text);
CREATE POLICY "upvotes_insert_own" ON guide_upvotes FOR INSERT WITH CHECK (uid = auth.uid()::text);
CREATE POLICY "upvotes_delete_own" ON guide_upvotes FOR DELETE USING (uid = auth.uid()::text);

-- USER BOOKMARKS POLICIES
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_own" ON user_bookmarks FOR ALL USING (owner_uid = auth.uid()::text);

-- SENIOR FORMS POLICIES
ALTER TABLE senior_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forms_own" ON senior_forms FOR ALL USING (created_by_uid = auth.uid()::text);

-- SENIOR FORM IMPORTED POLICIES
ALTER TABLE senior_form_imported ENABLE ROW LEVEL SECURITY;
CREATE POLICY "imported_own" ON senior_form_imported FOR ALL USING (created_by_uid = auth.uid()::text);

-- ---------------------------------------------------------------------------
-- 4. TRIGGERS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','alumni','alumni_private_contacts','mentorships','opportunities','guides']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_set_updated_at ON %I; '
      'CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON %I '
      'FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t, t
    );
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 5. PERMISSIONS (Grant table access to anon and authenticated roles)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

