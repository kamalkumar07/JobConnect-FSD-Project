"""Recruiter dashboard numbers."""
from flask import Blueprint, jsonify, session

from database import fetch_all, fetch_one
from routes.utils import login_required

recruiters_bp = Blueprint("recruiters", __name__, url_prefix="/api/recruiters")


@recruiters_bp.get("/dashboard")
@login_required("recruiter")
def dashboard():
    uid = session["user_id"]
    stats = fetch_one(
        "SELECT (SELECT COUNT(*) FROM jobs WHERE recruiter_id = %s) AS total_jobs,"
        " (SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id = a.job_id WHERE j.recruiter_id = %s) AS total_applications,"
        " (SELECT COUNT(*) FROM applications a JOIN jobs j ON j.id = a.job_id"
        "   WHERE j.recruiter_id = %s AND a.status = 'Shortlisted') AS shortlisted",
        (uid, uid, uid),
    )
    recent = fetch_all(
        "SELECT a.id, a.status, a.applied_at, j.title AS job_title, u.name FROM applications a"
        " JOIN jobs j ON j.id = a.job_id JOIN users u ON u.id = a.student_id"
        " WHERE j.recruiter_id = %s ORDER BY a.applied_at DESC LIMIT 5", (uid,))
    return jsonify({"stats": stats, "recent": recent})
