-- Create test run history table to track execution history of test cases
CREATE TABLE IF NOT EXISTS test_run_history (
  history_id INT PRIMARY KEY AUTO_INCREMENT,
  test_run_testcase_id INT NOT NULL,
  status ENUM('untested', 'passed', 'failed', 'blocked', 'skipped') NOT NULL,
  executed_by VARCHAR(35) NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  note TEXT,
  duration_seconds INT,
  FOREIGN KEY (test_run_testcase_id) REFERENCES test_run_testcases(id) ON DELETE CASCADE,
  FOREIGN KEY (executed_by) REFERENCES users(user_id),
  INDEX idx_test_run_testcase (test_run_testcase_id),
  INDEX idx_executed_at (executed_at)
);
