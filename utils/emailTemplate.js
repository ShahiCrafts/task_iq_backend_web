const generateVerificationEmail = (name, verificationUrl) => {
  return `
    <div style="font-family: 'Inter', 'Segoe UI', Roboto, sans-serif; background-color: #f4f5f7; padding: 40px 20px; margin: 0;">
      <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); text-align: center; padding: 0 30px;">
        
        <!-- Logo -->
        <div style="padding: 30px 0;">
          <img src="https://yourdomain.com/logo.png" alt="Task IQ Logo" width="48" style="margin-bottom: 16px;">
        </div>

        <!-- Greeting -->
        <h2 style="font-size: 20px; font-weight: 600; color: #1f2937; margin: 0 0 16px;">Hi ${name},</h2>
        <p style="font-size: 14px; color: #4b5563; margin: 0 0 24px;">
          Your Task IQ account has been approved! You can now activate your account and get started.
        </p>

        <!-- Verification button -->
        <a href="${verificationUrl}" style="background-color: #6366f1; color: #ffffff; padding: 14px 20px; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; display: inline-block; margin-bottom: 24px;">
          Get Started
        </a>

        <!-- Optional link -->
        <p style="font-size: 12px; color: #6b7280; margin: 0 0 24px; line-height: 1.5;">
          Or copy and paste this link into your browser:<br>
          <a href="${verificationUrl}" style="color: #6366f1; text-decoration: underline; word-break: break-word;">
            ${verificationUrl}
          </a>
        </p>

        <!-- App download section -->
        <div style="padding: 0 0 30px;">
          <p style="font-size: 13px; color: #4b5563; margin: 0 0 12px;">Get the Task IQ app!</p>
          <a href="https://play.google.com/store" style="display: inline-block;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/2560px-Google_Play_Store_badge_EN.svg.png" alt="Google Play" height="40">
          </a>
        </div>

        <!-- Footer -->
        <div style="padding: 20px; background-color: #f9fafb; font-size: 11px; color: #9ca3af;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Task IQ. All rights reserved.</p>
          <p style="margin: 4px 0 0;">
            Need help? 
            <a href="mailto:support@taskiq.com" style="color: #6366f1; text-decoration: none;">support@taskiq.com</a>
          </p>
        </div>

      </div>
    </div>
  `;
};

module.exports = { generateVerificationEmail };
