"""Authentication: register, login, logout and current user."""
import mysql.connector
from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from database import fetch_one, get_connection
from routes.utils import EMAIL_RE, PHONE_RE, clean, error, validate_password

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def public_user(user):
    return {"id": user["id"], "name": user["name"], "email": user["email"],
            "role": user["role"], "phone": user["phone"]}


@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    name, email = clean(data.get("name")), clean(data.get("email")).lower()
    password, phone, role = data.get("password") or "", clean(data.get("phone")), clean(data.get("role"))

    if len(name) < 2:
        return error("Please enter your full name.")
    if not EMAIL_RE.match(email):
        return error("Please enter a valid email address.")
    problem = validate_password(password)
    if problem:
        return error(problem)
    if not PHONE_RE.match(phone):
        return error("Phone number must contain 10 to 15 digits.")
    if role not in ("student", "recruiter"):
        return error("Please choose Student or Recruiter.")

    if role == "student":
        college, course = clean(data.get("college")), clean(data.get("course"))
        year = clean(data.get("graduation_year"))
        if not college or not course:
            return error("College name and course are required for students.")
        if not year.isdigit() or not (2000 <= int(year) <= 2100):
            return error("Please enter a valid graduation year.")
    else:
        company, description = clean(data.get("company_name")), clean(data.get("company_description"))
        if not company:
            return error("Company name is required for recruiters.")

    if fetch_one("SELECT id FROM users WHERE email = %s", (email,)):
        return error("An account with this email already exists.", 409)

    conn = get_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (name, email, password, role, phone) VALUES (%s, %s, %s, %s, %s)",
            (name, email, generate_password_hash(password), role, phone),
        )
        user_id = cur.lastrowid
        if role == "student":
            cur.execute(
                "INSERT INTO student_profiles (user_id, college, course, graduation_year) VALUES (%s, %s, %s, %s)",
                (user_id, college, course, int(year)),
            )
        else:
            cur.execute(
                "INSERT INTO recruiter_profiles (user_id, company_name, company_description) VALUES (%s, %s, %s)",
                (user_id, company, description),
            )
        conn.commit()
    except mysql.connector.IntegrityError:
        conn.rollback()
        return error("An account with this email already exists.", 409)
    finally:
        conn.close()

    return jsonify({"message": "Registration successful. Please log in."}), 201


@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    email, password = clean(data.get("email")).lower(), data.get("password") or ""
    if not email or not password:
        return error("Email and password are required.")

    user = fetch_one("SELECT * FROM users WHERE email = %s", (email,))
    if not user or not check_password_hash(user["password"], password):
        return error("Invalid email or password.", 401)

    session.clear()
    session.permanent = True
    session["user_id"], session["role"] = user["id"], user["role"]
    return jsonify({"message": "Login successful.", "user": public_user(user)})


@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"message": "Logged out."})


@auth_bp.get("/me")
def me():
    if "user_id" not in session:
        return error("Not logged in.", 401)
    user = fetch_one("SELECT * FROM users WHERE id = %s", (session["user_id"],))
    if not user:
        session.clear()
        return error("Not logged in.", 401)
    return jsonify({"user": public_user(user)})
