import { db } from '../db/index.js';
import { otps } from '../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

class OTPService {
  /**
   * Generate a 6-digit numeric OTP
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Create and store an OTP in the database
   * @param {string} email - User email
   * @param {string} type - 'signup' or 'login'
   * @param {string} userId - UUID of the user (optional for signup)
   */
  async createOTP(email, type, userId = null) {
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 minute expiry

    // Remove existing OTPs for this email/type to prevent clutter
    await db.delete(otps).where(
      and(
        eq(otps.email, email.toLowerCase()),
        eq(otps.type, type)
      )
    );

    await db.insert(otps).values({
      email: email.toLowerCase(),
      code,
      type,
      userId,
      expiresAt,
    });

    return code;
  }

  /**
   * Verify an OTP
   * @param {string} email - User email
   * @param {string} code - Code to verify
   * @param {string} type - 'signup' or 'login'
   * @returns {boolean}
   */
  async verifyOTP(email, code, type) {
    const [record] = await db
      .select()
      .from(otps)
      .where(
        and(
          eq(otps.email, email.toLowerCase()),
          eq(otps.code, code),
          eq(otps.type, type),
          gt(otps.expiresAt, new Date())
        )
      )
      .limit(1);

    if (record) {
      // Consume the OTP
      await db.delete(otps).where(eq(otps.id, record.id));
      return true;
    }

    return false;
  }
}

export default new OTPService();
