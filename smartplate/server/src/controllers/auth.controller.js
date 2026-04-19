// ✅ auth.controller.js — Updated with OTP & 2FA
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";
import mailService from "../utils/mail.service.js";
import otpService from "../utils/otp.service.js";

const SALT_ROUNDS = 12;

const emailSchema = z.string().email("Invalid email address");

// ── Signup ────────────────────────────────────────────────────────────────────

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // 1. Validate inputs
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required." });
    }

    const emailResult = emailSchema.safeParse(email.trim());
    if (!emailResult.success) {
      return res.status(400).json({ error: emailResult.error.errors[0].message });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    // 2. Check for existing user
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // 3. Hash and insert (isVerified defaults to false)
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    // 4. Generate and send OTP
    const code = await otpService.createOTP(newUser.email, 'signup');
    await mailService.sendOTP(newUser.email, code, 'signup');

    // Return success message. UI should then show OTP input.
    return res.status(201).json({ 
      message: "Registration successful. Please verify your email.",
      email: newUser.email 
    });

  } catch (err) {
    next(err);
  }
}

// ── Verify Signup OTP ─────────────────────────────────────────────────────────

export async function verifySignupOTP(req, res, next) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required." });
    }

    const isValid = await otpService.verifyOTP(email, code, 'signup');
    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired verification code." });
    }

    // Mark user as verified
    await db
      .update(users)
      .set({ isVerified: true })
      .where(eq(users.email, email.toLowerCase().trim()));

    // Fetch the user to return
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    const token = signToken(user.id);
    const { passwordHash: _, ...safeUser } = user;

    return res.status(200).json({ 
      message: "Email verified successfully.",
      user: safeUser, 
      token 
    });

  } catch (err) {
    next(err);
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required." });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      await bcrypt.compare(password, "$2b$12$invalidhashforconstanttiming00");
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Check if account is verified. If not, they should have been stopped at signup.
    // But we handle it here too just in case.
    if (!user.isVerified) {
      // Resend signup OTP if they try to login unverified
      const code = await otpService.createOTP(user.email, 'signup');
      await mailService.sendOTP(user.email, code, 'signup');
      return res.status(403).json({ 
        error: "Your email is not verified. A new code has been sent.",
        email: user.email,
        unverified: true
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Password is correct, now send 2FA OTP
    const code = await otpService.createOTP(user.email, 'login', user.id);
    await mailService.sendOTP(user.email, code, 'login');

    return res.status(200).json({ 
      mfaRequired: true, 
      email: user.email,
      message: "2FA code sent to your email."
    });

  } catch (err) {
    next(err);
  }
}

// ── Verify Login 2FA ──────────────────────────────────────────────────────────

export async function verifyLogin2FA(req, res, next) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email and code are required." });
    }

    const isValid = await otpService.verifyOTP(email, code, 'login');
    if (!isValid) {
      return res.status(401).json({ error: "Invalid or expired 2FA code." });
    }

    // Fetch user and log them in
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    const token = signToken(user.id);
    const { passwordHash: _, ...safeUser } = user;

    return res.status(200).json({ 
      message: "Login successful.",
      user: safeUser, 
      token 
    });

  } catch (err) {
    next(err);
  }
}

// ── Private helper ────────────────────────────────────────────────────────────

function signToken(userId) {
  return jwt.sign(
    { sub: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}