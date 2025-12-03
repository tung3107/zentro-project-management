-- Create role_template table
CREATE TABLE IF NOT EXISTS `role_template` (
  `template_id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `permission_id` INT DEFAULT NULL,
  `forbidden` TINYINT(1) DEFAULT 1,
  KEY `idx_role_id` (`role_id`),
  KEY `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_role_template_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_template_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default role template data
-- Note: You mentioned these IDs from your existing project_role_permission data:
-- role_id = 7 appears to be "Trưởng nhóm" (Leader) - has full access with permission_id = null
-- role_id = 5 appears to be "Nhân viên" (Employee) - has specific permissions
-- role_id = 8 appears to be "Người xem" (Viewer) - has limited permissions

-- Insert template for role_id = 7 (Trưởng nhóm - Leader with full access)
INSERT INTO `role_template` (`role_id`, `permission_id`, `forbidden`) VALUES
(7, NULL, 0);

-- Insert templates for role_id = 5 (Nhân viên - Employee)
INSERT INTO `role_template` (`role_id`, `permission_id`, `forbidden`) VALUES
(5, 12, 1),
(5, 13, 1),
(5, 14, 1),
(5, 15, 0),
(5, 34, 1),
(5, 35, 1),
(5, 36, 1),
(5, 37, 1),
(5, 38, 1),
(5, 39, 1);

-- Insert templates for role_id = 8 (Người xem - Viewer)
INSERT INTO `role_template` (`role_id`, `permission_id`, `forbidden`) VALUES
(8, 12, 0),
(8, 13, 0),
(8, 14, 1),
(8, 15, 0),
(8, 34, 1),
(8, 35, 1),
(8, 36, 1),
(8, 37, 1),
(8, 38, 1),
(8, 39, 0);
