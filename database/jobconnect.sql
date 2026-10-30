-- JobConnect database. Run:  mysql -u root -p < database/jobconnect.sql
CREATE DATABASE IF NOT EXISTS jobconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE jobconnect_db;

DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS recruiter_profiles;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'recruiter', 'admin') NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    college VARCHAR(150) NOT NULL,
    course VARCHAR(100) NOT NULL,
    graduation_year INT NOT NULL,
    skills TEXT,
    resume_path VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE recruiter_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    company_name VARCHAR(150) NOT NULL,
    company_description TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    company_name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(100) NOT NULL,
    salary VARCHAR(80),
    employment_type ENUM('Full-time', 'Part-time', 'Internship', 'Contract', 'Remote') NOT NULL,
    experience_level ENUM('Fresher', '0-1 years', '1-3 years', '3+ years') NOT NULL,
    required_skills TEXT NOT NULL,
    eligibility TEXT,
    recruiter_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    job_id INT NOT NULL,
    resume_path VARCHAR(255),
    status ENUM('Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected') NOT NULL DEFAULT 'Applied',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (student_id, job_id)   -- one application per student per job
);

-- ---------- Sample data (for local testing only) ----------
-- Demo logins:  admin@jobconnect.com / Admin@123
--               recruiter@jobconnect.com / Recruiter@123
--               student@jobconnect.com / Student@123
INSERT INTO users (name, email, password, role, phone) VALUES
('Admin', 'admin@jobconnect.com', 'pbkdf2:sha256:1000000$NeqdGzK3dtE8sGJm$282bfbeff5cd5c7ffd81ba866a6259421e796067fba49e250cdf561859fad989', 'admin', '9000000001'),
('Demo Recruiter', 'recruiter@jobconnect.com', 'pbkdf2:sha256:1000000$NhCTZtQWOvOAZ0G4$1ecbe3c35953610cd363715f2fe4e883c011d035f7f0503a5fe5e80a0353b829', 'recruiter', '9000000002'),
('Demo Student', 'student@jobconnect.com', 'pbkdf2:sha256:1000000$h1yLymUTU5F82bAi$3de0b6edcd5350f25e05ee0f375bf0acacbd42c2ae0a5d4966e164a1bbf7fb61', 'student', '9000000003');

INSERT INTO recruiter_profiles (user_id, company_name, company_description) VALUES
(2, 'TechNova Solutions', 'TechNova builds web and mobile products for startups and gives fresh graduates hands-on engineering experience.');

INSERT INTO student_profiles (user_id, college, course, graduation_year, skills) VALUES
(3, 'Chandigarh University', 'B.Tech Computer Science', 2028, 'Python, HTML, CSS, JavaScript');

INSERT INTO jobs (title, company_name, description, location, salary, employment_type, experience_level, required_skills, eligibility, recruiter_id) VALUES
('Junior Python Developer', 'TechNova Solutions', 'Build and maintain Flask APIs, write SQL queries and work with senior engineers on customer projects.', 'Bengaluru', '₹4 - 6 LPA', 'Full-time', 'Fresher', 'Python, Flask, MySQL, Git', 'B.Tech/BCA/MCA graduates, 60% and above', 2),
('Frontend Developer Intern', 'TechNova Solutions', 'Create responsive user interfaces with React and collaborate with designers on new features.', 'Remote', '₹15,000 / month', 'Internship', 'Fresher', 'HTML, CSS, JavaScript, React', 'Pursuing or completed a CS/IT degree', 2),
('Full Stack Developer', 'TechNova Solutions', 'Own features end to end across React frontends and Flask backends with MySQL databases.', 'Hyderabad', '₹6 - 9 LPA', 'Full-time', '1-3 years', 'React, Flask, MySQL, REST APIs', 'B.Tech in CS/IT', 2),
('Data Analyst Trainee', 'TechNova Solutions', 'Clean datasets, build dashboards and report insights to business teams.', 'Chandigarh', '₹3.5 - 5 LPA', 'Full-time', 'Fresher', 'SQL, Excel, Python, Statistics', 'Any graduate with analytics skills', 2),
('QA Test Engineer', 'TechNova Solutions', 'Write test cases, run manual and automated tests and report bugs clearly.', 'Pune', '₹3 - 4.5 LPA', 'Full-time', '0-1 years', 'Testing basics, SQL, Postman', 'B.Tech/BCA/MCA', 2),
('Cloud & DevOps Intern', 'TechNova Solutions', 'Support CI/CD pipelines, containers and cloud deployments.', 'Visakhapatnam', '₹12,000 / month', 'Internship', 'Fresher', 'Linux, Git, Docker, AWS basics', 'Pursuing B.Tech in CS/IT', 2),
('UI/UX Design Associate', 'TechNova Solutions', 'Design wireframes and prototypes, and run simple usability tests.', 'Remote', '₹3 - 5 LPA', 'Contract', '0-1 years', 'Figma, CSS, Design thinking', 'Design or CS background', 2),
('Technical Content Writer', 'TechNova Solutions', 'Write tutorials and documentation for developer tools.', 'Delhi', '₹2.5 - 4 LPA', 'Part-time', 'Fresher', 'Writing, Programming basics', 'Any graduate', 2);
