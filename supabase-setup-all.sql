-- =============================================================================
-- PARTHA (KLS VDIT) — Complete Supabase PostgreSQL Master Setup Script
-- Includes: Clean Reset + Types + Tables + Indexes + RLS + Triggers + Seed Data
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 0. SAFE CLEANUP (Removes old partial tables to ensure clean recreation)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 1. ENUM TYPES
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2. CREATE ALL TABLES
-- -----------------------------------------------------------------------------

-- 2.1 ADMINS
CREATE TABLE admins (
  uid        TEXT PRIMARY KEY,
  email      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 USERS
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

-- 2.3 ALUMNI DIRECTORY
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

-- 2.4 MENTORSHIPS
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

-- 2.5 ALUMNI PRIVATE CONTACTS (Privacy-Gated)
CREATE TABLE alumni_private_contacts (
  alumni_id    TEXT PRIMARY KEY REFERENCES alumni(id) ON DELETE CASCADE,
  owner_uid    TEXT NOT NULL,
  email        TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  linkedin_url TEXT NOT NULL DEFAULT '',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 MENTORSHIP MESSAGES
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

-- 2.7 OPPORTUNITIES
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

-- 2.8 KNOWLEDGE GUIDES
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

-- 2.9 GUIDE UPVOTES
CREATE TABLE guide_upvotes (
  guide_id   TEXT NOT NULL REFERENCES guides(id) ON DELETE CASCADE,
  uid        TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (guide_id, uid)
);

-- 2.10 USER BOOKMARKS
CREATE TABLE user_bookmarks (
  id         TEXT PRIMARY KEY,
  owner_uid  TEXT NOT NULL,
  target_id  TEXT NOT NULL,
  kind       TEXT NOT NULL CHECK (kind IN ('alumni', 'opportunity')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX bookmarks_owner_idx ON user_bookmarks(owner_uid);

-- 2.11 SENIOR INTAKE FORMS
CREATE TABLE senior_forms (
  form_id          TEXT PRIMARY KEY,
  title            TEXT NOT NULL DEFAULT '',
  responder_uri    TEXT NOT NULL DEFAULT '',
  edit_uri         TEXT NOT NULL DEFAULT '',
  created_by_uid   TEXT NOT NULL,
  created_by_email TEXT NOT NULL DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 2.12 SENIOR FORM IMPORTED RESPONSES
CREATE TABLE senior_form_imported (
  id               TEXT PRIMARY KEY,
  form_id          TEXT NOT NULL REFERENCES senior_forms(form_id) ON DELETE CASCADE,
  response_id      TEXT NOT NULL,
  alumni_id        TEXT NOT NULL,
  created_by_uid   TEXT NOT NULL,
  imported_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX imported_form_idx ON senior_form_imported(form_id);

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- Note: auth.uid()::text explicit cast avoids 42883 (text = uuid) error
-- -----------------------------------------------------------------------------

-- ADMINS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_select_own" ON admins FOR SELECT USING (uid = auth.uid()::text);
-- Note: Service role automatically bypasses RLS in Supabase. Non-admin users cannot insert into admins.

-- USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON users FOR SELECT USING (uid = auth.uid()::text);
CREATE POLICY "users_select_admin" ON users FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (uid = auth.uid()::text);
CREATE POLICY "users_update_own" ON users FOR UPDATE
  USING (uid = auth.uid()::text)
  WITH CHECK (
    uid = auth.uid()::text
    AND (
      role != 'admin'
      OR EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text)
    )
  );

-- ALUMNI
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alumni_select_verified" ON alumni FOR SELECT
  USING (verification_status = 'verified' OR uid = auth.uid()::text);
CREATE POLICY "alumni_select_admin" ON alumni FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));
CREATE POLICY "alumni_insert_own" ON alumni FOR INSERT
  WITH CHECK (
    uid = auth.uid()::text
    AND (
      verification_status = 'pending'
      OR EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text)
    )
  );
CREATE POLICY "alumni_update_own" ON alumni FOR UPDATE
  USING (uid = auth.uid()::text)
  WITH CHECK (
    uid = auth.uid()::text
    AND (
      verification_status = (SELECT a.verification_status FROM alumni a WHERE a.id = alumni.id)
      OR EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text)
    )
  );
CREATE POLICY "alumni_update_admin" ON alumni FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));

-- MENTORSHIPS
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentorships_participant_select" ON mentorships FOR SELECT
  USING (student_id = auth.uid()::text OR alumni_owner_uid = auth.uid()::text);
CREATE POLICY "mentorships_admin_select" ON mentorships FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));
CREATE POLICY "mentorships_student_insert" ON mentorships FOR INSERT
  WITH CHECK (student_id = auth.uid()::text);
-- Alumni can accept, decline, or update session booking
CREATE POLICY "mentorships_alumni_update" ON mentorships FOR UPDATE
  USING (alumni_owner_uid = auth.uid()::text);
-- Student can only update their pending request (e.g. withdraw or change message, cannot self-accept)
CREATE POLICY "mentorships_student_update" ON mentorships FOR UPDATE
  USING (student_id = auth.uid()::text)
  WITH CHECK (student_id = auth.uid()::text AND status = 'pending');

-- ALUMNI PRIVATE CONTACTS (Unlocked only for owner or student with accepted mentorship)
ALTER TABLE alumni_private_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contacts_owner_access" ON alumni_private_contacts FOR SELECT
  USING (
    owner_uid = auth.uid()::text
    OR EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text)
    OR EXISTS (
      SELECT 1 FROM mentorships
      WHERE mentorships.alumni_id = alumni_private_contacts.alumni_id
        AND mentorships.student_id = auth.uid()::text
        AND mentorships.status = 'accepted'
    )
  );
CREATE POLICY "contacts_insert_own" ON alumni_private_contacts FOR INSERT WITH CHECK (owner_uid = auth.uid()::text);
CREATE POLICY "contacts_update_own" ON alumni_private_contacts FOR UPDATE USING (owner_uid = auth.uid()::text);

-- MENTORSHIP MESSAGES
ALTER TABLE mentorship_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_participant_select" ON mentorship_messages FOR SELECT
  USING (student_id = auth.uid()::text OR alumni_owner_uid = auth.uid()::text);
CREATE POLICY "messages_participant_insert" ON mentorship_messages FOR INSERT
  WITH CHECK (sender_id = auth.uid()::text);

-- OPPORTUNITIES
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "opp_select_published" ON opportunities FOR SELECT USING (is_published = TRUE);
CREATE POLICY "opp_select_admin" ON opportunities FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));
CREATE POLICY "opp_insert_own" ON opportunities FOR INSERT WITH CHECK (posted_by_id = auth.uid()::text);
CREATE POLICY "opp_update_own" ON opportunities FOR UPDATE USING (posted_by_id = auth.uid()::text);
CREATE POLICY "opp_update_admin" ON opportunities FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));

-- GUIDES
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guides_select_published" ON guides FOR SELECT USING (is_published = TRUE);
CREATE POLICY "guides_select_admin" ON guides FOR SELECT
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));
CREATE POLICY "guides_insert_own" ON guides FOR INSERT WITH CHECK (author_id = auth.uid()::text);
CREATE POLICY "guides_update_author" ON guides FOR UPDATE USING (author_id = auth.uid()::text);
CREATE POLICY "guides_update_admin" ON guides FOR UPDATE
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));

-- GUIDE UPVOTES
ALTER TABLE guide_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "upvotes_select_own" ON guide_upvotes FOR SELECT USING (uid = auth.uid()::text);
CREATE POLICY "upvotes_insert_own" ON guide_upvotes FOR INSERT WITH CHECK (uid = auth.uid()::text);
CREATE POLICY "upvotes_delete_own" ON guide_upvotes FOR DELETE USING (uid = auth.uid()::text);

-- USER BOOKMARKS
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookmarks_own" ON user_bookmarks FOR ALL USING (owner_uid = auth.uid()::text);

-- SENIOR FORMS
ALTER TABLE senior_forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "forms_own" ON senior_forms FOR ALL USING (created_by_uid = auth.uid()::text);
CREATE POLICY "forms_admin" ON senior_forms FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));

-- SENIOR FORM IMPORTED
ALTER TABLE senior_form_imported ENABLE ROW LEVEL SECURITY;
CREATE POLICY "imported_own" ON senior_form_imported FOR ALL USING (created_by_uid = auth.uid()::text);
CREATE POLICY "imported_admin" ON senior_form_imported FOR ALL
  USING (EXISTS (SELECT 1 FROM admins WHERE admins.uid = auth.uid()::text));

-- -----------------------------------------------------------------------------
-- 4. TRIGGERS (Auto-update updated_at timestamp)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 5. SEED DATA (KLS VDIT Real Directory Data)
-- -----------------------------------------------------------------------------

-- 5.1 SEED USERS
INSERT INTO users (uid, role, name, email, subtitle, usn, branch, semester, target_skills, target_domain, target_company, looking_for_internship, looking_for_project_help)
VALUES
  ('uid_rohan_joshi', 'alumni', 'Rohan Joshi', 'rohan.joshi.alumni@gmail.com', 'Senior Machine Learning Engineer, Google · Class of 2020 CSE', '2VD16CS045', 'CSE', 8, ARRAY['Python', 'PyTorch', 'TensorFlow', 'MLOps'], 'Machine Learning & AI', 'Google', false, false),
  ('uid_ananya_bhat', 'alumni', 'Ananya Bhat', 'ananya.bhat.cloud@aws-alumni.org', 'Senior Cloud Architect, Amazon Web Services · Class of 2021 ISE', '2VD17IS012', 'ISE', 8, ARRAY['Go', 'AWS Lambda', 'Kubernetes'], 'Cloud & Distributed Systems', 'Amazon', false, false),
  ('uid_karthik_hegde', 'alumni', 'Karthik Hegde', 'karthik.hegde.bosch@gmail.com', 'Staff Embedded Systems Engineer, Bosch · Class of 2022 ECE', '2VD18EC028', 'ECE', 8, ARRAY['Embedded C', 'ROS2', 'Robotics'], 'Embedded & Robotics', 'Bosch', false, false),
  ('uid_divya_kulkarni', 'alumni', 'Divya Kulkarni', 'divya.kulkarni.fintech@gmail.com', 'Lead Full-Stack Engineer, PhonePe · Class of 2021 CSE', '2VD17CS031', 'CSE', 8, ARRAY['React', 'TypeScript', 'Node.js', 'Spring Boot'], 'Full-Stack & FinTech', 'PhonePe', false, false),
  ('uid_meera_deshpande', 'alumni', 'Meera Deshpande', 'meera.deshpande.data@gmail.com', 'Senior Data Platform Engineer, Snowflake · Class of 2022 CSE', '2VD18CS052', 'CSE', 8, ARRAY['Apache Spark', 'Snowflake', 'Kafka', 'SQL'], 'Data Engineering', 'Snowflake', false, false),
  ('uid_vikram_patil', 'alumni', 'Vikram Patil', 'vikram.patil.cisco@gmail.com', 'Cybersecurity Analyst, Cisco · Class of 2023 CSE', '2VD19CS068', 'CSE', 8, ARRAY['Network Security', 'Wireshark', 'Linux'], 'Cybersecurity & Infra', 'Cisco', false, false),
  ('uid_priya', 'student', 'Priya Sharma', 'priya.sharma@klsvdit.edu.in', 'CSE · Sem 6 · 2VD22CS034', '2VD22CS034', 'CSE', 6, ARRAY['Machine Learning', 'Python', 'PyTorch', 'React'], 'Machine Learning & AI', 'Google', true, true);

-- 5.2 SEED ADMINS
INSERT INTO admins (uid, email)
VALUES
  ('uid_admin', 'rajendramadival7@gmail.com');

-- 5.3 SEED ALUMNI
INSERT INTO alumni (id, uid, name, graduation_year, branch, role, company, domain, skills, location, open_to_internship_referrals, open_to_project_mentoring, shared_project_guides_count, bio, reg_number, verification_status, source)
VALUES
  ('alu_rohan_joshi', 'uid_rohan_joshi', 'Rohan Joshi', 2020, 'CSE', 'Senior Machine Learning Engineer', 'Google', 'Machine Learning & AI', ARRAY['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'LLMs', 'Distributed Systems'], 'Bengaluru', true, true, 2, 'Working on LLM infrastructure at Google. Happy to help KLS VDIT juniors with system design, ML interviews, and resume reviews.', '2VD16CS045', 'verified', 'self-registered'),
  ('alu_ananya_bhat', 'uid_ananya_bhat', 'Ananya Bhat', 2021, 'ISE', 'Senior Cloud Architect', 'Amazon Web Services (AWS)', 'Cloud & Distributed Systems', ARRAY['Go', 'AWS Lambda', 'Kubernetes', 'Terraform', 'Distributed Storage'], 'Bengaluru', true, true, 1, 'Senior Cloud Architect at AWS. Always open for referrals and guidance on cloud certifications, Docker, and Kubernetes.', '2VD17IS012', 'verified', 'self-registered'),
  ('alu_karthik_hegde', 'uid_karthik_hegde', 'Karthik Hegde', 2022, 'ECE', 'Staff Embedded Systems & Robotics Engineer', 'Bosch Global Software', 'Embedded & Robotics', ARRAY['Embedded C', 'ROS2', 'Robotics', 'FreeRTOS', 'Microcontrollers', 'CAN Bus'], 'Bengaluru', true, true, 1, 'Passionate about autonomous systems and robotics. Open to mentoring students on capstone hardware/firmware projects.', '2VD18EC028', 'verified', 'self-registered'),
  ('alu_divya_kulkarni', 'uid_divya_kulkarni', 'Divya Kulkarni', 2021, 'CSE', 'Lead Full-Stack & FinTech Engineer', 'PhonePe', 'Full-Stack & FinTech', ARRAY['React', 'TypeScript', 'Node.js', 'Spring Boot', 'PostgreSQL', 'Kafka'], 'Bengaluru', true, true, 0, 'Leading consumer payments modules at PhonePe. Reach out for resume reviews, web development tips, and interview prep.', '2VD17CS031', 'verified', 'self-registered'),
  ('alu_meera_deshpande', 'uid_meera_deshpande', 'Meera Deshpande', 2022, 'CSE', 'Senior Data Platform Engineer', 'Snowflake', 'Data Engineering', ARRAY['Apache Spark', 'Snowflake', 'Kafka', 'Airflow', 'SQL', 'Python'], 'Bengaluru', true, true, 0, 'Building scalable data streaming pipelines. Happy to guide on ETL architectures and career transitions to Data Engineering.', '2VD18CS052', 'verified', 'self-registered'),
  ('alu_vikram_patil', 'uid_vikram_patil', 'Vikram Patil', 2023, 'CSE', 'Cybersecurity Analyst', 'Cisco Systems', 'Cybersecurity & Infra', ARRAY['Network Security', 'Wireshark', 'Linux', 'Python', 'Penetration Testing'], 'Bengaluru', true, true, 0, 'Securing enterprise networks at Cisco. Open to reviewing capstone security projects.', '2VD19CS068', 'pending', 'self-registered');

-- 5.4 SEED ALUMNI PRIVATE CONTACTS
INSERT INTO alumni_private_contacts (alumni_id, owner_uid, email, phone, linkedin_url)
VALUES
  ('alu_rohan_joshi', 'uid_rohan_joshi', 'rohan.joshi.alumni@gmail.com', '+91 98860 12345', 'https://linkedin.com/in/rohan-joshi-ai'),
  ('alu_ananya_bhat', 'uid_ananya_bhat', 'ananya.bhat.cloud@aws-alumni.org', '+91 97410 54321', 'https://linkedin.com/in/ananya-bhat-aws'),
  ('alu_karthik_hegde', 'uid_karthik_hegde', 'karthik.hegde.bosch@gmail.com', '+91 94480 67890', 'https://linkedin.com/in/karthik-hegde-robotics'),
  ('alu_divya_kulkarni', 'uid_divya_kulkarni', 'divya.kulkarni.fintech@gmail.com', '+91 99000 87654', 'https://linkedin.com/in/divya-kulkarni-fintech'),
  ('alu_meera_deshpande', 'uid_meera_deshpande', 'meera.deshpande.data@gmail.com', '+91 91120 45678', 'https://linkedin.com/in/meera-deshpande-data'),
  ('alu_vikram_patil', 'uid_vikram_patil', 'vikram.patil.cisco@gmail.com', '+91 93410 99887', 'https://linkedin.com/in/vikram-patil-sec');

-- 5.5 SEED KNOWLEDGE GUIDES
INSERT INTO guides (id, title, domain, summary, content, read_time_minutes, author_id, author_alumni_id, author_name, author_role, author_company, author_batch, upvotes, is_published)
VALUES
  ('guide_ml_interview', 'Cracking Tier-1 Machine Learning & AI Interviews: A Practical Roadmap', 'Machine Learning & AI', 'Detailed preparation plan covering math fundamentals, deep learning, coding problem patterns, and MLOps interview rounds.', 'Phase 1: Linear Algebra, Calculus, and Probability fundamentals. Phase 2: Core Machine Learning algorithms implementation from scratch in NumPy. Phase 3: Deep Learning with PyTorch and Transformers. Phase 4: System Design for ML systems including feature stores, inference latency optimization, and continuous monitoring.', 8, 'uid_rohan_joshi', 'alu_rohan_joshi', 'Rohan Joshi', 'Senior ML Engineer', 'Google', '2020 CSE', 42, true),
  ('guide_aws_cloud', 'From Campus to Cloud Architect: Navigating AWS, System Design & Certifications', 'Cloud & Distributed Systems', 'Guidance on building real cloud projects during engineering, earning AWS Solutions Architect Associate, and system design basics.', 'Start by getting hands-on with the AWS Free Tier. Build a serverless REST API using API Gateway, Lambda, and DynamoDB. Learn Docker containerization and deploy microservices on Amazon ECS or EKS. Practice high-availability system design with multi-region replication.', 6, 'uid_ananya_bhat', 'alu_ananya_bhat', 'Ananya Bhat', 'Senior Cloud Architect', 'Amazon Web Services (AWS)', '2021 ISE', 35, true),
  ('guide_robotics_capstone', 'Building Industry-Ready Autonomous Robotics Capstone Projects', 'Embedded & Robotics', 'Hardware selection, ROS2 architecture, FreeRTOS integration, and how to document and present hardware capstones to recruiters.', 'Focus on choosing microcontrollers like STM32 or ESP32 paired with a Raspberry Pi 4 for high-level SLAM computation. Structure your codebase using ROS2 nodes with clear topic communication. Implement RTOS tasks for real-time sensor polling and motor PWM control.', 7, 'uid_karthik_hegde', 'alu_karthik_hegde', 'Karthik Hegde', 'Staff Embedded Systems Engineer', 'Bosch Global Software', '2022 ECE', 28, true);

-- 5.6 SEED OPPORTUNITIES
INSERT INTO opportunities (id, title, company, type, domain, location, stipend_or_ctc, skills, description, apply_url, posted_by_id, posted_by_alumni_id, posted_by_name, posted_by_role, is_remote, is_published)
VALUES
  ('opp_google_ai_intern', 'Graduate AI Research Intern', 'Google Labs', 'Internship', 'Machine Learning & AI', 'Bengaluru', '₹85,000 / month', ARRAY['Python', 'PyTorch', 'Transformers', 'Deep Learning'], 'Join the Google AI Labs team in Bengaluru working on next-generation multi-modal foundation models and efficient on-device inference.', 'https://careers.google.com/jobs/results/', 'uid_rohan_joshi', 'alu_rohan_joshi', 'Rohan Joshi', 'Senior ML Engineer, Google', false, true),
  ('opp_aws_cloud_intern', 'Cloud Systems Engineering Intern', 'Amazon Web Services', 'Internship', 'Cloud & Distributed Systems', 'Bengaluru', '₹75,000 / month', ARRAY['Linux', 'Go', 'AWS', 'Docker', 'Bash'], 'Work with AWS Infrastructure teams to build and automate high-scale cloud diagnostic systems and distributed observability tools.', 'https://amazon.jobs/', 'uid_ananya_bhat', 'alu_ananya_bhat', 'Ananya Bhat', 'Senior Cloud Architect, Amazon AWS', true, true),
  ('opp_bosch_embedded_sde', 'Junior Firmware Engineer', 'Bosch Global Software', 'Full-time Job', 'Embedded & Robotics', 'Bengaluru', '12 LPA', ARRAY['Embedded C', 'Microcontrollers', 'FreeRTOS', 'Git'], 'Exciting full-time opportunity for 2024/2025 graduating batches in automotive embedded systems and sensor fusion.', 'https://www.bosch.in/careers/', 'uid_karthik_hegde', 'alu_karthik_hegde', 'Karthik Hegde', 'Staff Embedded Engineer, Bosch', false, true),
  ('opp_phonepe_fullstack', 'Full-Stack SDE-1', 'PhonePe', 'Full-time Job', 'Full-Stack & FinTech', 'Bengaluru', '16 LPA', ARRAY['React', 'TypeScript', 'Node.js', 'Spring Boot', 'SQL'], 'Build high-volume consumer payment micro-frontends and robust merchant reconciliation workflows handling millions of transactions.', 'https://www.phonepe.com/careers/', 'uid_divya_kulkarni', 'alu_divya_kulkarni', 'Divya Kulkarni', 'Lead Full-Stack Engineer, PhonePe', false, true);

-- 5.7 SEED MENTORSHIPS
INSERT INTO mentorships (id, student_id, student_name, student_branch, student_semester, student_usn, alumni_id, alumni_owner_uid, alumni_name, alumni_role, alumni_company, alumni_branch, alumni_graduation_year, goal, message, status, session_booking)
VALUES
  ('req_priya_rohan', 'uid_priya', 'Priya Sharma', 'CSE', 6, '2VD22CS034', 'alu_rohan_joshi', 'uid_rohan_joshi', 'Rohan Joshi', 'Senior Machine Learning Engineer', 'Google', 'CSE', 2020, 'Career Guidance', 'Hello Rohan Sir, I am preparing for ML internships and would love your guidance on structuring my PyTorch projects.', 'accepted', '{"id": "sess_1", "status": "confirmed", "topic": "ML Portfolio Review & Interview Prep", "bookedAt": "2024-04-02T11:00:00Z", "slotLabel": "Saturday, 5:00 PM IST", "meetingLink": "https://meet.jit.si/partha-klsvdit-priya-rohan"}'::jsonb);

-- -----------------------------------------------------------------------------
-- 6. PERMISSIONS (Grant table access to anon and authenticated roles)
-- -----------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;


-- =============================================================================
-- End of PARTHA Supabase Master Setup Script.
-- All tables, policies, triggers, and seed data are successfully created!
-- =============================================================================
