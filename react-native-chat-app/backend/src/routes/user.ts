import express from 'express';
import { db } from '../db';
import { user } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get user profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const userData = await db
      .select({ id: user.id, email: user.email, createdAt: user.createdAt })
      .from(user)
      .where(eq(user.id, userId));

    if (userData.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userData[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

export default router;