const express = require("express");
const {
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  refreshToken,
  protectRoute,
} = require("../controllers/auth.controller");

const routes = express.Router();

routes.post("/login", login);
routes.post("/forgot-password", forgotPassword);
routes.post("/verify-otp", verifyOtp);
routes.post("/reset-password", resetPassword);

routes.post("/refresh-token", protectRoute, refreshToken);

module.exports = routes;
