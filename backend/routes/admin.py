"""Admin APIs: dashboard counts, users, jobs and basic deletion."""
from flask import Blueprint, jsonify, session

from database import execute, fetch_all, fetch_one
from routes.utils import error, login_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/dashboard")
@login_required("admin")
def dashboard():
    stats = fetch_one(
        "SELECT (SELECT COUNT(*) FROM users WHERE role='student') AS total_students,"
        " (SELECT COUNT(*) FROM users WHERE role='recruiter') AS total_recruiters,"
        " (SELECT COUNT(*) FROM jobs) AS total_jobs,"
        " (SELECT COUNT(*) FROM applications) AS total_applications")
    return jsonify({"stats": stats})


@admin_bp.get("/users")
@login_required("admin")
def users():
    rows = fetch_all(
        "SELECT u.id, u.name, u.email, u.role, u.phone, u.created_at,"
        " COALESCE(sp.college, rp.company_name) AS organization"
        " FROM users u LEFT JOIN student_profiles sp ON sp.user_id = u.id"
        " LEFT JOIN recruiter_profiles rp ON rp.user_id = u.id ORDER BY u.created_at DESC")
    return jsonify({"users": rows})


@admin_bp.get("/jobs")
@login_required("admin")
def jobs():
    rows = fetch_all(
        "SELECT j.id, j.title, j.company_name, j.location, j.employment_type, j.created_at,"
        " (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id) AS applicant_count"
        " FROM jobs j ORDER BY j.created_at DESC")
    return jsonify({"jobs": rows})


@admin_bp.delete("/users/<int:user_id>")
@login_required("admin")
def delete_user(user_id):
    user = fetch_one("SELECT role FROM users WHERE id = %s", (user_id,))
    if not user:
        return error("User not found.", 404)
    if user["role"] == "admin" or user_id == session["user_id"]:
        return error("Admin accounts cannot be deleted here.", 403)
    execute("DELETE FROM users WHERE id = %s", (user_id,))
    return jsonify({"message": "User deleted."})


@admin_bp.delete("/jobs/<int:job_id>")
@login_required("admin")
def delete_job(job_id):
    _, count = execute("DELETE FROM jobs WHERE id = %s", (job_id,))
    if not count:
        return error("Job not found.", 404)
    return jsonify({"message": "Job deleted."})
