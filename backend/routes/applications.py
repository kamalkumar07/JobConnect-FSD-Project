"""Application APIs: apply, list, update status, download resume."""
import os

import mysql.connector
from flask import Blueprint, current_app, jsonify, request, send_from_directory, session

from database import execute, fetch_all, fetch_one
from routes.utils import clean, error, login_required

applications_bp = Blueprint("applications", __name__, url_prefix="/api/applications")

STATUSES = ["Applied", "Under Review", "Shortlisted", "Rejected", "Selected"]


@applications_bp.post("/<int:job_id>")
@login_required("student")
def apply(job_id):
    if not fetch_one("SELECT id FROM jobs WHERE id = %s", (job_id,)):
        return error("Job not found.", 404)
    profile = fetch_one("SELECT resume_path FROM student_profiles WHERE user_id = %s", (session["user_id"],))
    if not profile or not profile["resume_path"]:
        return error("Please upload your resume in your profile before applying.")
    try:
        execute("INSERT INTO applications (student_id, job_id, resume_path) VALUES (%s, %s, %s)",
                (session["user_id"], job_id, profile["resume_path"]))
    except mysql.connector.IntegrityError:
        return error("You have already applied for this job.", 409)
    return jsonify({"message": "Application submitted successfully."}), 201


@applications_bp.get("/student")
@login_required("student")
def student_applications():
    rows = fetch_all(
        "SELECT a.id, a.job_id, a.status, a.applied_at, j.title, j.company_name, j.location"
        " FROM applications a JOIN jobs j ON j.id = a.job_id"
        " WHERE a.student_id = %s ORDER BY a.applied_at DESC",
        (session["user_id"],),
    )
    return jsonify({"applications": rows})


@applications_bp.get("/recruiter")
@login_required("recruiter")
def recruiter_applications():
    sql = (
        "SELECT a.id, a.job_id, a.status, a.applied_at, j.title AS job_title,"
        " u.name, u.email, u.phone, sp.college, sp.course, sp.skills"
        " FROM applications a JOIN jobs j ON j.id = a.job_id"
        " JOIN users u ON u.id = a.student_id"
        " LEFT JOIN student_profiles sp ON sp.user_id = a.student_id"
        " WHERE j.recruiter_id = %s"
    )
    params = [session["user_id"]]
    job_id = request.args.get("job_id", "")
    if job_id.isdigit():
        sql += " AND a.job_id = %s"
        params.append(int(job_id))
    sql += " ORDER BY a.applied_at DESC"
    return jsonify({"applications": fetch_all(sql, tuple(params))})


@applications_bp.put("/<int:app_id>/status")
@login_required("recruiter")
def update_status(app_id):
    status = clean((request.get_json(silent=True) or {}).get("status"))
    if status not in STATUSES:
        return error("Invalid status.")
    row = fetch_one(
        "SELECT j.recruiter_id FROM applications a JOIN jobs j ON j.id = a.job_id WHERE a.id = %s", (app_id,))
    if not row:
        return error("Application not found.", 404)
    if row["recruiter_id"] != session["user_id"]:
        return error("You can only update applications for your own jobs.", 403)
    execute("UPDATE applications SET status = %s WHERE id = %s", (status, app_id))
    return jsonify({"message": "Status updated."})


@applications_bp.get("/<int:app_id>/resume")
@login_required("student", "recruiter")
def download_resume(app_id):
    row = fetch_one(
        "SELECT a.student_id, a.resume_path, j.recruiter_id FROM applications a"
        " JOIN jobs j ON j.id = a.job_id WHERE a.id = %s", (app_id,))
    if not row:
        return error("Application not found.", 404)
    allowed = session["user_id"] in (row["student_id"], row["recruiter_id"])
    if not allowed or not row["resume_path"]:
        return error("You cannot access this resume.", 403)
    folder = current_app.config["UPLOAD_FOLDER"]
    if not os.path.exists(os.path.join(folder, row["resume_path"])):
        return error("Resume file not found.", 404)
    return send_from_directory(folder, row["resume_path"], as_attachment=True,
                               download_name=f"resume_{row['student_id']}.pdf")
