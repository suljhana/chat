import express from 'express';
import { z } from 'zod';
import { db } from '../db';
import { chat, message } from '../db/schema';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { eq, desc, and } from 'drizzle-orm';

const router = express.Router();

const createChatSchema = z.object({
  title: z.string().min(1),
  visibility: z.enum(['public', 'private']).default('private'),
});

// Get all chats for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const chats = await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.createdAt));

    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
});

// Get specific chat
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const chatData = await db
      .select()
      .from(chat)
      .where(and(eq(chat.id, chatId), eq(chat.userId, userId)));

    if (chatData.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chatData[0]);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ error: 'Failed to fetch chat' });
  }
});

// Create new chat
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, visibility = 'private' } = createChatSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const newChat = await db
      .insert(chat)
      .values({
        title,
        visibility,
        userId,
      })
      .returning();

    res.status(201).json(newChat[0]);
  } catch (error) {
    console.error('Error creating chat:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create chat' });
  }
});

// Update chat
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const chatId = req.params.id;
    const { title, visibility } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const updatedChat = await db
      .update(chat)
      .set({ title, visibility })
      .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
      .returning();

    if (updatedChat.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(updatedChat[0]);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ error: 'Failed to update chat' });
  }
});

// Delete chat
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Delete messages first (cascade delete)
    await db.delete(message).where(eq(message.chatId, chatId));

    // Delete chat
    const deletedChat = await db
      .delete(chat)
      .where(and(eq(chat.id, chatId), eq(chat.userId, userId)))
      .returning();

    if (deletedChat.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ error: 'Failed to delete chat' });
  }
});

export default router;