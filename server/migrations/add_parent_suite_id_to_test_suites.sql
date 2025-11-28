-- Migration: Add parent_suite_id to test_suites table for nested test suites support
-- Run this script to update your database

-- Add parent_suite_id column to test_suites table
ALTER TABLE test_suites 
ADD COLUMN parent_suite_id INT NULL AFTER project_id,
ADD FOREIGN KEY (parent_suite_id) REFERENCES test_suites(suite_id) ON DELETE CASCADE,
ADD INDEX idx_parent_suite_id (parent_suite_id);

-- Optional: Update existing test suites to have NULL parent_suite_id (they're all root level)
UPDATE test_suites SET parent_suite_id = NULL WHERE parent_suite_id IS NULL;
