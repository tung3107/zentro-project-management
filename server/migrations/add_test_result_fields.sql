-- Add image_urls, is_locked, and rerun_count fields to test_run_testcases table
ALTER TABLE test_run_testcases 
ADD COLUMN image_urls JSON DEFAULT NULL,
ADD COLUMN is_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN rerun_count INT DEFAULT 0;

-- Add image_urls field to test_run_history table
ALTER TABLE test_run_history 
ADD COLUMN image_urls JSON DEFAULT NULL;
