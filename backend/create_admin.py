"""Create an admin account (admins cannot register through the website).
Usage:  python create_admin.py "Admin Name" admin@example.com StrongPass123
"""
import sys

from werkzeug.security import generate_password_hash

from database import execute, fetch_one

if len(sys.argv) != 4:
    sys.exit('Usage: python create_admin.py "Name" email password')
name, email, password = sys.argv[1], sys.argv[2].lower(), sys.argv[3]
if fetch_one("SELECT id FROM users WHERE email = %s", (email,)):
    sys.exit("A user with this email already exists.")
execute("INSERT INTO users (name, email, password, role, phone) VALUES (%s,%s,%s,'admin','0000000000')",
        (name, email, generate_password_hash(password)))
print("Admin created:", email)
