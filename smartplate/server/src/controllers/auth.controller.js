// ✅ auth.controller.js — final version
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

const SALT_ROUNDS = 12; // 12 is the production standard (10 is slightly weak)

// ── Signup ────────────────────────────────────────────────────────────────────

export async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;

    // 1. Validate inputs are present
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters." });
    }

    // 2. Check for existing user BEFORE hashing (saves time if duplicate)
    const existing = await db
      .select({ id: users.id })   // only fetch what you need
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    // 3. Hash and insert
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [newUser] = await db
      .insert(users)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        passwordHash,
      })
      .returning({           // get the new row back without a second query
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    // 4. Sign a token so they're immediately logged in — no second request needed
    const token = signToken(newUser.id);

    return res.status(201).json({ user: newUser, token });

  } catch (err) {
    next(err); // passes to the global error handler in app.js
  }
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required." });
    }

    // 1. Look up the user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    // 2. IMPORTANT: same error for "no account" vs "wrong password"
    // This prevents user enumeration — attackers shouldn't know which accounts exist
    if (!user) {
      // Still run bcrypt to prevent timing attacks.
      // Without this, a failed login is measurably faster than a valid one,
      // which tells an attacker "this email doesn't exist" via response time alone.
      await bcrypt.compare(password, "$2b$12$invalidhashforconstanttiming00");
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // 3. Build safe response — explicitly exclude passwordHash
    const token = signToken(user.id);
    const { passwordHash: _, ...safeUser } = user;

    return res.status(200).json({ user: safeUser, token });

  } catch (err) {
    next(err);
  }
}

// ── Private helper ────────────────────────────────────────────────────────────

function signToken(userId) {
  return jwt.sign(
    { sub: userId },          // 'sub' is the JWT standard claim for subject (user ID)
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}