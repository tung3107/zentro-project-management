CREATE TABLE `permissions` (
  `permission_id` int PRIMARY KEY AUTO_INCREMENT,
  `permission_name` varchar(255) NOT NULL,
  `description` varchar(255),
  `resource` varchar(100) NOT NULL,
  `action` varchar(100)
);

CREATE TABLE `roles` (
  `role_id` int PRIMARY KEY AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255),
  `is_Sytem` boolean DEFAULT false
);

CREATE TABLE `role_permission` (
  `role_id` int NOT NULL COMMENT 'ON DELETE CASCADE',
  `permission_id` int NOT NULL COMMENT 'ON DELETE CASCADE',
  `primary` key(role_id,permission_id)
);

CREATE TABLE `users` (
  `user_id` int PRIMARY KEY AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `avatar` char(255),
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `phone` varchar(255),
  `email` char(50) UNIQUE NOT NULL,
  `role_id` int NOT NULL COMMENT 'ON UPDATE CASCADE',
  `otpToken` varchar(255),
  `otpTokenExpires` datetime,
  `refreshToken` text
);

use zentro;

CREATE TABLE `projects` (
  `project_id` int PRIMARY KEY AUTO_INCREMENT,
  `project_name` varchar(255) NOT NULL,
  `description` varchar(255),
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` varchar(255) NOT NULL,
  `avatar` char(255),
  `leader_id` int NOT NULL COMMENT 'ON Delete set null'
);

CREATE TABLE `members` (
  `project_id` int NOT NULL,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  `primary` key(project_id,user_id,role_id)
);

CREATE UNIQUE INDEX `permissions_index_0` ON `permissions` (`permission_id`);

ALTER TABLE `role_permission` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

ALTER TABLE `role_permission` ADD FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`permission_id`);

ALTER TABLE `users` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

ALTER TABLE `projects` ADD FOREIGN KEY (`leader_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `members` ADD FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`);

ALTER TABLE `members` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

ALTER TABLE `members` ADD FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
