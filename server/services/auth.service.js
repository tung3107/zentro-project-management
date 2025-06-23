const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Op } = require("sequelize");

const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const emailService = require("./email.service");

class AuthService {
  async login(email, password, isRemember) {
    if (!email || !password) {
      throw new ApiError("All field cannot be empty!", 400);
    }
    const user = await User.scope("withPassword").findOne({ where: { email } });

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

    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_id: user.role_id,
      },
      accessToken,
      refreshToken,
    };
  }
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      const user = await User.scope("withTokens").findByPk(decoded.id);

      if (!user || user.refreshToken !== refreshToken) {
        throw new ApiError("Invalid refresh token", 401);
      }

      const newAccessToken = user.generateAuthToken();
      const newRefreshToken = user.generateRefreshToken();
      await user.save({ validateBeforeSave: false });
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
