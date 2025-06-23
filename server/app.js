const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const permissionRoutes = require("./routes/permission.routes");
const globalErrorHandler = require("./middlewares/errorHandle");
const ApiError = require("./utils/ApiError");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/permission", permissionRoutes);

app.use((req, res, next) => {
  next(new ApiError(404, "Không tìm thấy route"));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
