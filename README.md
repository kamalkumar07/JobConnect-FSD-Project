# JobConnect – Student Job Portal

A beginner-friendly full stack job portal where **students** find jobs, upload a resume, apply and track
their status, **recruiters** post jobs and manage applicants, and **admins** monitor the platform.

## Project objectives
- Practise a complete React + Flask + MySQL application with real database storage.
- Learn REST APIs, session-based login, role-based access and file uploads.
- Keep the code simple: no Redux, no Axios, no unnecessary libraries.

## Main features
| Role | Features |
|---|---|
| Student | Register/login, browse jobs, search by title/company, filter by location/type/experience, job details, upload PDF resume, apply (no duplicates), track status, edit profile |
| Recruiter | Register/login, add/edit/delete own jobs, view applicants, download resumes, update status (Applied → Under Review → Shortlisted → Rejected / Selected) |
| Admin | Dashboard counts, view all users and jobs, delete users or jobs |

## Technology stack
React 18 · React Router DOM 6 · Hooks · plain CSS · Fetch API · Python Flask · Flask-CORS · Flask sessions ·
Werkzeug password hashing · MySQL (`mysql-connector-python`)

## Architecture
```
React (localhost:3000)  --fetch + session cookie-->  Flask REST API (localhost:5000)  --SQL-->  MySQL (3306)
                                                              |
                                                       backend/uploads (PDF resumes)
```

## Folder structure
```
jobconnect/
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── components/   Navbar, Footer, JobCard, Sidebar, ProtectedRoute, Loader
│   │   ├── context/      AuthContext (who is logged in), ToastContext (notifications)
│   │   ├── pages/        Home, About, Login, Register, Jobs, JobDetails, StudentDashboard,
│   │   │                 MyApplications, Profile, RecruiterDashboard, AddJob, ManageJobs,
│   │   │                 ManageApplicants, AdminDashboard, NotFound
│   │   ├── services/     api.js (fetch wrapper), authService, jobService, applicationService
│   │   ├── styles/style.css
│   │   ├── App.js, index.js, utils.js
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── app.py            Flask app, CORS, blueprints
│   ├── config.py         Settings read from .env
│   ├── database.py       MySQL helper functions
│   ├── create_admin.py   Script to create an admin account
│   ├── routes/           auth, jobs, applications, students, recruiters, admin, utils
│   ├── uploads/          Uploaded resumes (git-ignored)
│   ├── requirements.txt
│   └── .env.example
├── database/jobconnect.sql
├── screenshots/
├── .gitignore  README.md  LICENSE
```

## Requirements
Python 3.9+, Node.js 18+, MySQL 8, Git.

## 1. Database setup
```bash
mysql -u root -p < database/jobconnect.sql
```
This creates `jobconnect_db`, all five tables and 8 sample jobs plus three demo accounts.

## 2. Backend setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate      macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # Windows: copy .env.example .env
```
Edit `backend/.env` and fill in `DB_USER`, `DB_PASSWORD` and a long random `SECRET_KEY`
(generate one with `python -c "import secrets; print(secrets.token_hex(32))"`).
```bash
python app.py               # API runs on http://localhost:5000
```

## 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
npm start                   # App opens on http://localhost:3000
```

## Environment variables
| File | Variable | Purpose |
|---|---|---|
| backend/.env | DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME | MySQL connection |
| backend/.env | SECRET_KEY | Signs session cookies (keep private) |
| backend/.env | FRONTEND_URL | Origin allowed by CORS (default http://localhost:3000) |
| frontend/.env | REACT_APP_API_URL | Backend API base URL (default http://localhost:5000/api) |

## Demo accounts (sample data, local testing only)
| Role | Email | Password |
|---|---|---|
| Admin | admin@jobconnect.com | Admin@123 |
| Recruiter | recruiter@jobconnect.com | Recruiter@123 |
| Student | student@jobconnect.com | Student@123 |

Change or delete these accounts before putting the app anywhere public. To create your own admin:
`python create_admin.py "Your Name" you@example.com StrongPass123`

## API documentation
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | /api/auth/register | public | Register student or recruiter |
| POST | /api/auth/login | public | Log in (sets session cookie) |
| POST | /api/auth/logout | any | Log out |
| GET | /api/auth/me | logged in | Current user |
| GET | /api/jobs | public | List jobs (`?limit=`) |
| GET | /api/jobs/search | public | Filters: `q`, `company`, `location`, `employment_type`, `experience_level` |
| GET | /api/jobs/stats | public | Platform counts for the home page |
| GET | /api/jobs/mine | recruiter | Own jobs with applicant counts |
| GET | /api/jobs/<id> | public | Job details |
| POST | /api/jobs | recruiter | Create job |
| PUT | /api/jobs/<id> | recruiter (owner) | Update job |
| DELETE | /api/jobs/<id> | recruiter (owner) | Delete job |
| POST | /api/applications/<job_id> | student | Apply (needs uploaded resume, no duplicates) |
| GET | /api/applications/student | student | Own applications |
| GET | /api/applications/recruiter | recruiter | Applicants for own jobs (`?job_id=`) |
| PUT | /api/applications/<id>/status | recruiter (owner) | Update status |
| GET | /api/applications/<id>/resume | student/recruiter (owner) | Download resume PDF |
| GET / PUT | /api/students/profile | student | View / update profile |
| POST | /api/students/resume | student | Upload PDF resume (max 2 MB) |
| GET | /api/recruiters/dashboard | recruiter | Dashboard numbers |
| GET | /api/admin/dashboard, /users, /jobs | admin | Platform data |
| DELETE | /api/admin/users/<id>, /jobs/<id> | admin | Remove user / job |

Errors always return JSON like `{"error": "message"}` with a suitable HTTP status.

## Security notes
Passwords are hashed with Werkzeug; sessions use HttpOnly, SameSite=Lax cookies; every protected route checks
the role and ownership; inputs are validated on both frontend and backend; resumes must be real PDFs (checked
by content, not just file name), are limited to 2 MB, are stored under random names outside the public folders and
can only be downloaded by the student or the recruiter of that job; secrets live in `.env` files that Git ignores.
For production, serve over HTTPS and set `SESSION_COOKIE_SECURE=true`.

## Testing
Use the browser or Postman (Postman keeps the session cookie automatically).
- **Student:** register → login → browse → search/filter → job details → upload PDF in Profile → apply → apply again (should be rejected) → My Applications.
- **Recruiter:** register → login → add job → edit → view applicants → download resume → change status → delete job.
- **Admin:** login → dashboard → users and jobs tabs.
- **Security checks:** a student calling `POST /api/jobs` gets 403; another recruiter editing your job gets 403; uploading a `.txt` renamed to `.pdf` is rejected.

## Screenshots
Add images to the `screenshots/` folder and link them here, for example `![Home](screenshots/home.png)`.

## Future enhancements
Email notifications, pagination, saved jobs, company logos, password reset, interview scheduling, deployment with Docker.

## Upload to GitHub
```bash
git init
git add .
git commit -m "Initial commit: JobConnect full stack application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jobconnect-student-portal.git
git push -u origin main
```
Create the empty `jobconnect-student-portal` repository on GitHub first. Run `git status` before committing to confirm no `.env` file or resume PDF is listed.
