const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");

const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const emailService = require("./email.service");
const Role = require("../models/Role");

class AuthService {
  async resetPasswordFirstLogin(
    email,
    password,
    newPassword,
    is_change_password
  ) {
    const user = await User.scope("withPassword").findOne({ where: { email } });

    if (!user) {
      throw new ApiError("Forbidden", 403);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError("Sai mật khẩu", 400);
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,35}$/;

    if (!newPassword || newPassword.length < 8 || !regex.test(newPassword)) {
      throw new ApiError("Password must be at least 8 - 35 characters", 400);
    }
    user.password = newPassword;

    if (is_change_password) {
      user.is_change_password = false;
    }

    await user.save({ validate: false });

    return {
      message: "Chuyển mật khẩu thành công!",
      is_change_password: false,
    };
  }

  async login(email, password, isRemember, ipAddress, userAgent) {
    if (!email || !password) {
      throw new ApiError("All field cannot be empty!", 400);
    }
    const user = await User.scope("withPassword").findOne({
      where: { email },
      include: [
        {
          model: Role,
          attributes: ["role_name"], // chỉ lấy role_name thôi
        },
      ],
    });

    if (!user) {
      throw new ApiError("Sai mật khẩu hoặc email", 400);
    }
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new ApiError("Sai mật khẩu hoặc email", 400);
    }

    const refreshToken = user.generateRefreshToken(isRemember);
    await user.save({ validateBeforeSave: false });

    const accessToken = user.generateAuthToken();

    // Track device
    const UserDevice = require("../models/UserDevice");
    // Simple device name parsing from userAgent (can be improved with a library like ua-parser-js)
    let deviceName = "Unknown Device";
    if (userAgent) {
      if (userAgent.includes("Windows")) deviceName = "Windows PC";
      else if (userAgent.includes("Mac")) deviceName = "Mac";
      else if (userAgent.includes("Linux")) deviceName = "Linux PC";
      else if (userAgent.includes("Android")) deviceName = "Android Device";
      else if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
        deviceName = "iOS Device";

      // Add browser info
      if (userAgent.includes("Chrome")) deviceName += " (Chrome)";
      else if (userAgent.includes("Firefox")) deviceName += " (Firefox)";
      else if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
        deviceName += " (Safari)";
      else if (userAgent.includes("Edge")) deviceName += " (Edge)";
    }

    // Hash the refresh token to identify the session securely if needed,
    // or just store it. For now, we'll store the refresh token hash or just rely on user_id + ip/agent
    // But to support "Revoke", we need to link the session to the token.
    // Since we store refreshToken in User table (single session per user effectively for refresh),
    // but here we want to support multiple devices.
    // The current User model only stores ONE refreshToken.
    // To support multiple devices properly, we should move refreshToken to UserDevice table.
    // However, the requirement is "Display logged in devices".
    // If we want to support multiple concurrent sessions with different refresh tokens, we need to change the architecture.
    // Given the scope, maybe we just log the login event for now, OR we assume the user wants multiple sessions support.
    // If User table has `refreshToken` column, it implies single session (or last session wins).
    // Let's check User model again. Yes, `refreshToken` is on User.
    // This means logging in on a new device invalidates the old refresh token if we overwrite it.
    // BUT, the user asked for "Manage logged in devices". This strongly implies multiple sessions.
    // I should probably move refreshToken to UserDevice, OR just track them for display and accept that only the last one is "refreshable"
    // (which would be a bad UX if they get logged out).
    // Let's assume for this task I should support multiple sessions.
    // I will store the refreshToken in UserDevice.
    // I need to update UserDevice model to store refreshToken?
    // The UserDevice model I created has `token_hash`. I can store the refresh token there (or hash of it).
    // And I should update `refreshToken` logic to check UserDevice table instead of User table.
    // This is a bigger change.
    // Let's stick to the plan: "Display logged in devices".
    // I will create a UserDevice record on login.
    // If I don't change the JWT logic, only the last login will have a valid refresh token.
    // To support multiple devices, I should check `UserDevice` for refresh token.
    // Let's update `refreshToken` method in AuthService too.

    await UserDevice.create({
      user_id: user.user_id,
      ip_address: ipAddress,
      device_name: deviceName,
      location: "Unknown", // GeoIP lookup would go here
      token_hash: refreshToken, // Storing the token (or hash) to match later
      last_active: new Date(),
    });

    return {
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.Role.role_name,
        timezone: user.timezone,
        is_change_password: user.is_change_password,
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(user_id, refreshToken) {
    try {
      const user = await User.findByPk(user_id);

      if (!user) throw new ApiError("Không tìm thấy user", 400);

      // Legacy clear
      user.refreshToken = null;
      await user.save({ validate: false });

      // Device clear
      if (refreshToken) {
        const UserDevice = require("../models/UserDevice");
        await UserDevice.destroy({ where: { token_hash: refreshToken } });
      }

      return "Log out thanh cong";
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 401);
    }
  }

  async getDevices(userId) {
    const UserDevice = require("../models/UserDevice");
    return await UserDevice.findAll({
      where: { user_id: userId },
      order: [["last_active", "DESC"]],
    });
  }

  async revokeDevice(userId, deviceId) {
    const UserDevice = require("../models/UserDevice");
    const device = await UserDevice.findOne({
      where: { id: deviceId, user_id: userId },
    });

    if (!device) {
      throw new ApiError("Device not found", 404);
    }

    // If we were fully implementing multiple sessions, we would delete the token here.
    // Since we are storing the token in UserDevice (as token_hash), we can just delete the record.
    // And in refreshToken method, we should check if the token exists in UserDevice.

    await device.destroy();
    return { message: "Device revoked successfully" };
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

      // Check if token exists in UserDevice (supporting multiple sessions)
      const UserDevice = require("../models/UserDevice");
      const device = await UserDevice.findOne({
        where: { token_hash: refreshToken },
      });

      // Also check User table for backward compatibility or if we decide to keep single session there?
      // Let's check User table as well to be safe, or just User to get user data.
      const user = await User.scope("withTokens").findByPk(decoded.id);

      if (!user) {
        throw new ApiError("Invalid refresh token", 401);
      }

      // If we are enforcing device management, we MUST check if the device record exists.
      // If the user revoked the device, the record is gone.
      if (!device) {
        // Fallback: if not in Device table (maybe old session), check User table?
        // But we want to support Revoke. So if it's not in Device table, it's invalid (unless it's the "legacy" one in User table and we haven't migrated).
        // For this feature, let's enforce UserDevice check.
        // But wait, existing users won't have UserDevice records.
        // So maybe check: if UserDevice table has records for this user, enforce it. If not, allow User.refreshToken?
        // Or just allow if it matches User.refreshToken (legacy) OR UserDevice.token_hash.

        if (user.refreshToken !== refreshToken) {
          throw new ApiError("Invalid refresh token", 401);
        }
      }

      const newAccessToken = user.generateAuthToken();
      // We usually rotate refresh tokens too.
      const newRefreshToken = user.generateRefreshToken();

      // Update User table (legacy/primary)
      await user.save({ validateBeforeSave: false });

      // Update UserDevice if it exists
      if (device) {
        device.token_hash = newRefreshToken;
        device.last_active = new Date();
        await device.save();
      } else {
        // If it was a legacy session (matched User.refreshToken but no Device),
        // maybe we should create a Device record now?
        // Let's create one to "migrate" this session to a tracked device.
        await UserDevice.create({
          user_id: user.user_id,
          ip_address: "Unknown (Legacy)",
          device_name: "Unknown Device (Legacy)",
          token_hash: newRefreshToken,
          last_active: new Date(),
        });
      }

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new ApiError("Invalid refresh token", 401);
    }
  }
  async forgotPassword(email) {
    const user = await User.scope("withTokens").findOne({ where: { email } });

    if (!user) {
      throw new ApiError("Email chưa được đăng ký! Vui lòng thử lại", 404);
    }

    const resetToken = user.generateOTPToken();
    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendOtpEmail(user.email, resetToken);
      return { message: "Mã OTP đã được gửi đến email của bạn!" };
    } catch (error) {
      user.otpToken = null;
      user.otpTokenExpires = null;
      await user.save({ validateBeforeSave: false });
      throw new ApiError("Có lỗi khi gửi mã OTP", 500);
    }
  }
  async verifyOtp(email, token) {
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(token)) {
      throw new ApiError("Otp phải có 6 chữ số!", 422);
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.scope("withTokens").findOne({
      where: {
        email: email,
        otpToken: hashedToken,
        otpTokenExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new ApiError("Token hết hạn! Vui lòng thử lại", 400);
    }

    const tempResetToken = crypto.randomBytes(32).toString("hex");
    const hashedTempToken = crypto
      .createHash("sha256")
      .update(tempResetToken)
      .digest("hex");

    // Xóa OTP token đã verify
    user.otpToken = hashedTempToken;
    user.otpTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    return {
      message: "Mã OTP chính xác!",
      resetToken: tempResetToken,
    };
  }

  async resetPassword(tempResetToken, newPassword, email) {
    const hashedTempToken = crypto
      .createHash("sha256")
      .update(tempResetToken)
      .digest("hex");
    const user = await User.scope("withPassword").findOne({
      where: {
        email: email,
        otpToken: hashedTempToken,
        otpTokenExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      throw new ApiError("Phiên đổi mật khẩu hết hạn! Vui lòng thử lại", 400);
    }

    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,35}$/;

    if (!newPassword || newPassword.length < 8 || !regex.test(newPassword)) {
      throw new ApiError("Password must be at least 8 - 35 characters", 400);
    }
    user.password = newPassword;
    user.otpToken = null;
    user.otpTokenExpires = null;
    user.refreshToken = null;

    await user.save({ validate: false });
    return { message: "Mật khẩu được đổi thành công!" };
  }
}

module.exports = AuthService;
