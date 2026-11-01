"""JobConnect backend entry point. Run with:  python app.py"""
from datetime import timedelta

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from routes.admin import admin_bp
from routes.applications import applications_bp
from routes.auth import auth_bp
from routes.jobs import jobs_bp
from routes.recruiters import recruiters_bp
from routes.students import students_bp


def create_app():
    if not Config.SECRET_KEY:
        raise RuntimeError("SECRET_KEY is missing. Copy .env.example to .env and fill it in.")

    app = Flask(__name__)
    app.config.from_object(Config)
    app.permanent_session_lifetime = timedelta(hours=8)

    # Allow the React app to call this API and send the session cookie
    CORS(
    app,
    supports_credentials=True,
    origins=[
        "https://job-connect-fsd-project.vercel.app",
        "https://job-connect-fsd-project-jha2esm1x-kamalkumar17b-3631s-projects.vercel.app"
    ]
)
    for bp in (auth_bp, jobs_bp, applications_bp, students_bp, recruiters_bp, admin_bp):
        app.register_blueprint(bp)

    @app.errorhandler(404)
    def not_found(_):
        return jsonify({"error": "Route not found."}), 404

    @app.errorhandler(413)
    def too_large(_):
        return jsonify({"error": "File is too large. Maximum size is 2 MB."}), 413

    @app.errorhandler(500)
    def server_error(_):
        return jsonify({"error": "Something went wrong on the server."}), 500

    return app


app = create_app()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
