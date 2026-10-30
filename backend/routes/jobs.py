"""Job APIs: list/search, details, create, update, delete."""
from flask import Blueprint, jsonify, request, session

from database import execute, fetch_all, fetch_one
from routes.utils import clean, error, login_required

jobs_bp = Blueprint("jobs", __name__, url_prefix="/api/jobs")

EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Remote"]
EXPERIENCE_LEVELS = ["Fresher", "0-1 years", "1-3 years", "3+ years"]


def search_jobs():
    """Build a filtered job query from the URL parameters."""
    sql, params = "SELECT * FROM jobs WHERE 1=1", []
    q, company = clean(request.args.get("q")), clean(request.args.get("company"))
    location = clean(request.args.get("location"))
    emp, exp = clean(request.args.get("employment_type")), clean(request.args.get("experience_level"))
    if q:
        sql += " AND title LIKE %s"; params.append(f"%{q}%")
    if company:
        sql += " AND company_name LIKE %s"; params.append(f"%{company}%")
    if location:
        sql += " AND location LIKE %s"; params.append(f"%{location}%")
    if emp:
        sql += " AND employment_type = %s"; params.append(emp)
    if exp:
        sql += " AND experience_level = %s"; params.append(exp)
    sql += " ORDER BY created_at DESC, id DESC"
    limit = request.args.get("limit", "")
    if limit.isdigit():
        sql += " LIMIT %s"; params.append(min(int(limit), 100))
    return jsonify({"jobs": fetch_all(sql, tuple(params))})


def read_job_form():
    """Validate the job form. Returns (values, error_message)."""
    data = request.get_json(silent=True) or {}
    fields = ["title", "company_name", "description", "location", "salary",
              "employment_type", "experience_level", "required_skills", "eligibility"]
    v = {f: clean(data.get(f)) for f in fields}
    for f in ["title", "company_name", "description", "location", "required_skills"]:
        if not v[f]:
            return None, f"{f.replace('_', ' ').capitalize()} is required."
    if len(v["title"]) > 150:
        return None, "Job title is too long."
    if v["employment_type"] not in EMPLOYMENT_TYPES:
        return None, "Please choose a valid employment type."
    if v["experience_level"] not in EXPERIENCE_LEVELS:
        return None, "Please choose a valid experience level."
    return v, None


@jobs_bp.get("")
def list_jobs():
    return search_jobs()


@jobs_bp.get("/search")
def search():
    return search_jobs()


@jobs_bp.get("/stats")
def stats():
    row = fetch_one(
        "SELECT (SELECT COUNT(*) FROM jobs) AS jobs,"
        " (SELECT COUNT(DISTINCT company_name) FROM jobs) AS companies,"
        " (SELECT COUNT(*) FROM users WHERE role='student') AS students,"
        " (SELECT COUNT(*) FROM applications) AS applications"
    )
    return jsonify(row)


@jobs_bp.get("/mine")
@login_required("recruiter")
def my_jobs():
    jobs = fetch_all(
        "SELECT j.*, (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count"
        " FROM jobs j WHERE j.recruiter_id = %s ORDER BY j.created_at DESC, j.id DESC",
        (session["user_id"],),
    )
    return jsonify({"jobs": jobs})


@jobs_bp.get("/<int:job_id>")
def job_details(job_id):
    job = fetch_one(
        "SELECT j.*, rp.company_description FROM jobs j"
        " LEFT JOIN recruiter_profiles rp ON rp.user_id = j.recruiter_id WHERE j.id = %s",
        (job_id,),
    )
    if not job:
        return error("Job not found.", 404)
    job["has_applied"] = False
    if session.get("role") == "student":
        job["has_applied"] = bool(fetch_one(
            "SELECT id FROM applications WHERE job_id = %s AND student_id = %s", (job_id, session["user_id"])))
    return jsonify({"job": job})


@jobs_bp.post("")
@login_required("recruiter")
def create_job():
    v, problem = read_job_form()
    if problem:
        return error(problem)
    job_id, _ = execute(
        "INSERT INTO jobs (title, company_name, description, location, salary, employment_type,"
        " experience_level, required_skills, eligibility, recruiter_id) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",
        (v["title"], v["company_name"], v["description"], v["location"], v["salary"], v["employment_type"],
         v["experience_level"], v["required_skills"], v["eligibility"], session["user_id"]),
    )
    return jsonify({"message": "Job posted successfully.", "id": job_id}), 201


@jobs_bp.put("/<int:job_id>")
@login_required("recruiter")
def update_job(job_id):
    job = fetch_one("SELECT recruiter_id FROM jobs WHERE id = %s", (job_id,))
    if not job:
        return error("Job not found.", 404)
    if job["recruiter_id"] != session["user_id"]:
        return error("You can only edit your own jobs.", 403)
    v, problem = read_job_form()
    if problem:
        return error(problem)
    execute(
        "UPDATE jobs SET title=%s, company_name=%s, description=%s, location=%s, salary=%s,"
        " employment_type=%s, experience_level=%s, required_skills=%s, eligibility=%s WHERE id=%s",
        (v["title"], v["company_name"], v["description"], v["location"], v["salary"], v["employment_type"],
         v["experience_level"], v["required_skills"], v["eligibility"], job_id),
    )
    return jsonify({"message": "Job updated successfully."})


@jobs_bp.delete("/<int:job_id>")
@login_required("recruiter")
def delete_job(job_id):
    job = fetch_one("SELECT recruiter_id FROM jobs WHERE id = %s", (job_id,))
    if not job:
        return error("Job not found.", 404)
    if job["recruiter_id"] != session["user_id"]:
        return error("You can only delete your own jobs.", 403)
    execute("DELETE FROM jobs WHERE id = %s", (job_id,))
    return jsonify({"message": "Job deleted."})
