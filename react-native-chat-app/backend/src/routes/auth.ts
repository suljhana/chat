import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db';
import { user } from '../db/schema';
import { config } from '../config/env';
import { eq } from 'drizzle-orm';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await db.select().from(user).where(eq(user.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await db.insert(user).values({
      email,
      password: hashedPassword,
    }).returning({ id: user.id, email: user.email });

    // Generate JWT
    const token = jwt.sign(
      { id: newUser[0].id, email: newUser[0].email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: { id: newUser[0].id, email: newUser[0].email },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const existingUser = await db.select().from(user).where(eq(user.email, email));
    if (existingUser.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, existingUser[0].password || '');
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: existingUser[0].id, email: existingUser[0].email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      user: { id: existingUser[0].id, email: existingUser[0].email },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to login' });
  }
});

export default router;