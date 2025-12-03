import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl: string
) {
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER || "noreply@mixfactory.com",
    to: email,
    subject: "Verify your email address - Mix Factory",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Welcome to Mix Factory!</h2>
        <p>Thank you for registering. Please verify your email address to activate your account.</p>
        
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p style="color: #666;">Or copy and paste this link in your browser:</p>
        <p style="color: #2563eb; word-break: break-all;">${verificationUrl}</p>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 24 hours.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px;">
          If you didn't register for this account, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  token: string,
  baseUrl: string
) {
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_SERVER_USER || "noreply@mixfactory.com",
    to: email,
    subject: "Reset your password - Mix Factory",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Reset Your Password</h2>
        <p>We received a request to reset your password. Click the button below to set a new password.</p>
        
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return false;
  }
}
