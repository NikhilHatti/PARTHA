/**
 * parthaSupabase.ts
 * Full Supabase backend service for PARTHA.
 * Handles Supabase Auth, PostgreSQL tables, Row Level Security,
 * and includes rich seed data so the website functions seamlessly
 * both in local/preview mode and connected to live Supabase.
 */
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import type {
  AdminMetrics,
  AlumniContact,
  AlumniProfile,
  AuthUser,
  BranchCode,
  DomainMetric,
  FormResponsePreview,
  KnowledgeGuide,
  MentorshipGoal,
  MentorshipMessage,
  MentorshipRequest,
  MentorshipSessionBooking,
  Opportunity,
  OpportunityType,
  SeniorIntakeForm,
  StudentTargetProfile,
  UserBookmarks,
  UserRole,
  VerificationStatus,
} from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const BOOTSTRAP_ADMIN_EMAIL = 'rajendramadival7@gmail.com';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function clampString(val: string, maxLen: number): string {
  return val.trim().slice(0, maxLen);
}

function sanitizeId(raw: string): string {
  const clean = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
  return clean || `id_${Date.now()}`;
}

function isoNow(): string {
  return new Date().toISOString();
}

function shortDate(iso: string): string {
  return iso.slice(0, 10);
}

function shortTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(`partha_${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(`partha_${key}`, JSON.stringify(val));
  } catch {
    // Ignore storage quota
  }
}

// ---------------------------------------------------------------------------
// Seed Data (Mirrors the exported Excel Sheet)
// ---------------------------------------------------------------------------
const SEED_ALUMNI: AlumniProfile[] = [
  {
    id: 'alu_rohan_joshi',
    ownerUid: 'uid_rohan_joshi',
    name: 'Rohan Joshi',
    graduationYear: 2020,
    branch: 'CSE',
    role: 'Senior Machine Learning Engineer',
    company: 'Google',
    domain: 'Machine Learning & AI',
    skills: ['Python', 'PyTorch', 'TensorFlow', 'MLOps', 'LLMs', 'Distributed Systems'],
    location: 'Bengaluru',
    openToInternshipReferrals: true,
    openToProjectMentoring: true,
    sharedProjectGuidesCount: 2,
    bio: 'Working on LLM infrastructure at Google. Happy to help KLS VDIT juniors with system design, ML interviews, and resume reviews.',
    regNumber: '2VD16CS045',
    verificationStatus: 'verified',
    source: 'self-registered',
    submittedAt: '2024-01-15',
    contact: {
      email: 'rohan.joshi.alumni@gmail.com',
      phone: '+91 98860 12345',
      linkedinUrl: 'https://linkedin.com/in/rohan-joshi-ai',
    },
    isContactGated: true,
    topHighlight: {
      guideId: 'guide_ml_interview',
      title: 'Cracking Tier-1 Machine Learning & AI Interviews',
      upvotes: 42,
    },
  },
  {
    id: 'alu_ananya_bhat',
    ownerUid: 'uid_ananya_bhat',
    name: 'Ananya Bhat',
    graduationYear: 2021,
    branch: 'ISE',
    role: 'Senior Cloud Architect',
    company: 'Amazon Web Services (AWS)',
    domain: 'Cloud & Distributed Systems',
    skills: ['Go', 'AWS Lambda', 'Kubernetes', 'Terraform', 'Distributed Storage'],
    location: 'Bengaluru',
    openToInternshipReferrals: true,
    openToProjectMentoring: true,
    sharedProjectGuidesCount: 1,
    bio: 'Senior Cloud Architect at AWS. Always open for referrals and guidance on cloud certifications, Docker, and Kubernetes.',
    regNumber: '2VD17IS012',
    verificationStatus: 'verified',
    source: 'self-registered',
    submittedAt: '2024-02-10',
    contact: {
      email: 'ananya.bhat.cloud@aws-alumni.org',
      phone: '+91 97410 54321',
      linkedinUrl: 'https://linkedin.com/in/ananya-bhat-aws',
    },
    isContactGated: true,
    topHighlight: {
      guideId: 'guide_aws_cloud',
      title: 'From Campus to Cloud Architect: Navigating AWS',
      upvotes: 35,
    },
  },
  {
    id: 'alu_karthik_hegde',
    ownerUid: 'uid_karthik_hegde',
    name: 'Karthik Hegde',
    graduationYear: 2022,
    branch: 'ECE',
    role: 'Staff Embedded Systems & Robotics Engineer',
    company: 'Bosch Global Software',
    domain: 'Embedded & Robotics',
    skills: ['Embedded C', 'ROS2', 'Robotics', 'FreeRTOS', 'Microcontrollers', 'CAN Bus'],
    location: 'Bengaluru',
    openToInternshipReferrals: true,
    openToProjectMentoring: true,
    sharedProjectGuidesCount: 1,
    bio: 'Passionate about autonomous systems and robotics. Open to mentoring students on capstone hardware/firmware projects.',
    regNumber: '2VD18EC028',
    verificationStatus: 'verified',
    source: 'self-registered',
    submittedAt: '2024-03-01',
    contact: {
      email: 'karthik.hegde.bosch@gmail.com',
      phone: '+91 94480 67890',
      linkedinUrl: 'https://linkedin.com/in/karthik-hegde-robotics',
    },
    isContactGated: true,
    topHighlight: {
      guideId: 'guide_robotics_capstone',
      title: 'Building Industry-Ready Autonomous Robotics Capstones',
      upvotes: 28,
    },
  },
  {
    id: 'alu_divya_kulkarni',
    ownerUid: 'uid_divya_kulkarni',
    name: 'Divya Kulkarni',
    graduationYear: 2021,
    branch: 'CSE',
    role: 'Lead Full-Stack & FinTech Engineer',
    company: 'PhonePe',
    domain: 'Full-Stack & FinTech',
    skills: ['React', 'TypeScript', 'Node.js', 'Spring Boot', 'PostgreSQL', 'Kafka'],
    location: 'Bengaluru',
    openToInternshipReferrals: true,
    openToProjectMentoring: true,
    sharedProjectGuidesCount: 0,
    bio: 'Leading consumer payments modules at PhonePe. Reach out for resume reviews, web development tips, and interview prep.',
    regNumber: '2VD17CS031',
    verificationStatus: 'verified',
    source: 'self-registered',
    submittedAt: '2024-03-15',
    contact: {
      email: 'divya.kulkarni.fintech@gmail.com',
      phone: '+91 99000 87654',
      linkedinUrl: 'https://linkedin.com/in/divya-kulkarni-fintech',
    },
    isContactGated: true,
  },
  {
    id: 'alu_meera_deshpande',
    ownerUid: 'uid_meera_deshpande',
    name: 'Meera Deshpande',
    graduationYear: 2022,
    branch: 'CSE',
    role: 'Senior Data Platform Engineer',
    company: 'Snowflake',
    domain: 'Data Engineering',
    skills: ['Apache Spark', 'Snowflake', 'Kafka', 'Airflow', 'SQL', 'Python'],
    location: 'Bengaluru',
    openToInternshipReferrals: true,
    openToProjectMentoring: true,
    sharedProjectGuidesCount: 0,
    bio: 'Building scalable data streaming pipelines. Happy to guide on ETL architectures and career transitions to Data Engineering.',
    regNumber: '2VD18CS052',
    verificationStatus: 'verified',
    source: 'self-registered',
    submittedAt: '2024-04-01',
    contact: {
      email: 'meera.deshpande.data@gmail.com',
      phone: '+91 91120 45678',
      linkedinUrl: 'https://linkedin.com/in/meera-deshpande-data',
    },
    isContactGated: true,
  },
  {
    id: 'alu_vikram_patil',
    ownerUid: 'uid_vikram_patil',
    name: 'Vikram Patil',
    graduationYear: 2023,
    branch: 'CSE',
    role: 'Cybersecurity Analyst',
    company: 'Cisco Systems',
    domain: 'Cybersecurity & Infra',
    skills: ['Network Security', 'Wireshark', 'Linux', 'Python', 'Penetration Testing'],
    location: 'Bengaluru',
    openToInternshipReferrals: true,
    openToProjectMentoring: true,
    sharedProjectGuidesCount: 0,
    bio: 'Securing enterprise networks at Cisco. Open to reviewing capstone security projects.',
    regNumber: '2VD19CS068',
    verificationStatus: 'pending',
    source: 'self-registered',
    submittedAt: '2024-04-10',
    contact: {
      email: 'vikram.patil.cisco@gmail.com',
      phone: '+91 93410 99887',
      linkedinUrl: 'https://linkedin.com/in/vikram-patil-sec',
    },
    isContactGated: true,
  },
];

const SEED_GUIDES: KnowledgeGuide[] = [
  {
    id: 'guide_ml_interview',
    title: 'Cracking Tier-1 Machine Learning & AI Interviews: A Practical Roadmap',
    domain: 'Machine Learning & AI',
    summary: 'Detailed preparation plan covering math fundamentals, deep learning, coding problem patterns, and MLOps interview rounds.',
    content: 'Phase 1: Linear Algebra, Calculus, and Probability fundamentals. Phase 2: Core Machine Learning algorithms implementation from scratch in NumPy. Phase 3: Deep Learning with PyTorch and Transformers. Phase 4: System Design for ML systems including feature stores, inference latency optimization, and continuous monitoring.',
    readTimeMinutes: 8,
    authorId: 'uid_rohan_joshi',
    authorAlumniId: 'alu_rohan_joshi',
    authorName: 'Rohan Joshi',
    authorRole: 'Senior ML Engineer',
    authorCompany: 'Google',
    authorBatch: '2020 CSE',
    upvotes: 42,
    upvotedByStudent: false,
    publishedAt: '2024-02-15',
  },
  {
    id: 'guide_aws_cloud',
    title: 'From Campus to Cloud Architect: Navigating AWS, System Design & Certifications',
    domain: 'Cloud & Distributed Systems',
    summary: 'Guidance on building real cloud projects during engineering, earning AWS Solutions Architect Associate, and system design basics.',
    content: 'Start by getting hands-on with the AWS Free Tier. Build a serverless REST API using API Gateway, Lambda, and DynamoDB. Learn Docker containerization and deploy microservices on Amazon ECS or EKS. Practice high-availability system design with multi-region replication.',
    readTimeMinutes: 6,
    authorId: 'uid_ananya_bhat',
    authorAlumniId: 'alu_ananya_bhat',
    authorName: 'Ananya Bhat',
    authorRole: 'Senior Cloud Architect',
    authorCompany: 'Amazon Web Services (AWS)',
    authorBatch: '2021 ISE',
    upvotes: 35,
    upvotedByStudent: false,
    publishedAt: '2024-03-01',
  },
  {
    id: 'guide_robotics_capstone',
    title: 'Building Industry-Ready Autonomous Robotics Capstone Projects',
    domain: 'Embedded & Robotics',
    summary: 'Hardware selection, ROS2 architecture, FreeRTOS integration, and how to document and present hardware capstones to recruiters.',
    content: 'Focus on choosing microcontrollers like STM32 or ESP32 paired with a Raspberry Pi 4 for high-level SLAM computation. Structure your codebase using ROS2 nodes with clear topic communication. Implement RTOS tasks for real-time sensor polling and motor PWM control.',
    readTimeMinutes: 7,
    authorId: 'uid_karthik_hegde',
    authorAlumniId: 'alu_karthik_hegde',
    authorName: 'Karthik Hegde',
    authorRole: 'Staff Embedded Systems Engineer',
    authorCompany: 'Bosch Global Software',
    authorBatch: '2022 ECE',
    upvotes: 28,
    upvotedByStudent: false,
    publishedAt: '2024-03-20',
  },
];

const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_google_ai_intern',
    title: 'Graduate AI Research Intern',
    company: 'Google Labs',
    type: 'Internship',
    domain: 'Machine Learning & AI',
    location: 'Bengaluru',
    stipendOrCtc: '₹85,000 / month',
    skills: ['Python', 'PyTorch', 'Transformers', 'Deep Learning'],
    description: 'Join the Google AI Labs team in Bengaluru working on next-generation multi-modal foundation models and efficient on-device inference.',
    applyUrl: 'https://careers.google.com/jobs/results/',
    postedById: 'uid_rohan_joshi',
    postedByAlumniId: 'alu_rohan_joshi',
    postedByName: 'Rohan Joshi',
    postedByRole: 'Senior ML Engineer, Google',
    postedAt: '2024-04-01',
    isRemote: false,
  },
  {
    id: 'opp_aws_cloud_intern',
    title: 'Cloud Systems Engineering Intern',
    company: 'Amazon Web Services',
    type: 'Internship',
    domain: 'Cloud & Distributed Systems',
    location: 'Bengaluru',
    stipendOrCtc: '₹75,000 / month',
    skills: ['Linux', 'Go', 'AWS', 'Docker', 'Bash'],
    description: 'Work with AWS Infrastructure teams to build and automate high-scale cloud diagnostic systems and distributed observability tools.',
    applyUrl: 'https://amazon.jobs/',
    postedById: 'uid_ananya_bhat',
    postedByAlumniId: 'alu_ananya_bhat',
    postedByName: 'Ananya Bhat',
    postedByRole: 'Senior Cloud Architect, Amazon AWS',
    postedAt: '2024-04-05',
    isRemote: true,
  },
  {
    id: 'opp_bosch_embedded_sde',
    title: 'Junior Firmware Engineer',
    company: 'Bosch Global Software',
    type: 'Full-time Job',
    domain: 'Embedded & Robotics',
    location: 'Bengaluru',
    stipendOrCtc: '12 LPA',
    skills: ['Embedded C', 'Microcontrollers', 'FreeRTOS', 'Git'],
    description: 'Exciting full-time opportunity for 2024/2025 graduating batches in automotive embedded systems and sensor fusion.',
    applyUrl: 'https://www.bosch.in/careers/',
    postedById: 'uid_karthik_hegde',
    postedByAlumniId: 'alu_karthik_hegde',
    postedByName: 'Karthik Hegde',
    postedByRole: 'Staff Embedded Engineer, Bosch',
    postedAt: '2024-04-10',
    isRemote: false,
  },
  {
    id: 'opp_phonepe_fullstack',
    title: 'Full-Stack SDE-1',
    company: 'PhonePe',
    type: 'Full-time Job',
    domain: 'Full-Stack & FinTech',
    location: 'Bengaluru',
    stipendOrCtc: '16 LPA',
    skills: ['React', 'TypeScript', 'Node.js', 'Spring Boot', 'SQL'],
    description: 'Build high-volume consumer payment micro-frontends and robust merchant reconciliation workflows handling millions of transactions.',
    applyUrl: 'https://www.phonepe.com/careers/',
    postedById: 'uid_divya_kulkarni',
    postedByAlumniId: 'alu_divya_kulkarni',
    postedByName: 'Divya Kulkarni',
    postedByRole: 'Lead Full-Stack Engineer, PhonePe',
    postedAt: '2024-04-12',
    isRemote: false,
  },
];

// ---------------------------------------------------------------------------
// Admin Check
// ---------------------------------------------------------------------------
export async function isUserAdminAccount(
  uid: string,
  email: string | null | undefined,
): Promise<boolean> {
  if (email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL) return true;
  if (!isSupabaseConfigured) {
    const adminUids = loadStorage<string[]>('admin_uids', []);
    return adminUids.includes(uid);
  }
  try {
    const { data } = await supabase.from('admins').select('uid').eq('uid', uid).maybeSingle();
    return Boolean(data);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// User Accounts
// ---------------------------------------------------------------------------
export async function fetchUserAccount(
  uid: string,
  email?: string | null,
): Promise<AuthUser | null> {
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('users').select('*').eq('uid', uid).maybeSingle();
      if (data) {
        const isAdminAccount = await isUserAdminAccount(uid, email ?? data.email);
        let verificationStatus: VerificationStatus | undefined;
        if (data.role === 'alumni') {
          const { data: alu } = await supabase.from('alumni').select('verification_status').eq('uid', uid).maybeSingle();
          if (alu) verificationStatus = alu.verification_status as VerificationStatus;
        }

        const studentProfile: StudentTargetProfile = {
          id: uid,
          name: String(data.name ?? ''),
          email: String(data.email ?? ''),
          usn: String(data.usn ?? ''),
          branch: (data.branch as BranchCode) ?? 'CSE',
          semester: Number(data.semester ?? 6),
          targetSkills: Array.isArray(data.target_skills) ? (data.target_skills as string[]) : [],
          targetDomain: String(data.target_domain ?? 'Machine Learning & AI'),
          targetCompany: String(data.target_company ?? ''),
          lookingForInternship: Boolean(data.looking_for_internship),
          lookingForProjectHelp: Boolean(data.looking_for_project_help),
        };

        return {
          id: uid,
          role: (data.role as UserRole) ?? 'student',
          name: String(data.name ?? ''),
          email: String(data.email ?? ''),
          subtitle: String(data.subtitle ?? ''),
          isAdminAccount,
          verificationStatus,
          studentProfile,
        };
      }
    } catch {
      // Fall through to local cache
    }
  }

  // Local / Fallback cache
  const localUsers = loadStorage<Record<string, AuthUser>>('users', {});
  if (localUsers[uid]) {
    return localUsers[uid];
  }

  // If bootstrap email
  if (email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL) {
    const adminUser: AuthUser = {
      id: uid,
      role: 'admin',
      name: 'Placement & Alumni Cell',
      email,
      subtitle: 'Placement & Alumni Cell · KLS VDIT',
      isAdminAccount: true,
      verificationStatus: 'verified',
      studentProfile: {
        id: uid,
        name: 'Placement & Alumni Cell',
        email,
        usn: 'ADMIN',
        branch: 'CSE',
        semester: 8,
        targetSkills: ['Machine Learning', 'Python', 'React'],
        targetDomain: 'Machine Learning & AI',
        targetCompany: '',
        lookingForInternship: true,
        lookingForProjectHelp: true,
      },
    };
    localUsers[uid] = adminUser;
    saveStorage('users', localUsers);
    return adminUser;
  }

  return null;
}

export async function registerStudentAccount(
  uid: string,
  email: string,
  payload: {
    name: string;
    usn: string;
    branch: BranchCode;
    semester: number;
    targetSkills: string[];
    targetDomain: string;
  },
): Promise<AuthUser> {
  const cleanName = clampString(payload.name, 120) || 'KLS VDIT Student';
  const cleanUsn = clampString(payload.usn.toUpperCase(), 40);
  const subtitle = `${payload.branch} · Sem ${payload.semester} · ${cleanUsn}`;
  const cleanSkills = payload.targetSkills.slice(0, 15).map((s) => clampString(s, 40)).filter(Boolean);

  const studentProfile: StudentTargetProfile = {
    id: uid,
    name: cleanName,
    email: clampString(email, 160),
    usn: cleanUsn,
    branch: payload.branch,
    semester: Math.min(8, Math.max(1, Math.round(payload.semester))),
    targetSkills: cleanSkills,
    targetDomain: clampString(payload.targetDomain, 100),
    targetCompany: '',
    lookingForInternship: true,
    lookingForProjectHelp: true,
  };

  const account: AuthUser = {
    id: uid,
    role: 'student',
    name: cleanName,
    email: clampString(email, 160),
    subtitle,
    isAdminAccount: email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL,
    studentProfile,
  };

  // Save to local cache
  const localUsers = loadStorage<Record<string, AuthUser>>('users', {});
  localUsers[uid] = account;
  saveStorage('users', localUsers);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('users').upsert({
        uid,
        role: 'student',
        name: cleanName,
        email: clampString(email, 160),
        subtitle: clampString(subtitle, 160),
        usn: cleanUsn,
        branch: payload.branch,
        semester: Math.min(8, Math.max(1, Math.round(payload.semester))),
        target_skills: cleanSkills,
        target_domain: clampString(payload.targetDomain, 100),
        target_company: '',
        looking_for_internship: true,
        looking_for_project_help: true,
        created_at: isoNow(),
        updated_at: isoNow(),
      });
    } catch {
      // Offline fallback succeeded
    }
  }

  return account;
}

export async function registerAlumniAccount(
  uid: string,
  email: string,
  payload: {
    name: string;
    phone: string;
    linkedinUrl: string;
    regNumber: string;
    graduationYear: number;
    branch: BranchCode;
    role: string;
    company: string;
    domain: string;
    skills: string[];
    location: string;
    bio: string;
  },
): Promise<AuthUser> {
  const cleanName = clampString(payload.name, 120) || 'KLS VDIT Alumnus';
  const cleanRole = clampString(payload.role, 120) || 'Engineer';
  const cleanCompany = clampString(payload.company, 120) || 'Company';
  const cleanUsn = clampString(payload.regNumber.toUpperCase(), 40);
  const gradYear = Math.min(2035, Math.max(1995, Math.round(payload.graduationYear)));
  const cleanSkills = payload.skills.slice(0, 20).map((s) => clampString(s, 40)).filter(Boolean);
  const subtitle = `${cleanRole}, ${cleanCompany} · Class of ${gradYear} ${payload.branch}`;
  const alumniId = uid;

  const newAlumniRecord: AlumniProfile = {
    id: alumniId,
    ownerUid: uid,
    name: cleanName,
    graduationYear: gradYear,
    branch: payload.branch,
    role: cleanRole,
    company: cleanCompany,
    domain: clampString(payload.domain, 100),
    skills: cleanSkills,
    location: clampString(payload.location || 'Bengaluru', 100),
    openToInternshipReferrals: true,
    openToProjectMentoring: true,
    sharedProjectGuidesCount: 0,
    bio: clampString(payload.bio, 1000),
    regNumber: cleanUsn,
    verificationStatus: 'pending',
    source: 'self-registered',
    submittedAt: shortDate(isoNow()),
    contact: {
      email: clampString(email, 160),
      phone: clampString(payload.phone, 40),
      linkedinUrl: clampString(payload.linkedinUrl, 300),
    },
    isContactGated: true,
  };

  const account: AuthUser = {
    id: uid,
    role: 'alumni',
    name: cleanName,
    email: clampString(email, 160),
    subtitle,
    isAdminAccount: email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL,
    verificationStatus: 'pending',
  };

  // Update local cache
  const localUsers = loadStorage<Record<string, AuthUser>>('users', {});
  localUsers[uid] = account;
  saveStorage('users', localUsers);

  const localAlumni = loadStorage<AlumniProfile[]>('alumni', SEED_ALUMNI);
  saveStorage('alumni', [newAlumniRecord, ...localAlumni.filter((a) => a.id !== alumniId)]);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('users').upsert({
        uid,
        role: 'alumni',
        name: cleanName,
        email: clampString(email, 160),
        subtitle: clampString(subtitle, 160),
        usn: cleanUsn,
        branch: payload.branch,
        semester: 8,
        target_skills: cleanSkills.slice(0, 15),
        target_domain: clampString(payload.domain, 100),
        target_company: '',
        looking_for_internship: false,
        looking_for_project_help: false,
        created_at: isoNow(),
        updated_at: isoNow(),
      });
      await supabase.from('alumni').upsert({
        id: alumniId,
        uid,
        name: cleanName,
        graduation_year: gradYear,
        branch: payload.branch,
        role: cleanRole,
        company: cleanCompany,
        domain: clampString(payload.domain, 100),
        skills: cleanSkills,
        location: clampString(payload.location || 'Bengaluru', 100),
        open_to_internship_referrals: true,
        open_to_project_mentoring: true,
        shared_project_guides_count: 0,
        bio: clampString(payload.bio, 1000),
        reg_number: cleanUsn,
        verification_status: 'pending',
        source: 'self-registered',
        submitted_at: isoNow(),
        updated_at: isoNow(),
      });
      await supabase.from('alumni_private_contacts').upsert({
        alumni_id: alumniId,
        owner_uid: uid,
        email: clampString(email, 160),
        phone: clampString(payload.phone, 40),
        linkedin_url: clampString(payload.linkedinUrl, 300),
        updated_at: isoNow(),
      });
    } catch {
      // Handled via local storage
    }
  }

  return account;
}

export async function setupAdminAccount(
  uid: string,
  email: string,
  name: string,
): Promise<AuthUser> {
  const cleanName = clampString(name || 'Placement & Alumni Cell', 120);
  const account: AuthUser = {
    id: uid,
    role: 'admin',
    name: cleanName,
    email: clampString(email, 160),
    subtitle: 'Placement & Alumni Cell · KLS VDIT',
    isAdminAccount: true,
    verificationStatus: 'verified',
  };

  const localUsers = loadStorage<Record<string, AuthUser>>('users', {});
  localUsers[uid] = account;
  saveStorage('users', localUsers);

  const adminUids = loadStorage<string[]>('admin_uids', []);
  if (!adminUids.includes(uid)) {
    adminUids.push(uid);
    saveStorage('admin_uids', adminUids);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('users').upsert({
        uid,
        role: 'admin',
        name: cleanName,
        email: clampString(email, 160),
        subtitle: 'Placement & Alumni Cell · KLS VDIT',
        usn: 'ADMIN',
        branch: 'CSE',
        semester: 8,
        target_skills: ['Machine Learning', 'Python', 'React'],
        target_domain: 'Machine Learning & AI',
        target_company: '',
        looking_for_internship: true,
        looking_for_project_help: true,
        created_at: isoNow(),
        updated_at: isoNow(),
      });
    } catch {
      // Handled via local storage
    }
  }

  return account;
}

export async function switchUserActiveRole(
  user: AuthUser,
  nextRole: UserRole,
): Promise<AuthUser> {
  const updated = { ...user, role: nextRole };
  const localUsers = loadStorage<Record<string, AuthUser>>('users', {});
  localUsers[user.id] = updated;
  saveStorage('users', localUsers);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('users').update({ role: nextRole, updated_at: isoNow() }).eq('uid', user.id);
    } catch {
      // Handled via local storage
    }
  }

  return updated;
}

export async function updateStudentProfile(
  uid: string,
  updates: Partial<StudentTargetProfile>,
): Promise<StudentTargetProfile> {
  const localUsers = loadStorage<Record<string, AuthUser>>('users', {});
  const user = localUsers[uid];
  const currentProfile = user?.studentProfile ?? {
    id: uid,
    name: user?.name ?? 'KLS VDIT Student',
    email: user?.email ?? '',
    usn: '',
    branch: 'CSE' as BranchCode,
    semester: 6,
    targetSkills: ['Machine Learning', 'Python'],
    targetDomain: 'Machine Learning & AI',
    targetCompany: '',
    lookingForInternship: true,
    lookingForProjectHelp: true,
  };

  const updatedProfile: StudentTargetProfile = {
    ...currentProfile,
    ...updates,
  };

  if (user) {
    user.studentProfile = updatedProfile;
    localUsers[uid] = user;
    saveStorage('users', localUsers);
  }

  if (isSupabaseConfigured) {
    try {
      const payload: Record<string, unknown> = { updated_at: isoNow() };
      if (updates.name) payload.name = updates.name;
      if (updates.branch) payload.branch = updates.branch;
      if (updates.semester) payload.semester = updates.semester;
      if (updates.usn) payload.usn = updates.usn;
      if (updates.targetSkills) payload.target_skills = updates.targetSkills;
      if (updates.targetDomain) payload.target_domain = updates.targetDomain;
      if (updates.targetCompany !== undefined) payload.target_company = updates.targetCompany;
      if (updates.lookingForInternship !== undefined) payload.looking_for_internship = updates.lookingForInternship;
      if (updates.lookingForProjectHelp !== undefined) payload.looking_for_project_help = updates.lookingForProjectHelp;
      await supabase.from('users').update(payload).eq('uid', uid);
    } catch {
      // Handled via local storage
    }
  }

  return updatedProfile;
}

export async function updateAlumniAvailability(
  alumniId: string,
  updates: { openToInternshipReferrals?: boolean; openToProjectMentoring?: boolean },
): Promise<void> {
  const localAlumni = loadStorage<AlumniProfile[]>('alumni', SEED_ALUMNI);
  const found = localAlumni.find((a) => a.id === alumniId);
  if (found) {
    if (typeof updates.openToInternshipReferrals === 'boolean') {
      found.openToInternshipReferrals = updates.openToInternshipReferrals;
    }
    if (typeof updates.openToProjectMentoring === 'boolean') {
      found.openToProjectMentoring = updates.openToProjectMentoring;
    }
    saveStorage('alumni', localAlumni);
  }

  if (isSupabaseConfigured) {
    try {
      const payload: Record<string, unknown> = { updated_at: isoNow() };
      if (typeof updates.openToInternshipReferrals === 'boolean') {
        payload.open_to_internship_referrals = updates.openToInternshipReferrals;
      }
      if (typeof updates.openToProjectMentoring === 'boolean') {
        payload.open_to_project_mentoring = updates.openToProjectMentoring;
      }
      await supabase.from('alumni').update(payload).eq('id', alumniId);
    } catch {
      // Handled
    }
  }
}

export async function updateAlumniProfileDetails(
  user: AuthUser,
  existingAlumni: AlumniProfile | undefined,
  payload: {
    name: string;
    regNumber: string;
    graduationYear: number;
    branch: BranchCode;
    role: string;
    company: string;
    domain: string;
    skills: string[];
    location: string;
    bio: string;
    openToInternshipReferrals: boolean;
    openToProjectMentoring: boolean;
    contactEmail: string;
    phone: string;
    linkedinUrl: string;
  },
): Promise<AuthUser> {
  const cleanName = clampString(payload.name, 120) || user.name;
  const targetId = existingAlumni?.id ?? user.id;

  const localAlumni = loadStorage<AlumniProfile[]>('alumni', SEED_ALUMNI);
  const idx = localAlumni.findIndex((a) => a.id === targetId);

  const updatedRecord: AlumniProfile = {
    id: targetId,
    ownerUid: user.id,
    name: cleanName,
    graduationYear: payload.graduationYear,
    branch: payload.branch,
    role: payload.role,
    company: payload.company,
    domain: payload.domain,
    skills: payload.skills,
    location: payload.location,
    bio: payload.bio,
    openToInternshipReferrals: payload.openToInternshipReferrals,
    openToProjectMentoring: payload.openToProjectMentoring,
    sharedProjectGuidesCount: existingAlumni?.sharedProjectGuidesCount ?? 0,
    regNumber: payload.regNumber,
    verificationStatus: existingAlumni?.verificationStatus ?? 'pending',
    source: existingAlumni?.source ?? 'self-registered',
    submittedAt: existingAlumni?.submittedAt ?? shortDate(isoNow()),
    contact: {
      email: payload.contactEmail || user.email,
      phone: payload.phone,
      linkedinUrl: payload.linkedinUrl,
    },
    isContactGated: true,
  };

  if (idx >= 0) {
    localAlumni[idx] = updatedRecord;
  } else {
    localAlumni.unshift(updatedRecord);
  }
  saveStorage('alumni', localAlumni);

  const updatedUser = { ...user, name: cleanName };
  const localUsers = loadStorage<Record<string, AuthUser>>('users', {});
  localUsers[user.id] = updatedUser;
  saveStorage('users', localUsers);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('alumni').upsert({
        id: targetId,
        uid: user.id,
        name: cleanName,
        graduation_year: payload.graduationYear,
        branch: payload.branch,
        role: payload.role,
        company: payload.company,
        domain: payload.domain,
        skills: payload.skills,
        location: payload.location,
        bio: payload.bio,
        open_to_internship_referrals: payload.openToInternshipReferrals,
        open_to_project_mentoring: payload.openToProjectMentoring,
        reg_number: payload.regNumber,
        updated_at: isoNow(),
      });
      await supabase.from('alumni_private_contacts').upsert({
        alumni_id: targetId,
        owner_uid: user.id,
        email: payload.contactEmail || user.email,
        phone: payload.phone,
        linkedin_url: payload.linkedinUrl,
        updated_at: isoNow(),
      });
    } catch {
      // Local fallback succeeded
    }
  }

  return updatedUser;
}

export async function updateAdminProfileDetails(
  user: AuthUser,
  payload: { name: string; subtitle: string; branch: BranchCode },
): Promise<AuthUser> {
  const cleanName = clampString(payload.name, 120) || user.name;
  const updatedUser: AuthUser = {
    ...user,
    name: cleanName,
    subtitle: payload.subtitle || user.subtitle,
  };

  const localUsers = loadStorage<Record<string, AuthUser>>('users', {});
  localUsers[user.id] = updatedUser;
  saveStorage('users', localUsers);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('users').update({
        name: cleanName,
        subtitle: payload.subtitle,
        branch: payload.branch,
        updated_at: isoNow(),
      }).eq('uid', user.id);
    } catch {
      // Local fallback succeeded
    }
  }

  return updatedUser;
}

// ---------------------------------------------------------------------------
// Alumni Profiles Directory
// ---------------------------------------------------------------------------
export async function listAlumniProfiles(
  currentUser: AuthUser,
  guides: KnowledgeGuide[],
  mentorships: MentorshipRequest[],
): Promise<AlumniProfile[]> {
  let list = loadStorage<AlumniProfile[]>('alumni', SEED_ALUMNI);

  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('alumni').select('*');
      if (data && data.length > 0) {
        list = data.map((d) => ({
          id: d.id,
          ownerUid: d.uid,
          name: d.name,
          graduationYear: d.graduation_year,
          branch: d.branch as BranchCode,
          role: d.role,
          company: d.company,
          domain: d.domain,
          skills: d.skills ?? [],
          location: d.location,
          openToInternshipReferrals: d.open_to_internship_referrals,
          openToProjectMentoring: d.open_to_project_mentoring,
          sharedProjectGuidesCount: d.shared_project_guides_count ?? 0,
          bio: d.bio,
          regNumber: d.reg_number,
          verificationStatus: d.verification_status as VerificationStatus,
          source: d.source,
          submittedAt: shortDate(d.submitted_at ?? isoNow()),
          contact: null,
          isContactGated: true,
        }));
      }
    } catch {
      // Use local list
    }
  }

  const acceptedAlumniIds = new Set(
    mentorships.filter((m) => m.status === 'accepted').map((m) => m.alumniId),
  );

  const topGuideByAlumni = new Map<string, KnowledgeGuide>();
  for (const g of guides) {
    const existing = topGuideByAlumni.get(g.authorAlumniId);
    if (!existing || g.upvotes > existing.upvotes) {
      topGuideByAlumni.set(g.authorAlumniId, g);
    }
  }

  const isBootstrap =
    currentUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL &&
    currentUser.role === 'admin';

  return list
    .filter((a) => {
      if (isBootstrap || currentUser.role === 'admin') return true;
      if (currentUser.role === 'alumni' && a.ownerUid === currentUser.id) return true;
      return a.verificationStatus === 'verified';
    })
    .map((a) => {
      const topGuide = topGuideByAlumni.get(a.id);
      const isUnlocked = isBootstrap || a.ownerUid === currentUser.id || acceptedAlumniIds.has(a.id);
      return {
        ...a,
        topHighlight: topGuide
          ? { guideId: topGuide.id, title: topGuide.title, upvotes: topGuide.upvotes }
          : a.topHighlight,
        isContactGated: !isUnlocked,
        contact: isUnlocked ? a.contact : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function verifyAlumniProfile(alumniId: string): Promise<void> {
  const localAlumni = loadStorage<AlumniProfile[]>('alumni', SEED_ALUMNI);
  const found = localAlumni.find((a) => a.id === alumniId);
  if (found) {
    found.verificationStatus = 'verified';
    saveStorage('alumni', localAlumni);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('alumni').update({ verification_status: 'verified', updated_at: isoNow() }).eq('id', alumniId);
    } catch {
      // Fallback updated
    }
  }
}

export async function rejectAlumniProfile(alumniId: string): Promise<void> {
  const localAlumni = loadStorage<AlumniProfile[]>('alumni', SEED_ALUMNI);
  const found = localAlumni.find((a) => a.id === alumniId);
  if (found) {
    found.verificationStatus = 'rejected';
    saveStorage('alumni', localAlumni);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('alumni').update({ verification_status: 'rejected', updated_at: isoNow() }).eq('id', alumniId);
    } catch {
      // Fallback updated
    }
  }
}

// ---------------------------------------------------------------------------
// Mentorships
// ---------------------------------------------------------------------------
const SEED_MENTORSHIPS: MentorshipRequest[] = [
  {
    id: 'req_priya_rohan',
    studentId: 'uid_priya',
    studentName: 'Priya Sharma',
    studentBranch: 'CSE',
    studentSemester: 6,
    studentUsn: '2VD22CS034',
    alumniId: 'alu_rohan_joshi',
    alumniOwnerUid: 'uid_rohan_joshi',
    alumniName: 'Rohan Joshi',
    alumniRole: 'Senior Machine Learning Engineer',
    alumniCompany: 'Google',
    alumniBranch: 'CSE',
    alumniGraduationYear: 2020,
    goal: 'Career Guidance',
    message: 'Hello Rohan Sir, I am preparing for ML internships and would love your guidance on structuring my PyTorch projects.',
    status: 'accepted',
    createdAt: '2024-04-01T10:00:00Z',
    unlockedContact: {
      email: 'rohan.joshi.alumni@gmail.com',
      phone: '+91 98860 12345',
      linkedinUrl: 'https://linkedin.com/in/rohan-joshi-ai',
    },
    messages: [
      {
        id: 'msg_1',
        senderId: 'uid_rohan_joshi',
        senderName: 'Rohan Joshi',
        senderRole: 'alumni',
        text: 'Hi Priya! Glad to connect. Share your GitHub link and we can schedule a quick 1-on-1 call this weekend.',
        sentAt: 'Apr 2, 4:30 PM',
      },
    ],
    sessionBooking: {
      id: 'sess_1',
      slotLabel: 'Saturday, 5:00 PM IST',
      topic: 'ML Portfolio Review & Interview Prep',
      status: 'confirmed',
      meetingLink: 'https://meet.jit.si/partha-klsvdit-priya-rohan',
      bookedAt: '2024-04-02T11:00:00Z',
    },
  },
];

export async function listMentorshipsForUser(
  currentUser: AuthUser,
): Promise<MentorshipRequest[]> {
  let list = loadStorage<MentorshipRequest[]>('mentorships', SEED_MENTORSHIPS);

  if (isSupabaseConfigured) {
    try {
      const query = currentUser.role === 'alumni'
        ? supabase.from('mentorships').select('*').eq('alumni_owner_uid', currentUser.id)
        : supabase.from('mentorships').select('*').eq('student_id', currentUser.id);
      const { data } = await query;
      if (data && data.length > 0) {
        list = data.map((d) => ({
          id: d.id,
          studentId: d.student_id,
          studentName: d.student_name,
          studentBranch: d.student_branch as BranchCode,
          studentSemester: d.student_semester,
          studentUsn: d.student_usn,
          alumniId: d.alumni_id,
          alumniOwnerUid: d.alumni_owner_uid,
          alumniName: d.alumni_name,
          alumniRole: d.alumni_role,
          alumniCompany: d.alumni_company,
          alumniBranch: d.alumni_branch as BranchCode,
          alumniGraduationYear: d.alumni_graduation_year,
          goal: d.goal as MentorshipGoal,
          message: d.message,
          status: d.status as MentorshipRequest['status'],
          createdAt: d.created_at ?? isoNow(),
          respondedAt: d.responded_at ?? undefined,
          unlockedContact: null,
          messages: [],
          sessionBooking: d.session_booking ?? null,
        }));
      }
    } catch {
      // Local fallback
    }
  }

  const isBootstrap =
    currentUser.email.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL &&
    currentUser.role === 'admin';

  return list.filter((m) => {
    if (isBootstrap || currentUser.role === 'admin') return true;
    if (currentUser.role === 'alumni') return m.alumniOwnerUid === currentUser.id;
    return m.studentId === currentUser.id;
  });
}

export async function createMentorshipRequest(
  studentUser: AuthUser,
  alumni: AlumniProfile,
  payload: { goal: MentorshipGoal; message: string },
): Promise<void> {
  const mentorshipId = `${studentUser.id}__${alumni.id}`;
  const profile = studentUser.studentProfile;
  const newReq: MentorshipRequest = {
    id: mentorshipId,
    studentId: studentUser.id,
    studentName: clampString(studentUser.name, 120),
    studentBranch: profile?.branch ?? 'CSE',
    studentSemester: profile?.semester ?? 6,
    studentUsn: clampString(profile?.usn ?? '', 40),
    alumniId: alumni.id,
    alumniOwnerUid: alumni.ownerUid,
    alumniName: clampString(alumni.name, 120),
    alumniRole: clampString(alumni.role, 120),
    alumniCompany: clampString(alumni.company, 120),
    alumniBranch: alumni.branch,
    alumniGraduationYear: alumni.graduationYear,
    goal: payload.goal,
    message: clampString(payload.message, 1000),
    status: 'pending',
    sessionBooking: null,
    createdAt: isoNow(),
    unlockedContact: null,
    messages: [],
  };

  const local = loadStorage<MentorshipRequest[]>('mentorships', SEED_MENTORSHIPS);
  saveStorage('mentorships', [newReq, ...local.filter((m) => m.id !== mentorshipId)]);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('mentorships').upsert({
        id: mentorshipId,
        student_id: studentUser.id,
        student_name: clampString(studentUser.name, 120),
        student_branch: profile?.branch ?? 'CSE',
        student_semester: profile?.semester ?? 6,
        student_usn: clampString(profile?.usn ?? '', 40),
        alumni_id: alumni.id,
        alumni_owner_uid: alumni.ownerUid,
        alumni_name: clampString(alumni.name, 120),
        alumni_role: clampString(alumni.role, 120),
        alumni_company: clampString(alumni.company, 120),
        alumni_branch: alumni.branch,
        alumni_graduation_year: alumni.graduationYear,
        goal: payload.goal,
        message: clampString(payload.message, 1000),
        status: 'pending',
        session_booking: null,
        created_at: isoNow(),
        updated_at: isoNow(),
      });
    } catch {
      // Local saved
    }
  }
}

export async function respondToMentorshipRequest(
  mentorshipId: string,
  decision: 'accepted' | 'declined',
): Promise<void> {
  const local = loadStorage<MentorshipRequest[]>('mentorships', SEED_MENTORSHIPS);
  const found = local.find((m) => m.id === mentorshipId);
  if (found) {
    found.status = decision;
    found.respondedAt = isoNow();
    if (decision === 'accepted') {
      const alumniList = loadStorage<AlumniProfile[]>('alumni', SEED_ALUMNI);
      const targetAlu = alumniList.find((a) => a.id === found.alumniId);
      if (targetAlu) {
        found.unlockedContact = targetAlu.contact;
      }
    }
    saveStorage('mentorships', local);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('mentorships').update({
        status: decision,
        responded_at: isoNow(),
        updated_at: isoNow(),
      }).eq('id', mentorshipId);
    } catch {
      // Local saved
    }
  }
}

export async function sendMentorshipMessage(
  mentorship: MentorshipRequest,
  sender: AuthUser,
  text: string,
): Promise<void> {
  const msg: MentorshipMessage = {
    id: `msg_${Date.now()}`,
    senderId: sender.id,
    senderName: clampString(sender.name, 120),
    senderRole: sender.role === 'alumni' ? 'alumni' : 'student',
    text: clampString(text, 1000),
    sentAt: shortTime(isoNow()),
  };

  const local = loadStorage<MentorshipRequest[]>('mentorships', SEED_MENTORSHIPS);
  const found = local.find((m) => m.id === mentorship.id);
  if (found) {
    found.messages = [...(found.messages ?? []), msg];
    saveStorage('mentorships', local);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('mentorship_messages').insert({
        id: msg.id,
        mentorship_id: mentorship.id,
        student_id: mentorship.studentId,
        alumni_owner_uid: mentorship.alumniOwnerUid,
        sender_id: sender.id,
        sender_name: msg.senderName,
        sender_role: msg.senderRole,
        text: msg.text,
        created_at: isoNow(),
      });
    } catch {
      // Local saved
    }
  }
}

export async function bookMentorshipSession(
  mentorshipId: string,
  payload: { slotLabel: string; topic: string },
): Promise<void> {
  const booking: MentorshipSessionBooking = {
    id: `sess_${Date.now()}`,
    slotLabel: clampString(payload.slotLabel, 120),
    topic: clampString(payload.topic || 'Mentorship Discussion', 200),
    status: 'requested',
    meetingLink: `https://meet.jit.si/partha-klsvdit-${sanitizeId(mentorshipId).slice(0, 24)}`,
    bookedAt: isoNow(),
  };

  const local = loadStorage<MentorshipRequest[]>('mentorships', SEED_MENTORSHIPS);
  const found = local.find((m) => m.id === mentorshipId);
  if (found) {
    found.sessionBooking = booking;
    saveStorage('mentorships', local);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('mentorships').update({
        session_booking: booking,
        updated_at: isoNow(),
      }).eq('id', mentorshipId);
    } catch {
      // Local saved
    }
  }
}

export async function confirmMentorshipSession(
  mentorship: MentorshipRequest,
): Promise<void> {
  if (!mentorship.sessionBooking) return;
  const local = loadStorage<MentorshipRequest[]>('mentorships', SEED_MENTORSHIPS);
  const found = local.find((m) => m.id === mentorship.id);
  if (found && found.sessionBooking) {
    found.sessionBooking.status = 'confirmed';
    saveStorage('mentorships', local);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('mentorships').update({
        session_booking: { ...mentorship.sessionBooking, status: 'confirmed' },
        updated_at: isoNow(),
      }).eq('id', mentorship.id);
    } catch {
      // Local saved
    }
  }
}

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------
export async function getUserBookmarks(uid: string): Promise<UserBookmarks> {
  const local = loadStorage<UserBookmarks>(`bookmarks_${uid}`, { alumniIds: [], opportunityIds: [] });
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('user_bookmarks').select('kind, target_id').eq('owner_uid', uid);
      if (data) {
        const alumniIds: string[] = [];
        const opportunityIds: string[] = [];
        data.forEach((r) => {
          if (r.kind === 'alumni') alumniIds.push(r.target_id);
          if (r.kind === 'opportunity') opportunityIds.push(r.target_id);
        });
        return { alumniIds, opportunityIds };
      }
    } catch {
      // Fallback
    }
  }
  return local;
}

export async function toggleUserBookmark(
  uid: string,
  kind: 'alumni' | 'opportunity',
  targetId: string,
): Promise<UserBookmarks> {
  const current = await getUserBookmarks(uid);
  const isAlumni = kind === 'alumni';
  const list = isAlumni ? current.alumniIds : current.opportunityIds;
  const exists = list.includes(targetId);

  const updatedList = exists ? list.filter((id) => id !== targetId) : [...list, targetId];
  const updatedBookmarks: UserBookmarks = {
    alumniIds: isAlumni ? updatedList : current.alumniIds,
    opportunityIds: isAlumni ? current.opportunityIds : updatedList,
  };

  saveStorage(`bookmarks_${uid}`, updatedBookmarks);

  if (isSupabaseConfigured) {
    try {
      const bookmarkId = sanitizeId(`${kind}_${targetId}`);
      if (exists) {
        await supabase.from('user_bookmarks').delete().eq('id', bookmarkId);
      } else {
        await supabase.from('user_bookmarks').insert({
          id: bookmarkId,
          owner_uid: uid,
          target_id: clampString(targetId, 128),
          kind,
          created_at: isoNow(),
        });
      }
    } catch {
      // Local saved
    }
  }

  return updatedBookmarks;
}

// ---------------------------------------------------------------------------
// Opportunities
// ---------------------------------------------------------------------------
export async function listOpportunities(): Promise<Opportunity[]> {
  let list = loadStorage<Opportunity[]>('opportunities', SEED_OPPORTUNITIES);
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('opportunities').select('*').eq('is_published', true);
      if (data && data.length > 0) {
        list = data.map((d) => ({
          id: d.id,
          title: d.title,
          company: d.company,
          type: d.type as OpportunityType,
          domain: d.domain,
          location: d.location,
          stipendOrCtc: d.stipend_or_ctc,
          skills: d.skills ?? [],
          description: d.description,
          applyUrl: d.apply_url,
          postedById: d.posted_by_id,
          postedByAlumniId: d.posted_by_alumni_id,
          postedByName: d.posted_by_name,
          postedByRole: d.posted_by_role,
          postedAt: shortDate(d.created_at ?? isoNow()),
          isRemote: Boolean(d.is_remote),
        }));
      }
    } catch {
      // Local fallback
    }
  }
  return list;
}

export async function createOpportunityPost(
  user: AuthUser,
  alumniProfile: AlumniProfile | undefined,
  payload: {
    title: string;
    company: string;
    type: OpportunityType;
    domain: string;
    location: string;
    stipendOrCtc: string;
    skills: string[];
    description: string;
    applyUrl: string;
    isRemote: boolean;
  },
): Promise<void> {
  const oppId = `opp_${Date.now()}`;
  const newPost: Opportunity = {
    id: oppId,
    title: clampString(payload.title, 160),
    company: clampString(payload.company || alumniProfile?.company || 'Partner Team', 120),
    type: payload.type,
    domain: clampString(payload.domain, 100),
    location: clampString(payload.location || 'Bengaluru', 100),
    stipendOrCtc: clampString(payload.stipendOrCtc || 'Competitive', 80),
    skills: payload.skills.slice(0, 15).map((s) => clampString(s, 40)).filter(Boolean),
    description: clampString(payload.description, 2000),
    applyUrl: clampString(payload.applyUrl, 300),
    postedById: user.id,
    postedByAlumniId: alumniProfile?.id ?? user.id,
    postedByName: clampString(user.name, 120),
    postedByRole: clampString(
      alumniProfile ? `${alumniProfile.role}, ${alumniProfile.company}` : user.subtitle,
      120,
    ),
    isRemote: payload.isRemote,
    postedAt: shortDate(isoNow()),
  };

  const local = loadStorage<Opportunity[]>('opportunities', SEED_OPPORTUNITIES);
  saveStorage('opportunities', [newPost, ...local]);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('opportunities').insert({
        id: oppId,
        title: newPost.title,
        company: newPost.company,
        type: newPost.type,
        domain: newPost.domain,
        location: newPost.location,
        stipend_or_ctc: newPost.stipendOrCtc,
        skills: newPost.skills,
        description: newPost.description,
        apply_url: newPost.applyUrl,
        posted_by_id: user.id,
        posted_by_alumni_id: newPost.postedByAlumniId,
        posted_by_name: newPost.postedByName,
        posted_by_role: newPost.postedByRole,
        is_remote: newPost.isRemote,
        is_published: true,
        created_at: isoNow(),
        updated_at: isoNow(),
      });
    } catch {
      // Local saved
    }
  }
}

// ---------------------------------------------------------------------------
// Knowledge Guides
// ---------------------------------------------------------------------------
export async function listKnowledgeGuides(uid: string): Promise<KnowledgeGuide[]> {
  let list = loadStorage<KnowledgeGuide[]>('guides', SEED_GUIDES);
  const upvotedIds = loadStorage<string[]>(`upvoted_guides_${uid}`, []);

  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('guides').select('*').eq('is_published', true);
      if (data && data.length > 0) {
        list = data.map((d) => ({
          id: d.id,
          title: d.title,
          domain: d.domain,
          summary: d.summary,
          content: d.content,
          readTimeMinutes: d.read_time_minutes ?? 5,
          authorId: d.author_id,
          authorAlumniId: d.author_alumni_id,
          authorName: d.author_name,
          authorRole: d.author_role,
          authorCompany: d.author_company,
          authorBatch: d.author_batch,
          upvotes: d.upvotes ?? 0,
          upvotedByStudent: upvotedIds.includes(d.id),
          publishedAt: shortDate(d.created_at ?? isoNow()),
        }));
      }
    } catch {
      // Local fallback
    }
  }

  return list.map((g) => ({
    ...g,
    upvotedByStudent: upvotedIds.includes(g.id),
  })).sort((a, b) => b.upvotes - a.upvotes);
}

export async function createKnowledgeGuide(
  user: AuthUser,
  alumniProfile: AlumniProfile | undefined,
  payload: {
    title: string;
    domain: string;
    summary: string;
    content: string;
    readTimeMinutes: number;
  },
): Promise<void> {
  const guideId = `guide_${Date.now()}`;
  const newGuide: KnowledgeGuide = {
    id: guideId,
    title: clampString(payload.title, 200),
    domain: clampString(payload.domain, 100),
    summary: clampString(payload.summary, 400),
    content: clampString(payload.content, 8000),
    readTimeMinutes: Math.min(60, Math.max(1, Math.round(payload.readTimeMinutes))),
    authorId: user.id,
    authorAlumniId: alumniProfile?.id ?? user.id,
    authorName: clampString(user.name, 120),
    authorRole: clampString(alumniProfile?.role ?? 'Alumnus', 120),
    authorCompany: clampString(alumniProfile?.company ?? 'Industry Partner', 120),
    authorBatch: clampString(
      alumniProfile ? `${alumniProfile.graduationYear} ${alumniProfile.branch}` : 'KLS VDIT',
      40,
    ),
    upvotes: 0,
    upvotedByStudent: false,
    publishedAt: shortDate(isoNow()),
  };

  const local = loadStorage<KnowledgeGuide[]>('guides', SEED_GUIDES);
  saveStorage('guides', [newGuide, ...local]);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('guides').insert({
        id: guideId,
        title: newGuide.title,
        domain: newGuide.domain,
        summary: newGuide.summary,
        content: newGuide.content,
        read_time_minutes: newGuide.readTimeMinutes,
        author_id: user.id,
        author_alumni_id: newGuide.authorAlumniId,
        author_name: newGuide.authorName,
        author_role: newGuide.authorRole,
        author_company: newGuide.authorCompany,
        author_batch: newGuide.authorBatch,
        upvotes: 0,
        is_published: true,
        created_at: isoNow(),
        updated_at: isoNow(),
      });
    } catch {
      // Local saved
    }
  }
}

export async function toggleKnowledgeGuideUpvote(
  guide: KnowledgeGuide,
  uid: string,
): Promise<void> {
  const upvotedIds = loadStorage<string[]>(`upvoted_guides_${uid}`, []);
  const hasUpvoted = upvotedIds.includes(guide.id);
  const nextUpvoted = hasUpvoted ? upvotedIds.filter((id) => id !== guide.id) : [...upvotedIds, guide.id];
  saveStorage(`upvoted_guides_${uid}`, nextUpvoted);

  const local = loadStorage<KnowledgeGuide[]>('guides', SEED_GUIDES);
  const found = local.find((g) => g.id === guide.id);
  if (found) {
    found.upvotes = Math.max(0, found.upvotes + (hasUpvoted ? -1 : 1));
    saveStorage('guides', local);
  }

  if (isSupabaseConfigured) {
    try {
      if (hasUpvoted) {
        await supabase.from('guide_upvotes').delete().eq('guide_id', guide.id).eq('uid', uid);
        await supabase.from('guides').update({ upvotes: Math.max(0, guide.upvotes - 1) }).eq('id', guide.id);
      } else {
        await supabase.from('guide_upvotes').insert({ guide_id: guide.id, uid, created_at: isoNow() });
        await supabase.from('guides').update({ upvotes: guide.upvotes + 1 }).eq('id', guide.id);
      }
    } catch {
      // Local saved
    }
  }
}

// ---------------------------------------------------------------------------
// Senior Intake Forms
// ---------------------------------------------------------------------------
const SEED_FORMS: SeniorIntakeForm[] = [
  {
    formId: 'form_klsvdit_intake_2024',
    title: 'PARTHA — KLS VDIT Senior Alumni Intake 2024',
    responderUri: 'https://docs.google.com/forms/d/e/1FAIpQLSc-example/viewform',
    editUri: 'https://docs.google.com/forms/d/1FAIpQLSc-example/edit',
    createdByUid: 'uid_admin',
    createdByEmail: 'rajendramadival7@gmail.com',
    createdAt: '2024-03-01T10:00:00Z',
  },
];

export async function listSeniorIntakeForms(
  currentUser: AuthUser,
): Promise<SeniorIntakeForm[]> {
  const local = loadStorage<SeniorIntakeForm[]>('senior_forms', SEED_FORMS);
  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase.from('senior_forms').select('*');
      if (data && data.length > 0) {
        return data.map((d) => ({
          formId: d.form_id,
          title: d.title,
          responderUri: d.responder_uri,
          editUri: d.edit_uri,
          createdByUid: d.created_by_uid,
          createdByEmail: d.created_by_email,
          createdAt: d.created_at ?? isoNow(),
        }));
      }
    } catch {
      // Local fallback
    }
  }
  return local;
}

export async function saveSeniorIntakeForm(form: SeniorIntakeForm): Promise<void> {
  const local = loadStorage<SeniorIntakeForm[]>('senior_forms', SEED_FORMS);
  saveStorage('senior_forms', [form, ...local.filter((f) => f.formId !== form.formId)]);

  if (isSupabaseConfigured) {
    try {
      await supabase.from('senior_forms').upsert({
        form_id: form.formId,
        title: form.title,
        responder_uri: form.responderUri,
        edit_uri: form.editUri,
        created_by_uid: form.createdByUid,
        created_by_email: form.createdByEmail,
        created_at: isoNow(),
      });
    } catch {
      // Local saved
    }
  }
}

export async function listImportedResponseIds(
  formId: string,
  uid: string,
): Promise<Set<string>> {
  const local = loadStorage<string[]>(`imported_responses_${formId}`, []);
  const set = new Set<string>(local);

  if (isSupabaseConfigured) {
    try {
      const { data } = await supabase
        .from('senior_form_imported')
        .select('response_id')
        .eq('form_id', formId)
        .eq('created_by_uid', uid);
      if (data) {
        data.forEach((r) => set.add(r.response_id));
      }
    } catch {
      // Local set
    }
  }

  return set;
}

export async function importSeniorFormResponse(
  formId: string,
  response: FormResponsePreview,
  creatorUid: string,
  autoVerify: boolean,
): Promise<void> {
  const cleanRespId = sanitizeId(response.responseId);
  const alumniId = sanitizeId(`gform_${cleanRespId}`);

  const newAlumnus: AlumniProfile = {
    id: alumniId,
    ownerUid: creatorUid,
    name: clampString(response.name, 120),
    graduationYear: Math.min(2035, Math.max(1995, response.graduationYear)),
    branch: response.branch,
    role: clampString(response.role, 120),
    company: clampString(response.company, 120),
    domain: clampString(response.domain, 100),
    skills: response.skills,
    location: clampString(response.location || 'Bengaluru', 100),
    openToInternshipReferrals: response.openToInternshipReferrals,
    openToProjectMentoring: response.openToProjectMentoring,
    sharedProjectGuidesCount: 0,
    bio: clampString(response.bio, 1000),
    regNumber: clampString(response.regNumber.toUpperCase(), 40),
    verificationStatus: autoVerify ? 'verified' : 'pending',
    source: 'google-form',
    submittedAt: shortDate(isoNow()),
    contact: {
      email: response.email,
      phone: response.phone,
      linkedinUrl: response.linkedinUrl,
    },
    isContactGated: true,
  };

  const localAlumni = loadStorage<AlumniProfile[]>('alumni', SEED_ALUMNI);
  saveStorage('alumni', [newAlumnus, ...localAlumni.filter((a) => a.id !== alumniId)]);

  const importedList = loadStorage<string[]>(`imported_responses_${formId}`, []);
  if (!importedList.includes(cleanRespId)) {
    importedList.push(cleanRespId);
    saveStorage(`imported_responses_${formId}`, importedList);
  }

  if (isSupabaseConfigured) {
    try {
      await supabase.from('alumni').upsert({
        id: alumniId,
        uid: creatorUid,
        name: newAlumnus.name,
        graduation_year: newAlumnus.graduationYear,
        branch: newAlumnus.branch,
        role: newAlumnus.role,
        company: newAlumnus.company,
        domain: newAlumnus.domain,
        skills: newAlumnus.skills,
        location: newAlumnus.location,
        open_to_internship_referrals: newAlumnus.openToInternshipReferrals,
        open_to_project_mentoring: newAlumnus.openToProjectMentoring,
        bio: newAlumnus.bio,
        reg_number: newAlumnus.regNumber,
        verification_status: newAlumnus.verificationStatus,
        source: 'google-form',
        submitted_at: isoNow(),
        updated_at: isoNow(),
      });
      await supabase.from('alumni_private_contacts').upsert({
        alumni_id: alumniId,
        owner_uid: creatorUid,
        email: response.email,
        phone: response.phone,
        linkedin_url: response.linkedinUrl,
        updated_at: isoNow(),
      });
      await supabase.from('senior_form_imported').upsert({
        id: `${formId}_${cleanRespId}`,
        form_id: formId,
        response_id: cleanRespId,
        alumni_id: alumniId,
        created_by_uid: creatorUid,
        imported_at: isoNow(),
      });
    } catch {
      // Local saved
    }
  }
}

// ---------------------------------------------------------------------------
// Admin Analytics Metrics
// ---------------------------------------------------------------------------
export function computeAdminMetrics(
  alumni: AlumniProfile[],
  mentorships: MentorshipRequest[],
  opportunities: Opportunity[],
  guides: KnowledgeGuide[],
): AdminMetrics {
  const verifiedAlumni = alumni.filter((a) => a.verificationStatus === 'verified');
  const pendingVerifications = alumni.filter((a) => a.verificationStatus === 'pending').length;

  const domainMap = new Map<string, DomainMetric>();
  for (const a of verifiedAlumni) {
    const entry = domainMap.get(a.domain) ?? { domain: a.domain, alumniCount: 0, guideCount: 0 };
    entry.alumniCount += 1;
    domainMap.set(a.domain, entry);
  }
  for (const g of guides) {
    const entry = domainMap.get(g.domain) ?? { domain: g.domain, alumniCount: 0, guideCount: 0 };
    entry.guideCount += 1;
    domainMap.set(g.domain, entry);
  }

  return {
    totalVerifiedAlumni: verifiedAlumni.length,
    pendingVerifications,
    activeMentorshipConnections: mentorships.filter((m) => m.status === 'accepted').length,
    pendingMentorshipRequests: mentorships.filter((m) => m.status === 'pending').length,
    opportunitiesShared: opportunities.length,
    knowledgeGuidesCount: guides.length,
    totalGuideUpvotes: guides.reduce((sum, g) => sum + g.upvotes, 0),
    topDomains: Array.from(domainMap.values()).sort((a, b) => b.alumniCount - a.alumniCount),
  };
}
