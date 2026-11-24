-- =============================================================================
-- PARTHA — Supabase PostgreSQL Seed Data
-- Run this in the Supabase SQL Editor after executing the schema migration (supabase/migrations/)
-- =============================================================================

-- 1. SEED USERS
INSERT INTO users (uid, role, name, email, subtitle, usn, branch, semester, target_skills, target_domain, target_company, looking_for_internship, looking_for_project_help)
VALUES
  ('uid_rohan_joshi', 'alumni', 'Rohan Joshi', 'rohan.joshi.alumni@gmail.com', 'Senior Machine Learning Engineer, Google · Class of 2020 CSE', '2VD16CS045', 'CSE', 8, ARRAY['Python', 'PyTorch', 'TensorFlow', 'MLOps'], 'Machine Learning & AI', 'Google', false, false),
  ('uid_ananya_bhat', 'alumni', 'Ananya Bhat', 'ananya.bhat.cloud@aws-alumni.org', 'Senior Cloud Architect, Amazon Web Services · Class of 2021 ISE', '2VD17IS012', 'ISE', 8, ARRAY['Go', 'AWS Lambda', 'Kubernetes'], 'Cloud & Distributed Systems', 'Amazon', false, false),
  ('uid_karthik_hegde', 'alumni', 'Karthik Hegde', 'karthik.hegde.bosch@gmail.com', 'Staff Embedded Systems Engineer, Bosch · Class of 2022 ECE', '2VD18EC028', 'ECE', 8, ARRAY['Embedded C', 'ROS2', 'Robotics'], 'Embedded & Robotics', 'Bosch', false, false),
  ('uid_divya_kulkarni', 'alumni', 'Divya Kulkarni', 'divya.kulkarni.fintech@gmail.com', 'Lead Full-Stack Engineer, PhonePe · Class of 2021 CSE', '2VD17CS031', 'CSE', 8, ARRAY['React', 'TypeScript', 'Node.js', 'Spring Boot'], 'Full-Stack & FinTech', 'PhonePe', false, false),
  ('uid_meera_deshpande', 'alumni', 'Meera Deshpande', 'meera.deshpande.data@gmail.com', 'Senior Data Platform Engineer, Snowflake · Class of 2022 CSE', '2VD18CS052', 'CSE', 8, ARRAY['Apache Spark', 'Snowflake', 'Kafka', 'SQL'], 'Data Engineering', 'Snowflake', false, false),
  ('uid_vikram_patil', 'alumni', 'Vikram Patil', 'vikram.patil.cisco@gmail.com', 'Cybersecurity Analyst, Cisco · Class of 2023 CSE', '2VD19CS068', 'CSE', 8, ARRAY['Network Security', 'Wireshark', 'Linux'], 'Cybersecurity & Infra', 'Cisco', false, false),
  ('uid_priya', 'student', 'Priya Sharma', 'priya.sharma@klsvdit.edu.in', 'CSE · Sem 6 · 2VD22CS034', '2VD22CS034', 'CSE', 6, ARRAY['Machine Learning', 'Python', 'PyTorch', 'React'], 'Machine Learning & AI', 'Google', true, true)
ON CONFLICT (uid) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  target_skills = EXCLUDED.target_skills;

-- 2. SEED ADMINS
INSERT INTO admins (uid, email)
VALUES
  ('uid_admin', 'rajendramadival7@gmail.com')
ON CONFLICT (uid) DO NOTHING;

-- 3. SEED ALUMNI DIRECTORY
INSERT INTO alumni (id, uid, name, graduation_year, branch, role, company, domain, skills, location, open_to_internship_referrals, open_to_project_mentoring, shared_project_guides_count, bio, reg_number, verification_status, source)
VALUES
  ('alu_rohan_joshi', 'uid_rohan_joshi', 'Rohan Joshi', 2020, 'CSE', 'Senior Machine Learning Engineer', 'Google', 'Machine Learning & AI', ARRAY['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'LLMs', 'Distributed Systems'], 'Bengaluru', true, true, 2, 'Working on LLM infrastructure at Google. Happy to help KLS VDIT juniors with system design, ML interviews, and resume reviews.', '2VD16CS045', 'verified', 'self-registered'),
  ('alu_ananya_bhat', 'uid_ananya_bhat', 'Ananya Bhat', 2021, 'ISE', 'Senior Cloud Architect', 'Amazon Web Services (AWS)', 'Cloud & Distributed Systems', ARRAY['Go', 'AWS Lambda', 'Kubernetes', 'Terraform', 'Distributed Storage'], 'Bengaluru', true, true, 1, 'Senior Cloud Architect at AWS. Always open for referrals and guidance on cloud certifications, Docker, and Kubernetes.', '2VD17IS012', 'verified', 'self-registered'),
  ('alu_karthik_hegde', 'uid_karthik_hegde', 'Karthik Hegde', 2022, 'ECE', 'Staff Embedded Systems & Robotics Engineer', 'Bosch Global Software', 'Embedded & Robotics', ARRAY['Embedded C', 'ROS2', 'Robotics', 'FreeRTOS', 'Microcontrollers', 'CAN Bus'], 'Bengaluru', true, true, 1, 'Passionate about autonomous systems and robotics. Open to mentoring students on capstone hardware/firmware projects.', '2VD18EC028', 'verified', 'self-registered'),
  ('alu_divya_kulkarni', 'uid_divya_kulkarni', 'Divya Kulkarni', 2021, 'CSE', 'Lead Full-Stack & FinTech Engineer', 'PhonePe', 'Full-Stack & FinTech', ARRAY['React', 'TypeScript', 'Node.js', 'Spring Boot', 'PostgreSQL', 'Kafka'], 'Bengaluru', true, true, 0, 'Leading consumer payments modules at PhonePe. Reach out for resume reviews, web development tips, and interview prep.', '2VD17CS031', 'verified', 'self-registered'),
  ('alu_meera_deshpande', 'uid_meera_deshpande', 'Meera Deshpande', 2022, 'CSE', 'Senior Data Platform Engineer', 'Snowflake', 'Data Engineering', ARRAY['Apache Spark', 'Snowflake', 'Kafka', 'Airflow', 'SQL', 'Python'], 'Bengaluru', true, true, 0, 'Building scalable data streaming pipelines. Happy to guide on ETL architectures and career transitions to Data Engineering.', '2VD18CS052', 'verified', 'self-registered'),
  ('alu_vikram_patil', 'uid_vikram_patil', 'Vikram Patil', 2023, 'CSE', 'Cybersecurity Analyst', 'Cisco Systems', 'Cybersecurity & Infra', ARRAY['Network Security', 'Wireshark', 'Linux', 'Python', 'Penetration Testing'], 'Bengaluru', true, true, 0, 'Securing enterprise networks at Cisco. Open to reviewing capstone security projects.', '2VD19CS068', 'pending', 'self-registered')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  company = EXCLUDED.company,
  verification_status = EXCLUDED.verification_status;

-- 4. SEED ALUMNI PRIVATE CONTACTS (Privacy-Gated)
INSERT INTO alumni_private_contacts (alumni_id, owner_uid, email, phone, linkedin_url)
VALUES
  ('alu_rohan_joshi', 'uid_rohan_joshi', 'rohan.joshi.alumni@gmail.com', '+91 98860 12345', 'https://linkedin.com/in/rohan-joshi-ai'),
  ('alu_ananya_bhat', 'uid_ananya_bhat', 'ananya.bhat.cloud@aws-alumni.org', '+91 97410 54321', 'https://linkedin.com/in/ananya-bhat-aws'),
  ('alu_karthik_hegde', 'uid_karthik_hegde', 'karthik.hegde.bosch@gmail.com', '+91 94480 67890', 'https://linkedin.com/in/karthik-hegde-robotics'),
  ('alu_divya_kulkarni', 'uid_divya_kulkarni', 'divya.kulkarni.fintech@gmail.com', '+91 99000 87654', 'https://linkedin.com/in/divya-kulkarni-fintech'),
  ('alu_meera_deshpande', 'uid_meera_deshpande', 'meera.deshpande.data@gmail.com', '+91 91120 45678', 'https://linkedin.com/in/meera-deshpande-data'),
  ('alu_vikram_patil', 'uid_vikram_patil', 'vikram.patil.cisco@gmail.com', '+91 93410 99887', 'https://linkedin.com/in/vikram-patil-sec')
ON CONFLICT (alumni_id) DO UPDATE SET
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  linkedin_url = EXCLUDED.linkedin_url;

-- 5. SEED KNOWLEDGE GUIDES
INSERT INTO guides (id, title, domain, summary, content, read_time_minutes, author_id, author_alumni_id, author_name, author_role, author_company, author_batch, upvotes, is_published)
VALUES
  ('guide_ml_interview', 'Cracking Tier-1 Machine Learning & AI Interviews: A Practical Roadmap', 'Machine Learning & AI', 'Detailed preparation plan covering math fundamentals, deep learning, coding problem patterns, and MLOps interview rounds.', 'Phase 1: Linear Algebra, Calculus, and Probability fundamentals. Phase 2: Core Machine Learning algorithms implementation from scratch in NumPy. Phase 3: Deep Learning with PyTorch and Transformers. Phase 4: System Design for ML systems including feature stores, inference latency optimization, and continuous monitoring.', 8, 'uid_rohan_joshi', 'alu_rohan_joshi', 'Rohan Joshi', 'Senior ML Engineer', 'Google', '2020 CSE', 42, true),
  ('guide_aws_cloud', 'From Campus to Cloud Architect: Navigating AWS, System Design & Certifications', 'Cloud & Distributed Systems', 'Guidance on building real cloud projects during engineering, earning AWS Solutions Architect Associate, and system design basics.', 'Start by getting hands-on with the AWS Free Tier. Build a serverless REST API using API Gateway, Lambda, and DynamoDB. Learn Docker containerization and deploy microservices on Amazon ECS or EKS. Practice high-availability system design with multi-region replication.', 6, 'uid_ananya_bhat', 'alu_ananya_bhat', 'Ananya Bhat', 'Senior Cloud Architect', 'Amazon Web Services (AWS)', '2021 ISE', 35, true),
  ('guide_robotics_capstone', 'Building Industry-Ready Autonomous Robotics Capstone Projects', 'Embedded & Robotics', 'Hardware selection, ROS2 architecture, FreeRTOS integration, and how to document and present hardware capstones to recruiters.', 'Focus on choosing microcontrollers like STM32 or ESP32 paired with a Raspberry Pi 4 for high-level SLAM computation. Structure your codebase using ROS2 nodes with clear topic communication. Implement RTOS tasks for real-time sensor polling and motor PWM control.', 7, 'uid_karthik_hegde', 'alu_karthik_hegde', 'Karthik Hegde', 'Staff Embedded Systems Engineer', 'Bosch Global Software', '2022 ECE', 28, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  upvotes = EXCLUDED.upvotes;

-- 6. SEED OPPORTUNITIES
INSERT INTO opportunities (id, title, company, type, domain, location, stipend_or_ctc, skills, description, apply_url, posted_by_id, posted_by_alumni_id, posted_by_name, posted_by_role, is_remote, is_published)
VALUES
  ('opp_google_ai_intern', 'Graduate AI Research Intern', 'Google Labs', 'Internship', 'Machine Learning & AI', 'Bengaluru', '₹85,000 / month', ARRAY['Python', 'PyTorch', 'Transformers', 'Deep Learning'], 'Join the Google AI Labs team in Bengaluru working on next-generation multi-modal foundation models and efficient on-device inference.', 'https://careers.google.com/jobs/results/', 'uid_rohan_joshi', 'alu_rohan_joshi', 'Rohan Joshi', 'Senior ML Engineer, Google', false, true),
  ('opp_aws_cloud_intern', 'Cloud Systems Engineering Intern', 'Amazon Web Services', 'Internship', 'Cloud & Distributed Systems', 'Bengaluru', '₹75,000 / month', ARRAY['Linux', 'Go', 'AWS', 'Docker', 'Bash'], 'Work with AWS Infrastructure teams to build and automate high-scale cloud diagnostic systems and distributed observability tools.', 'https://amazon.jobs/', 'uid_ananya_bhat', 'alu_ananya_bhat', 'Ananya Bhat', 'Senior Cloud Architect, Amazon AWS', true, true),
  ('opp_bosch_embedded_sde', 'Junior Firmware Engineer', 'Bosch Global Software', 'Full-time Job', 'Embedded & Robotics', 'Bengaluru', '12 LPA', ARRAY['Embedded C', 'Microcontrollers', 'FreeRTOS', 'Git'], 'Exciting full-time opportunity for 2024/2025 graduating batches in automotive embedded systems and sensor fusion.', 'https://www.bosch.in/careers/', 'uid_karthik_hegde', 'alu_karthik_hegde', 'Karthik Hegde', 'Staff Embedded Engineer, Bosch', false, true),
  ('opp_phonepe_fullstack', 'Full-Stack SDE-1', 'PhonePe', 'Full-time Job', 'Full-Stack & FinTech', 'Bengaluru', '16 LPA', ARRAY['React', 'TypeScript', 'Node.js', 'Spring Boot', 'SQL'], 'Build high-volume consumer payment micro-frontends and robust merchant reconciliation workflows handling millions of transactions.', 'https://www.phonepe.com/careers/', 'uid_divya_kulkarni', 'alu_divya_kulkarni', 'Divya Kulkarni', 'Lead Full-Stack Engineer, PhonePe', false, true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  company = EXCLUDED.company;

-- 7. SEED MENTORSHIPS
INSERT INTO mentorships (id, student_id, student_name, student_branch, student_semester, student_usn, alumni_id, alumni_owner_uid, alumni_name, alumni_role, alumni_company, alumni_branch, alumni_graduation_year, goal, message, status, session_booking)
VALUES
  ('req_priya_rohan', 'uid_priya', 'Priya Sharma', 'CSE', 6, '2VD22CS034', 'alu_rohan_joshi', 'uid_rohan_joshi', 'Rohan Joshi', 'Senior Machine Learning Engineer', 'Google', 'CSE', 2020, 'Career Guidance', 'Hello Rohan Sir, I am preparing for ML internships and would love your guidance on structuring my PyTorch projects.', 'accepted', '{"id": "sess_1", "status": "confirmed", "topic": "ML Portfolio Review & Interview Prep", "bookedAt": "2024-04-02T11:00:00Z", "slotLabel": "Saturday, 5:00 PM IST", "meetingLink": "https://meet.jit.si/partha-klsvdit-priya-rohan"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status;
