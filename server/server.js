require("dotenv").config({ path: "./config.env" });
const app = require("./app");
const http = require("http");
const { initSocket } = require("./socket");

const { connectDB } = require("./models/index");
const Permission = require("./models/Permission");
const Role = require("./models/Role");
const User = require("./models/User");

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception 💥", err.name, err.message);
});

const port = process.env.PORT || 3000;
const server = http.createServer(app);

// ⚡ Khởi tạo socket
initSocket(server);

server.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

connectDB();

process.on("unhandledRejection", (err) => {
  console.log("Unhandled Rejection 💥", err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
