const multer = require("multer");

// Dùng memoryStorage để file chỉ lưu trên RAM
const storage = multer.memoryStorage(); // lưu file trong RAM
const upload = multer({ storage });

module.exports = upload;
