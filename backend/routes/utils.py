"""Shared helpers: JSON errors, role checking and input validation."""
import re
from functools import wraps

from flask import jsonify, session

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^\+?[0-9]{10,15}$")


def error(message, status=400):
    return jsonify({"error": message}), status


def login_required(*roles):
    """Block the request unless a user is logged in (and has one of the given roles)."""

    def decorator(view):
        @wraps(view)
        def wrapper(*args, **kwargs):
            if "user_id" not in session:
                return error("Please log in to continue.", 401)
            if roles and session.get("role") not in roles:
                return error("You do not have permission to do this.", 403)
            return view(*args, **kwargs)

        return wrapper

    return decorator


def clean(value):
    """Trim a string value (None becomes an empty string)."""
    return str(value).strip() if value is not None else ""


def validate_password(password):
    if len(password) < 8:
        return "Password must be at least 8 characters."
    if not re.search(r"[A-Za-z]", password) or not re.search(r"[0-9]", password):
        return "Password must contain at least one letter and one number."
    return None
