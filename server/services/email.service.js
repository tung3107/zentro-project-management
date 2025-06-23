const nodemailer = require("nodemailer");
const ApiError = require("../utils/ApiError");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: options.email,
        subject: options.subject,
        html: options.html,
      });
    } catch (error) {
      throw new ApiError("Email gửi bị lỗi", 401);
    }
  }
  async sendOtpEmail(email, otpCode) {
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mã OTP Xác Thực - ZentRo</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Space Grotesk', sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); min-height: 100vh;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); min-height: 100vh; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 20px; box-shadow: 0 20px 50px rgba(21, 48, 96, 0.15); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #cb0404 0%, #d23232 50%, #f37121 100%); padding: 40px 30px; text-align: center; position: relative;">
                            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 20px; backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.2);">
                                <!-- Logo SVG -->
                                <div style="margin-bottom: 15px;">
                                    
                                </div>
                                <h1 style="color: #ffffff; font-size: 32px; font-weight: 700; margin: 0; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">Zentro</h1>
                                <p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 8px 0 0 0; font-weight: 500;">Xác thực bảo mật</p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 50px 40px;">
                            <div style="text-align: center;">
                                <div style="background: linear-gradient(135deg, rgba(203, 4, 4, 0.05) 0%, rgba(243, 113, 33, 0.05) 100%); border-radius: 15px; padding: 30px; margin-bottom: 30px; border: 2px solid rgba(203, 4, 4, 0.1);">
                                    <h2 style="color: #153060; font-size: 28px; font-weight: 600; margin: 0 0 15px 0;">Mã OTP của bạn</h2>
                                    <p style="color: #64748b; font-size: 16px; margin: 0 0 25px 0; line-height: 1.6;">Sử dụng mã xác thực bên dưới để hoàn tất quá trình đăng nhập của bạn:</p>
                                    
                                    <!-- OTP Code -->
                                    <div style="background: linear-gradient(135deg, #cb0404 0%, #d23232 100%); color: #ffffff; font-size: 36px; font-weight: 700; padding: 20px 30px; border-radius: 12px; display: inline-block; letter-spacing: 8px; box-shadow: 0 10px 30px rgba(203, 4, 4, 0.3); margin: 10px 0;">
                                        ${otpCode}
                                    </div>
                                </div>
                                
                                <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 4px solid #f37121;">
                                    <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                                        <div style="background: rgba(243, 113, 33, 0.1); border-radius: 50%; padding: 8px; margin-right: 12px;">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f37121" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <circle cx="12" cy="12" r="10"/>
                                                <path d="m9 12 2 2 4-4"/>
                                            </svg>
                                        </div>
                                        <h3 style="color: #153060; font-size: 18px; font-weight: 600; margin: 0;">Lưu ý quan trọng</h3>
                                    </div>
                                    <ul style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px; text-align: left;">
                                        <li style="margin-bottom: 8px;">Mã OTP có hiệu lực trong <strong style="color: #cb0404;">5 phút</strong></li>
                                        <li style="margin-bottom: 8px;">Không chia sẻ mã này với bất kỳ ai khác</li>
                                        <li>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email</li>
                                    </ul>
                                </div>
                                
                                <div style="border-top: 2px solid #e2e8f0; padding-top: 30px; margin-top: 40px;">
                                    <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">Cần hỗ trợ? Liên hệ với chúng tôi:</p>
                                    <div style="display: inline-flex; gap: 20px; align-items: center;">
                                        <a href="mailto:support@zentro.com" style="color: #cb0404; text-decoration: none; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                                <polyline points="22,6 12,13 2,6"/>
                                            </svg>
                                            support@zentro.com
                                        </a>
                                        <a href="tel:+84123456789" style="color: #f37121; text-decoration: none; font-weight: 500; display: flex; align-items: center; gap: 5px;">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                            </svg>
                                            1900-1234
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                            <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">© 2024 Zentro. Tất cả quyền được bảo lưu.</p>
                            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Email này được gửi tự động, vui lòng không trả lời.</p>
                            <div style="margin-top: 15px;">
                                <a href="#" style="color: #cb0404; text-decoration: none; font-size: 12px; margin: 0 10px;">Chính sách bảo mật</a>
                                <span style="color: #cbd5e1;">|</span>
                                <a href="#" style="color: #cb0404; text-decoration: none; font-size: 12px; margin: 0 10px;">Điều khoản sử dụng</a>
                            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    await this.sendEmail({
      email,
      subject: "[Zentro] Reset password",
      html,
    });
  }
}

module.exports = new EmailService();
