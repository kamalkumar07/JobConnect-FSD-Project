"""Student profile APIs and PDF resume upload."""
import os
import uuid

from flask import Blueprint, current_app, jsonify, request, session

from database import execute, fetch_one
from routes.utils import PHONE_RE, clean, error, login_required

students_bp = Blueprint("students", __name__, url_prefix="/api/students")


def load_profile(user_id):
    return fetch_one(
        "SELECT u.name, u.email, u.phone, sp.college, sp.course, sp.graduation_year, sp.skills, sp.resume_path"
        " FROM users u JOIN student_profiles sp ON sp.user_id = u.id WHERE u.id = %s", (user_id,))


@students_bp.get("/profile")
@login_required("student")
def get_profile():
    profile = load_profile(session["user_id"])
    if not profile:
        return error("Profile not found.", 404)
    profile["has_resume"] = bool(profile.pop("resume_path"))
    return jsonify({"profile": profile})


@students_bp.put("/profile")
@login_required("student")
def update_profile():
    d = request.get_json(silent=True) or {}
    name, phone = clean(d.get("name")), clean(d.get("phone"))
    college, course, skills = clean(d.get("college")), clean(d.get("course")), clean(d.get("skills"))
    year = clean(d.get("graduation_year"))
    if len(name) < 2:
        return error("Please enter your full name.")
    if not PHONE_RE.match(phone):
        return error("Phone number must contain 10 to 15 digits.")
    if not college or not course:
        return error("College and course are required.")
    if not year.isdigit() or not (2000 <= int(year) <= 2100):
        return error("Please enter a valid graduation year.")
    execute("UPDATE users SET name=%s, phone=%s WHERE id=%s", (name, phone, session["user_id"]))
    execute("UPDATE student_profiles SET college=%s, course=%s, graduation_year=%s, skills=%s WHERE user_id=%s",
            (college, course, int(year), skills, session["user_id"]))
    return jsonify({"message": "Profile updated successfully."})


@students_bp.post("/resume")
@login_required("student")
def upload_resume():
    file = request.files.get("resume")
    if not file or not file.filename:
        return error("Please choose a PDF file.")
    if not file.filename.lower().endswith(".pdf"):
        return error("Only PDF files are allowed.")
    if file.read(5) != b"%PDF-":  # check the real file content, not just the name
        return error("This file is not a valid PDF.")
    file.seek(0)

    folder = current_app.config["UPLOAD_FOLDER"]
    filename = f"resume_{session['user_id']}_{uuid.uuid4().hex[:10]}.pdf"
    file.save(os.path.join(folder, filename))

    old = fetch_one("SELECT resume_path FROM student_profiles WHERE user_id = %s", (session["user_id"],))
    execute("UPDATE student_profiles SET resume_path = %s WHERE user_id = %s", (filename, session["user_id"]))
    # Old applications keep their own copy; only delete the old file if nothing uses it
    if old and old["resume_path"] and not fetch_one(
            "SELECT id FROM applications WHERE resume_path = %s LIMIT 1", (old["resume_path"],)):
        try:
            os.remove(os.path.join(folder, old["resume_path"]))
        except OSError:
            pass
    return jsonify({"message": "Resume uploaded successfully."})
