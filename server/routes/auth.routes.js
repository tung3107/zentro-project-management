const express = require("express");
const {
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  refreshToken,
  protectRoute,
  logout,
  resetPasswordFirstLogin,
} = require("../controllers/auth.controller");

const routes = express.Router();

routes.post("/login", login);
routes.post("/forgot-password", forgotPassword);
routes.post("/verify-otp", verifyOtp);
routes.post("/reset-password", resetPassword);

routes.post("/refresh-token", protectRoute, refreshToken);
routes.post("/logout", protectRoute, logout);
routes.post(
  "/reset-password-first-login",
  protectRoute,
  resetPasswordFirstLogin
);

module.exports = routes;
