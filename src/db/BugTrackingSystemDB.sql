-- users table
CREATE TABLE Users (
    userid INT IDENTITY(1,1) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role_user VARCHAR(20) NOT NULL CHECK (role_user IN ('admin', 'developer', 'tester')),
    password_hash VARCHAR(255) NOT NULL,
    is_active BIT DEFAULT 1,                -- helps with soft deletes or suspensions
    created_at DATETIME DEFAULT GETDATE(),  -- auto-timestamp when inserted
    updated_at DATETIME DEFAULT GETDATE()   -- useful when profile changes
);



ALTER TABLE Users

ADD CONSTRAINT role_user DEFAULT 'developer' FOR role_user;

-- Sample data for Users table
INSERT INTO Users (first_name, last_name, email, role_user, password_hash, created_at)
VALUES
('Agnes', 'Kitua', 'agnes@gmail.com', 'admin', 'hashed_pw_123', GETDATE()),
('David', 'Karanja', 'dave@gmail.com', 'developer', 'hashed_pw_456', GETDATE()),
('Kelly', 'Kamau', 'kelly@gmail.com', 'tester', 'hashed_pw_789', GETDATE());

-- view user records 
SELECT *FROM Users


-- projects table
CREATE TABLE Projects (
    projectid INT IDENTITY(1,1) PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active' 
        CHECK (status IN ('active', 'on-hold', 'completed', 'archived')),
    created_by INT NOT NULL, -- project lead (creator)
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (created_by) REFERENCES Users(userid)
);

-- Sample data for Projects table
INSERT INTO Projects (title, description, created_by, created_at)
VALUES
('Bug Tracking System', 'A web application to manage software defects and issues.', 1, GETDATE()),
('E-Commerce API', 'Backend API for managing online store operations.', 1, GETDATE()),
('Learning Management Portal', 'Platform for managing courses and student progress.', 1, GETDATE());

-- view projects records 
 
-- DELETE FROM Projects WHERE projectid=19

-- user project table 
CREATE TABLE UserProject (
  id INT IDENTITY(1,1) PRIMARY KEY,
  projectid INT NOT NULL,
  userid INT NOT NULL,
  role_in_project VARCHAR(20)
      CHECK (role_in_project IN ('lead', 'developer', 'tester')),
  assigned_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (projectid) REFERENCES Projects(projectid),
  FOREIGN KEY (userid) REFERENCES Users(userid),
  CONSTRAINT UQ_ProjectMember UNIQUE (projectid, userid)
);

SELECT *FROM UserProject


-- bugs table
CREATE TABLE Bugs (
    bugid INT IDENTITY(1,1) PRIMARY KEY,
    projectid INT NOT NULL,
    reported_by INT NOT NULL,
    assigned_to INT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(20) CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (projectid) REFERENCES Projects(projectid),
    FOREIGN KEY (reported_by) REFERENCES Users(userid) ,
    FOREIGN KEY (assigned_to) REFERENCES Users(userid) 
);
-- Sample data for Bugs table
INSERT INTO Bugs (projectid, reported_by, assigned_to, title, description, severity, status, created_at, updated_at)
VALUES
(1, 3, 2, 'Login page not loading', 'The login page shows a blank screen after submitting credentials.', 'high', 'open', GETDATE(), GETDATE()),
(1, 3, 2, 'Dashboard crash on filter', 'Filtering data on the dashboard causes a 500 server error.', 'critical', 'in_progress', GETDATE(), GETDATE()),
(2, 3, 2, 'Incorrect total in cart', 'The shopping cart total does not update correctly after removing items.', 'medium', 'resolved', GETDATE(), GETDATE());

-- view Bugs records 
SELECT *FROM Bugs



-- comments table
CREATE TABLE Comments (
    commentid INT IDENTITY(1,1) PRIMARY KEY,
    bugid INT NOT NULL,
    userid INT NOT NULL,
    content TEXT NOT NULL,
    timestamp DATETIME,
    FOREIGN KEY (bugid) REFERENCES Bugs(bugid),
    FOREIGN KEY (userid) REFERENCES Users(userid)
);
-- Sample data for Comments table
INSERT INTO Comments (bugid, userid, content, timestamp)
VALUES
(1, 2, 'Investigating the login issue; may be due to session timeout.', GETDATE()),
(1, 3, 'Confirmed that it occurs only on Chrome browser.', GETDATE()),
(2, 2, 'Patch deployed to staging environment for testing.', GETDATE());

-- view records in comments table 
SELECT *FROM Comments 
SELECT *FROM Bugs

-- -- Drop tables if needed
-- DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Projects;
DROP TABLE IF EXISTS UserProject;

-- DROP TABLE IF EXISTS Comments;
-- DROP TABLE IF EXISTS Bugs;


-- Resee tables to start from 1
DBCC CHECKIDENT ('Users', RESEED, 1);
DBCC CHECKIDENT ('Projects', RESEED, 1);
DBCC CHECKIDENT ('Bugs', RESEED, 1);
DBCC CHECKIDENT ('Comments', RESEED, 1);


