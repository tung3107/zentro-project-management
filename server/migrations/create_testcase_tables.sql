-- Test Suite Table
CREATE TABLE test_suites (
  suite_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_by VARCHAR(35) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id)
);

-- Test Case Table
CREATE TABLE test_cases (
  testcase_id INT AUTO_INCREMENT PRIMARY KEY,
  project_id VARCHAR(50) NOT NULL,
  suite_id INT NULL,
  testcase_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  pre_condition TEXT,
  steps JSON NOT NULL,
  expected_result TEXT,
  actual_result TEXT,
  status ENUM('draft', 'approved', 'deprecated', 'active') DEFAULT 'draft',
  created_by VARCHAR(35) NOT NULL,
  updated_by VARCHAR(35),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  version INT DEFAULT 1,
  FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE,
  FOREIGN KEY (suite_id) REFERENCES test_suites(suite_id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_project_id (project_id),
  INDEX idx_suite_id (suite_id),
  INDEX idx_status (status),
  INDEX idx_priority (priority)
);

-- Test Case Version History
CREATE TABLE test_case_versions (
  version_id INT AUTO_INCREMENT PRIMARY KEY,
  testcase_id INT NOT NULL,
  version_number INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  pre_condition TEXT,
  steps JSON NOT NULL,
  expected_result TEXT,
  actual_result TEXT,
  status ENUM('draft', 'approved', 'deprecated', 'active') DEFAULT 'draft',
  updated_by VARCHAR(35) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (testcase_id) REFERENCES test_cases(testcase_id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_testcase_id (testcase_id),
  UNIQUE KEY unique_testcase_version (testcase_id, version_number)
);

-- Test Case Attachments
CREATE TABLE test_case_attachments (
  attachment_id INT AUTO_INCREMENT PRIMARY KEY,
  testcase_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INT,
  uploaded_by VARCHAR(35) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (testcase_id) REFERENCES test_cases(testcase_id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_testcase_id (testcase_id)
);

-- Test Case - Task Relations
CREATE TABLE testcase_task_relations (
  relation_id INT AUTO_INCREMENT PRIMARY KEY,
  testcase_id INT,
  task_id VARCHAR(35),
  suite_id INT,
  relation_type ENUM('testcase', 'suite') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (testcase_id) REFERENCES test_cases(testcase_id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES task(task_id) ON DELETE CASCADE,
  FOREIGN KEY (suite_id) REFERENCES test_suites(suite_id) ON DELETE CASCADE,
  INDEX idx_task_id (task_id),
  INDEX idx_testcase_id (testcase_id),
  INDEX idx_suite_id (suite_id)
);
