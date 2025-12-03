-- Add timezone column to users table
ALTER TABLE users ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh';

-- Create user_devices table
CREATE TABLE user_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(35) NOT NULL,
    ip_address VARCHAR(45),
    device_name VARCHAR(255),
    location VARCHAR(255),
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    token_hash VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
