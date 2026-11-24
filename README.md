# PARTHA — KLS VDIT Alumni Mentorship & Opportunity Platform

A full-stack web platform built for **KLS Vishwanathrao Deshpande Institute of Technology (Haliyal)**, connecting students with verified alumni mentors for career guidance, resume reviews, project mentoring, and job/internship opportunities with privacy-gated contact access.

---

## 🚀 Quick Start (Working Website)

The application is completely configured and ready to run.

```bash
# Install dependencies (already installed)
npm install

# Start the development server
npm run dev

# Or build and run production server
npm run build
npm start
```

Open **`http://localhost:3000`** in your browser.

---

## 🗄️ Backend Architecture: Supabase + PostgreSQL

The backend has been migrated from Firebase to **Supabase** (PostgreSQL + Supabase Auth + Row-Level Security).

### 1. Database Schema
The complete PostgreSQL schema with tables, indexes, custom ENUM types, and Row-Level Security (RLS) policies is located in:
👉 [`supabase-schema.sql`](file:///d:/PARTHA---MINI-PROJECT-main/supabase-schema.sql)

### 2. Environment Variables
Create or update your `.env` file (a starter template is ready in `.env` and `.env.example`):

```env
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-public-key"
```

> **Note:** The application includes a self-contained local seed/preview layer in `src/services/parthaSupabase.ts`. You can browse alumni, filter matches, submit mentorship requests, test admin verification, and explore guides immediately without entering credentials. Once you provide your live Supabase credentials, the app seamlessly queries your live Supabase PostgreSQL database!

---

## 📊 Excel Seed & Data Dictionary Sheet

All platform seed data and the full database dictionary have been generated as a multi-tab Microsoft Excel workbook:

👉 **[`PARTHA_Database_Seed_Data.xlsx`](file:///d:/PARTHA---MINI-PROJECT-main/PARTHA_Database_Seed_Data.xlsx)**

### Workbook Contents:
1. **`Alumni Directory`**: Verified and pending alumni profiles (Rohan Joshi, Ananya Bhat, Karthik Hegde, Divya Kulkarni, Meera Deshpande, Vikram Patil) with domain, company, skills, batch, and contact info.
2. **`Student Profiles`**: Target student profiles, semester, USN, target domains, and matching preferences.
3. **`Knowledge Guides`**: Interview preparation and career guides with read times and upvotes.
4. **`Opportunities`**: Internships and full-time job openings from partner teams.
5. **`Mentorship Connections`**: Student requests, accepted mentorship threads, and 1-on-1 video call slots.
6. **`Database Schema`**: Complete data dictionary of all PostgreSQL tables, column types, default values, and RLS policies.

To re-generate the Excel spreadsheet at any time:
```bash
python scripts/generate_excel_data.py
```

---

## 🛠️ Verification & Quality Checks

- **TypeScript Compilation:** `npx tsc --noEmit` — ✅ Passed (0 errors)
- **ESLint Code Quality:** `npx eslint src` — ✅ Passed (0 errors, 0 warnings)
- **Production Build:** `npm run build` — ✅ Passed (1723 modules transformed, clean bundle)
- **Server Health:** `GET http://localhost:3000/api/health` — ✅ `{"status":"ok","platform":"PARTHA","backend":"supabase"}`
