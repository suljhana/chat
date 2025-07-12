import express from 'express';
import { db } from '../db';
import { message, vote } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, and } from 'drizzle-orm';

const router = express.Router();

// Get messages for a chat
router.get('/:chatId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(message.createdAt);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Vote on a message
router.post('/:messageId/vote', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const messageId = req.params.messageId;
    const { isUpvoted, chatId } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Upsert vote
    await db
      .insert(vote)
      .values({
        chatId,
        messageId,
        isUpvoted,
      })
      .onConflictDoUpdate({
        target: [vote.chatId, vote.messageId],
        set: { isUpvoted },
      });

    res.json({ success: true });
  } catch (error) {
    console.error('Error voting on message:', error);
    res.status(500).json({ error: 'Failed to vote on message' });
  }
});

// Get votes for a chat
router.get('/:chatId/votes', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const votes = await db
      .select()
      .from(vote)
      .where(eq(vote.chatId, chatId));

    res.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

export default router;