import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

wb = openpyxl.Workbook()
wb.remove(wb.active)  # remove default sheet

# Colors
HEADER_FILL = PatternFill(start_color="064E3B", end_color="064E3B", fill_type="solid")
HEADER_FONT = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
ZEBRA_FILL = PatternFill(start_color="F0FDF4", end_color="F0FDF4", fill_type="solid")
WHITE_FILL = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")
REG_FONT = Font(name="Calibri", size=10)
BOLD_FONT = Font(name="Calibri", size=10, bold=True)
TITLE_FONT = Font(name="Calibri", size=14, bold=True, color="064E3B")

THIN_BORDER = Border(
    left=Side(style='thin', color='D1D5DB'),
    right=Side(style='thin', color='D1D5DB'),
    top=Side(style='thin', color='D1D5DB'),
    bottom=Side(style='thin', color='D1D5DB')
)

def style_sheet(ws, title, headers, rows):
    # Title Block
    ws.merge_cells("A1:G1")
    title_cell = ws["A1"]
    title_cell.value = f"PARTHA Platform — {title}"
    title_cell.font = TITLE_FONT
    ws.row_dimensions[1].height = 25
    ws.row_dimensions[2].height = 10

    # Header Row
    header_row_idx = 3
    ws.row_dimensions[header_row_idx].height = 24
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=header_row_idx, column=col_idx, value=h)
        cell.fill = HEADER_FILL
        cell.font = HEADER_FONT
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = THIN_BORDER

    # Data Rows
    for row_idx, r in enumerate(rows, header_row_idx + 1):
        fill = ZEBRA_FILL if row_idx % 2 == 0 else WHITE_FILL
        ws.row_dimensions[row_idx].height = 20
        for col_idx, val in enumerate(r, 1):
            cell = ws.cell(row=row_idx, column=col_idx, value=val)
            cell.font = REG_FONT
            cell.fill = fill
            cell.border = THIN_BORDER
            if isinstance(val, (int, float)):
                cell.alignment = Alignment(horizontal="right", vertical="center")
            elif isinstance(val, bool):
                cell.value = "Yes" if val else "No"
                cell.alignment = Alignment(horizontal="center", vertical="center")
            else:
                cell.alignment = Alignment(horizontal="left", vertical="center")

    # Auto-fit column widths
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            if cell.row < 3:
                continue
            val_str = str(cell.value or '')
            max_len = max(max_len, len(val_str))
        ws.column_dimensions[col_letter].width = min(max(max_len + 3, 12), 48)

# ---------------------------------------------------------------------------
# 1. Alumni Profiles
# ---------------------------------------------------------------------------
alumni_headers = [
    "Alumni ID", "Full Name", "USN / Reg No", "Batch", "Branch",
    "Current Company", "Designation / Role", "Domain", "Top Skills",
    "Location", "Referrals?", "Mentoring?", "Guides Shared",
    "Bio / Advice", "Verification Status", "Source",
    "Contact Email (Gated)", "Phone / WhatsApp", "LinkedIn URL"
]
alumni_rows = [
    [
        "alu_rohan_joshi", "Rohan Joshi", "2VD16CS045", 2020, "CSE",
        "Google", "Senior Machine Learning Engineer", "Machine Learning & AI",
        "Python, PyTorch, TensorFlow, MLOps, LLMs, Distributed Systems",
        "Bengaluru", True, True, 2,
        "Working on LLM infrastructure at Google. Happy to help KLS VDIT juniors with system design, ML interviews, and resume reviews.",
        "verified", "self-registered",
        "rohan.joshi.alumni@gmail.com", "+91 98860 12345", "https://linkedin.com/in/rohan-joshi-ai"
    ],
    [
        "alu_ananya_bhat", "Ananya Bhat", "2VD17IS012", 2021, "ISE",
        "Amazon Web Services (AWS)", "Senior Cloud Architect", "Cloud & Distributed Systems",
        "Go, AWS Lambda, Kubernetes, Terraform, Distributed Storage",
        "Bengaluru", True, True, 1,
        "Senior Cloud Architect at AWS. Always open for referrals and guidance on cloud certifications, Docker, and Kubernetes.",
        "verified", "self-registered",
        "ananya.bhat.cloud@aws-alumni.org", "+91 97410 54321", "https://linkedin.com/in/ananya-bhat-aws"
    ],
    [
        "alu_karthik_hegde", "Karthik Hegde", "2VD18EC028", 2022, "ECE",
        "Bosch Global Software", "Staff Embedded Systems & Robotics Engineer", "Embedded & Robotics",
        "Embedded C, ROS2, Robotics, FreeRTOS, Microcontrollers, CAN Bus",
        "Bengaluru", True, True, 1,
        "Passionate about autonomous systems and robotics. Open to mentoring students on capstone hardware/firmware projects.",
        "verified", "self-registered",
        "karthik.hegde.bosch@gmail.com", "+91 94480 67890", "https://linkedin.com/in/karthik-hegde-robotics"
    ],
    [
        "alu_divya_kulkarni", "Divya Kulkarni", "2VD17CS031", 2021, "CSE",
        "PhonePe", "Lead Full-Stack & FinTech Engineer", "Full-Stack & FinTech",
        "React, TypeScript, Node.js, Spring Boot, PostgreSQL, Kafka, Redis",
        "Bengaluru", True, True, 0,
        "Leading consumer payments modules at PhonePe. Reach out for resume reviews, web development tips, and interview prep.",
        "verified", "self-registered",
        "divya.kulkarni.fintech@gmail.com", "+91 99000 87654", "https://linkedin.com/in/divya-kulkarni-fintech"
    ],
    [
        "alu_meera_deshpande", "Meera Deshpande", "2VD18CS052", 2022, "CSE",
        "Snowflake", "Senior Data Platform Engineer", "Data Engineering",
        "Apache Spark, Snowflake, Kafka, Airflow, SQL, Python, Big Data",
        "Bengaluru", True, True, 0,
        "Building scalable data streaming pipelines. Happy to guide on ETL architectures and career transitions to Data Engineering.",
        "verified", "self-registered",
        "meera.deshpande.data@gmail.com", "+91 91120 45678", "https://linkedin.com/in/meera-deshpande-data"
    ],
    [
        "alu_vikram_patil", "Vikram Patil", "2VD19CS068", 2023, "CSE",
        "Cisco Systems", "Cybersecurity Analyst", "Cybersecurity & Infra",
        "Network Security, Wireshark, Linux, Python, Penetration Testing",
        "Bengaluru", True, True, 0,
        "Securing enterprise networks at Cisco. Open to reviewing capstone security projects.",
        "pending", "self-registered",
        "vikram.patil.cisco@gmail.com", "+91 93410 99887", "https://linkedin.com/in/vikram-patil-sec"
    ]
]
ws1 = wb.create_sheet(title="Alumni Directory")
style_sheet(ws1, "Alumni Mentors Directory (Verified & Pending)", alumni_headers, alumni_rows)

# ---------------------------------------------------------------------------
# 2. Student Profiles
# ---------------------------------------------------------------------------
student_headers = [
    "Student UID", "Full Name", "Email", "KLS VDIT USN", "Branch",
    "Semester", "Target Domain", "Target Skills", "Target Company",
    "Looking for Internship?", "Looking for Project Help?"
]
student_rows = [
    [
        "std_priya_sharma", "Priya Sharma", "priya.sharma@klsvdit.edu.in", "2VD22CS034", "CSE",
        6, "Machine Learning & AI", "Python, Machine Learning, PyTorch, React", "Google", True, True
    ],
    [
        "std_aditya_kamath", "Aditya Kamath", "aditya.kamath@klsvdit.edu.in", "2VD22IS019", "ISE",
        6, "Cloud & Distributed Systems", "AWS, Go, Docker, Kubernetes", "Amazon", True, False
    ],
    [
        "std_sneha_naik", "Sneha Naik", "sneha.naik@klsvdit.edu.in", "2VD23EC041", "ECE",
        4, "Embedded & Robotics", "Embedded C, Microcontrollers, Arduino, ROS2", "Bosch", True, True
    ],
    [
        "std_rahul_verma", "Rahul Verma", "rahul.verma@klsvdit.edu.in", "2VD21CS060", "CSE",
        8, "Full-Stack & FinTech", "React, TypeScript, Node.js, PostgreSQL", "PhonePe", True, False
    ]
]
ws2 = wb.create_sheet(title="Student Profiles")
style_sheet(ws2, "Student Target Profiles & Matching Preferences", student_headers, student_rows)

# ---------------------------------------------------------------------------
# 3. Knowledge Guides
# ---------------------------------------------------------------------------
guide_headers = [
    "Guide ID", "Title", "Technical Domain", "Read Time (Mins)",
    "Author Name", "Author Role", "Author Company", "Batch", "Upvotes", "Summary"
]
guide_rows = [
    [
        "guide_ml_interview", "Cracking Tier-1 Machine Learning & AI Interviews: A Practical Roadmap",
        "Machine Learning & AI", 8, "Rohan Joshi", "Senior ML Engineer", "Google", "2020 CSE", 42,
        "Detailed step-by-step preparation plan covering math fundamentals, deep learning, coding problem patterns, and MLOps interview rounds."
    ],
    [
        "guide_aws_cloud", "From Campus to Cloud Architect: Navigating AWS, System Design & Certifications",
        "Cloud & Distributed Systems", 6, "Ananya Bhat", "Senior Cloud Architect", "Amazon AWS", "2021 ISE", 35,
        "Guidance on building real cloud projects during 6th-8th semester, earning AWS Solutions Architect Associate, and system design basics."
    ],
    [
        "guide_robotics_capstone", "Building Industry-Ready Autonomous Robotics Capstone Projects",
        "Embedded & Robotics", 7, "Karthik Hegde", "Staff Embedded Systems Engineer", "Bosch", "2022 ECE", 28,
        "Hardware selection, ROS2 architecture, FreeRTOS integration, and how to document and present hardware capstones to recruiters."
    ]
]
ws3 = wb.create_sheet(title="Knowledge Guides")
style_sheet(ws3, "Alumni Knowledge Hub & Interview Prep Guides", guide_headers, guide_rows)

# ---------------------------------------------------------------------------
# 4. Opportunities
# ---------------------------------------------------------------------------
opp_headers = [
    "Opportunity ID", "Role Title", "Company", "Type", "Domain",
    "Location", "Is Remote?", "Stipend / CTC", "Required Skills",
    "Apply URL", "Posted By Name", "Posted By Role"
]
opp_rows = [
    [
        "opp_google_ai_intern", "Graduate AI Research Intern", "Google Labs",
        "Internship", "Machine Learning & AI", "Bengaluru", False,
        "₹85,000 / month", "Python, PyTorch, Transformers, Deep Learning",
        "https://careers.google.com/jobs/results/", "Rohan Joshi", "Senior ML Engineer, Google"
    ],
    [
        "opp_aws_cloud_intern", "Cloud Systems Engineering Intern", "Amazon Web Services",
        "Internship", "Cloud & Distributed Systems", "Bengaluru", True,
        "₹75,000 / month", "Linux, Go, AWS, Docker, Bash",
        "https://amazon.jobs/", "Ananya Bhat", "Senior Cloud Architect, Amazon AWS"
    ],
    [
        "opp_bosch_embedded_sde", "Junior Firmware Engineer", "Bosch Global Software",
        "Full-time Job", "Embedded & Robotics", "Bengaluru", False,
        "12 LPA", "Embedded C, Microcontrollers, FreeRTOS, Git",
        "https://www.bosch.in/careers/", "Karthik Hegde", "Staff Embedded Engineer, Bosch"
    ],
    [
        "opp_phonepe_fullstack", "Full-Stack SDE-1", "PhonePe",
        "Full-time Job", "Full-Stack & FinTech", "Bengaluru", False,
        "16 LPA", "React, TypeScript, Node.js, Spring Boot, SQL",
        "https://www.phonepe.com/careers/", "Divya Kulkarni", "Lead Full-Stack Engineer, PhonePe"
    ]
]
ws4 = wb.create_sheet(title="Opportunities")
style_sheet(ws4, "Career Opportunities (Internships & Full-Time Jobs)", opp_headers, opp_rows)

# ---------------------------------------------------------------------------
# 5. Mentorship Requests
# ---------------------------------------------------------------------------
mentor_headers = [
    "Request ID", "Student Name", "Student USN", "Student Branch",
    "Mentor Name", "Mentor Company", "Goal", "Message",
    "Status", "Meeting Slot", "Video Link"
]
mentor_rows = [
    [
        "req_priya_rohan", "Priya Sharma", "2VD22CS034", "CSE",
        "Rohan Joshi", "Google", "Career Guidance",
        "Hello Rohan Sir, I am preparing for ML internships and would love your guidance on structuring my PyTorch projects.",
        "accepted", "Saturday, 5:00 PM IST", "https://meet.jit.si/partha-klsvdit-req_priya_rohan"
    ],
    [
        "req_aditya_ananya", "Aditya Kamath", "2VD22IS019", "ISE",
        "Ananya Bhat", "Amazon AWS", "Resume Review",
        "Respected Ananya Ma'am, could you kindly review my resume for cloud associate roles at AWS?",
        "pending", "Pending mentor confirmation", "—"
    ]
]
ws5 = wb.create_sheet(title="Mentorship Connections")
style_sheet(ws5, "Mentorship Requests, 1-on-1 Calls & Chat Status", mentor_headers, mentor_rows)

# ---------------------------------------------------------------------------
# 6. Database Schema & Dictionary
# ---------------------------------------------------------------------------
dict_headers = [
    "Table Name", "Column Name", "PostgreSQL Type", "Nullable",
    "Default Value", "Description", "Security / RLS Rule"
]
dict_rows = [
    ["admins", "uid", "TEXT PRIMARY KEY", "NO", "None", "Matches auth.users.id", "Only admins can select own row"],
    ["admins", "email", "TEXT", "YES", "None", "Administrator email address", "Service role manages inserts"],
    ["users", "uid", "TEXT PRIMARY KEY", "NO", "None", "Supabase auth.users.id", "Users can SELECT/INSERT/UPDATE own row"],
    ["users", "role", "user_role (ENUM)", "NO", "'student'", "Role: student, alumni, or admin", "Checked during role switch"],
    ["users", "name", "TEXT", "NO", "''", "Full name of the user", "User editable"],
    ["users", "email", "TEXT", "NO", "''", "Email address", "Synchronized from Auth"],
    ["users", "usn", "TEXT", "NO", "''", "KLS VDIT University Seat Number", "Sanitized uppercase string"],
    ["users", "branch", "branch_code (ENUM)", "NO", "'CSE'", "Branch: CSE, ISE, ECE, ME, EEE", "Used for match ranking"],
    ["users", "semester", "INTEGER", "NO", "6", "Semester between 1 and 8", "Check constraint: semester BETWEEN 1 AND 8"],
    ["users", "target_skills", "TEXT[]", "NO", "'{}'", "Skills student wants to learn", "Array for matching engine"],
    ["alumni", "id", "TEXT PRIMARY KEY", "NO", "None", "Alumni ID or auth UID", "Public directory identifier"],
    ["alumni", "name", "TEXT", "NO", "''", "Alumni full name", "Publicly visible"],
    ["alumni", "graduation_year", "INTEGER", "NO", "2022", "Batch year", "1995-2035 range validated"],
    ["alumni", "verification_status", "verification_status (ENUM)", "NO", "'pending'", "Status: verified, pending, rejected", "RLS: only verified visible to students"],
    ["alumni_private_contacts", "alumni_id", "TEXT PRIMARY KEY", "NO", "None", "References alumni(id)", "Privacy-gated contact card"],
    ["alumni_private_contacts", "email", "TEXT", "NO", "''", "Private contact email", "Unlocked ONLY when mentorship accepted"],
    ["alumni_private_contacts", "phone", "TEXT", "NO", "''", "WhatsApp / phone number", "Unlocked ONLY when mentorship accepted"],
    ["alumni_private_contacts", "linkedin_url", "TEXT", "NO", "''", "LinkedIn profile link", "Unlocked ONLY when mentorship accepted"],
    ["mentorships", "id", "TEXT PRIMARY KEY", "NO", "None", "Mentorship ID: {studentUid}__{alumniId}", "1 request per student-alumni pair"],
    ["mentorships", "status", "mentorship_status (ENUM)", "NO", "'pending'", "Status: pending, accepted, declined", "Participants only can read/update"],
    ["opportunities", "id", "TEXT PRIMARY KEY", "NO", "None", "Opportunity post ID", "Publicly accessible when published"],
    ["guides", "id", "TEXT PRIMARY KEY", "NO", "None", "Knowledge guide ID", "Publicly accessible when published"],
    ["guide_upvotes", "guide_id + uid", "TEXT PRIMARY KEY", "NO", "None", "Tracks 1 upvote per user", "Atomic upvote/downvote tracking"],
    ["senior_forms", "form_id", "TEXT PRIMARY KEY", "NO", "None", "Google Form ID for senior intake", "Admin owner access only"]
]
ws6 = wb.create_sheet(title="Database Schema")
style_sheet(ws6, "PostgreSQL Data Dictionary & Supabase RLS Policies", dict_headers, dict_rows)

out_path = "d:/PARTHA---MINI-PROJECT-main/PARTHA_Database_Seed_Data.xlsx"
wb.save(out_path)
print(f"Excel file successfully generated at: {out_path}")
