const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const permissionRoutes = require("./routes/permission.routes");
const projectRoutes = require("./routes/project.routes");
const userRoutes = require("./routes/user.routes");
const roleRoutes = require("./routes/role.routes");
const memberRoutes = require("./routes/member.routes");
const sprintRoutes = require("./routes/sprint.routes");
const taskRoutes = require("./routes/task.routes");
const statusRoutes = require("./routes/status.routes");
const chatRoutes = require("./routes/chat.routes");

const globalErrorHandler = require("./middlewares/errorHandle");
const ApiError = require("./utils/ApiError");

const app = express();
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true, // nếu truyền cookie/token
  })
);
app.use(express.json());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/permission", permissionRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/members", memberRoutes);
app.use("/api/v1/sprints", sprintRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/status", statusRoutes);
app.use("/api/v1/chats", chatRoutes);

app.use((req, res, next) => {
  next(new ApiError("Không tìm thấy route", 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
