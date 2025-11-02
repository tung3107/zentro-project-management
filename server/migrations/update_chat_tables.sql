-- ============================================
-- Migration Script for Chat Feature
-- ============================================
-- Run this script to update your database schema
-- for the chat feature to work properly

-- 1. Add new columns to 'chats' table
ALTER TABLE `chats` 
  ADD COLUMN IF NOT EXISTS `chat_avatar` TEXT DEFAULT NULL AFTER `chat_color`,
  ADD COLUMN IF NOT EXISTS `created_by` VARCHAR(35) DEFAULT NULL AFTER `chat_avatar`,
  MODIFY COLUMN `chat_color` VARCHAR(20) DEFAULT '#cb0404';

-- 2. Add new columns to 'chat_members' table  
ALTER TABLE `chat_members`
  MODIFY COLUMN `is_blocked` BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS `blocked_by` VARCHAR(35) DEFAULT NULL AFTER `is_blocked`,
  ADD COLUMN IF NOT EXISTS `blocked_at` DATETIME DEFAULT NULL AFTER `blocked_by`;

-- 3. Update 'messages' table to add file_name column (optional, for future use)
-- ALTER TABLE `messages`
--   ADD COLUMN IF NOT EXISTS `file_name` TEXT DEFAULT NULL AFTER `file_url`;

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_chat_created_by` ON `chats` (`created_by`);
CREATE INDEX IF NOT EXISTS `idx_message_chat_id` ON `messages` (`chat_id`);
CREATE INDEX IF NOT EXISTS `idx_message_sender_id` ON `messages` (`sender_id`);
CREATE INDEX IF NOT EXISTS `idx_chat_member_user_id` ON `chat_members` (`user_id`);
CREATE INDEX IF NOT EXISTS `idx_media_file_chat_id` ON `media_files` (`chat_id`);

-- ============================================
-- End of Migration Script
-- ============================================

