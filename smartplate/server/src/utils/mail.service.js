import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * MailService - Handles sending emails via Nodemailer.
 * In development, it logs the email to the console if SMTP is not configured.
 */
class MailService {
  constructor() {
    const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER;
    
    if (hasSmtp) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      console.warn('⚠️ SMTP credentials not found. MailService initialized in LOG ONLY mode.');
      this.transporter = null;
    }
  }

  /**
   * Send an OTP email
   * @param {string} to - Recipient email
   * @param {string} code - 6-digit OTP
   * @param {string} type - 'signup' or 'login'
   */
  async sendOTP(to, code, type) {
    const subject = type === 'signup' 
      ? 'Verify your SmartPlate account' 
      : 'Your SmartPlate 2FA Code';
    
    const message = type === 'signup'
      ? `Welcome to SmartPlate! Your verification code is: ${code}. It expires in 10 minutes.`
      : `Your SmartPlate login verification code is: ${code}. If you did not request this, please secure your account.`;

    const html = `
      <div style="background-color: #031810; margin: 0; padding: 40px 20px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e6fced; text-align: center;">
        <div style="max-width: 500px; margin: 0 auto; background: rgba(5, 32, 21, 0.6); border: 1px solid rgba(17, 255, 153, 0.15); border-radius: 16px; padding: 40px; box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);">
          
          <div style="margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.04em; color: #11ff99; text-transform: uppercase;">SmartPlate <span style="color: #e6fced;">AI</span></h1>
            <p style="margin: 5px 0 0; font-size: 10px; font-weight: 700; letter-spacing: 0.3em; color: #88a89b; text-transform: uppercase;">Neural Nutrition Engine</p>
          </div>

          <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(17, 255, 153, 0.2), transparent); margin-bottom: 30px;"></div>

          <h2 style="font-size: 20px; font-weight: 700; color: #e6fced; margin-bottom: 15px;">${type === 'signup' ? 'Welcome to the Future' : 'Secure Entry Required'}</h2>
          <p style="font-size: 15px; color: #88a89b; line-height: 1.6; margin-bottom: 30px;">
            ${type === 'signup' 
              ? 'Your account activation sequence is ready. Use the secure code below to verify your digital profile.' 
              : 'A login attempt has triggered a security protocol. Enter the following code to continue your session.'}
          </p>

          <div style="background: rgba(17, 255, 153, 0.05); border: 1px dashed rgba(17, 255, 153, 0.3); border-radius: 12px; padding: 25px; margin-bottom: 30px;">
            <span style="font-size: 42px; font-weight: 800; letter-spacing: 8px; color: #11ff99; display: block;">${code}</span>
          </div>

          <p style="font-size: 13px; color: #4a665a; margin-bottom: 0;">
            This code is valid for exactly <strong>10 minutes</strong>.<br>
            If you did not request this, please ignore this email.
          </p>

        </div>

        <div style="margin-top: 30px; font-size: 11px; color: #4a665a; letter-spacing: 0.05em; text-transform: uppercase;">
          Powered by SmartPlate AI Intelligence &bull; © 2026
        </div>
      </div>
    `;

    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"SmartPlate AI" <${process.env.SMTP_FROM || 'noreply@smartplate.ai'}>`,
          to,
          subject,
          text: message,
          html,
        });
        console.log(`📧 Email sent successfully to ${to}`);
      } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
        throw new Error('Email delivery failed');
      }
    } else {
      console.log('------------------------------------------');
      console.log(`📧 MOCK EMAIL TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`CODE: ${code}`);
      console.log('------------------------------------------');
    }
  }
}

export default new MailService();
