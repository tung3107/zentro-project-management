-- SQL Script to create notifications table
-- Run this script in your MySQL database

CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(35) NOT NULL COMMENT 'ID người nhận thông báo',
  `type` ENUM('task_assigned', 'comment_mention', 'comment_on_task', 'sprint_started', 'sprint_completed') NOT NULL COMMENT 'Loại thông báo',
  `title` VARCHAR(255) NOT NULL COMMENT 'Tiêu đề thông báo',
  `message` TEXT NOT NULL COMMENT 'Nội dung thông báo',
  `task_id` VARCHAR(50) DEFAULT NULL COMMENT 'ID task liên quan (nếu có)',
  `sprint_id` INT DEFAULT NULL COMMENT 'ID sprint liên quan (nếu có)',
  `comment_id` INT DEFAULT NULL COMMENT 'ID comment liên quan (nếu có)',
  `project_id` VARCHAR(50) DEFAULT NULL COMMENT 'ID project liên quan',
  `actor_id` VARCHAR(35) DEFAULT NULL COMMENT 'ID người thực hiện hành động',
  `is_read` TINYINT(1) DEFAULT 0 COMMENT 'Đã đọc hay chưa',
  `link` VARCHAR(500) DEFAULT NULL COMMENT 'Link điều hướng',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_is_read` (`is_read`),
  INDEX `idx_created_at` (`created_at`),
  INDEX `idx_type` (`type`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`task_id`) REFERENCES `tasks`(`task_id`) ON DELETE CASCADE,
  FOREIGN KEY (`sprint_id`) REFERENCES `sprints`(`sprint_id`) ON DELETE CASCADE,
  FOREIGN KEY (`comment_id`) REFERENCES `comments`(`comment_id`) ON DELETE CASCADE,
  FOREIGN KEY (`project_id`) REFERENCES `projects`(`project_id`) ON DELETE CASCADE,
  FOREIGN KEY (`actor_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
