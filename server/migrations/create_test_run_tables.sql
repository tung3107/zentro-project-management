CREATE TABLE IF NOT EXISTS `test_runs` (
  `test_run_id` INT NOT NULL AUTO_INCREMENT,
  `project_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `status` ENUM('active', 'completed') DEFAULT 'active',
  `created_by` VARCHAR(35) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `completed_at` DATETIME,
  PRIMARY KEY (`test_run_id`),
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `test_run_testcases` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `test_run_id` INT NOT NULL,
  `testcase_id` INT NOT NULL,
  `status` ENUM('untested', 'passed', 'failed', 'blocked', 'skipped') DEFAULT 'untested',
  `assigned_to` VARCHAR(35),
  `executed_by` VARCHAR(35),
  `executed_at` DATETIME,
  `note` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`test_run_id`) REFERENCES `test_runs`(`test_run_id`) ON DELETE CASCADE,
  FOREIGN KEY (`testcase_id`) REFERENCES `testcase`(`testcase_id`) ON DELETE CASCADE,
  FOREIGN KEY (`assigned_to`) REFERENCES `users`(`user_id`),
  FOREIGN KEY (`executed_by`) REFERENCES `users`(`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `test_run_steps` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `test_run_testcase_id` INT NOT NULL,
  `step_number` INT NOT NULL,
  `status` ENUM('untested', 'passed', 'failed', 'blocked', 'skipped') DEFAULT 'untested',
  `actual_result` TEXT,
  `evidence_url` TEXT,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`test_run_testcase_id`) REFERENCES `test_run_testcases`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
