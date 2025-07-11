import express from 'express';
import { z } from 'zod';
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { config, hasValidAPIKeys } from '../config/env';
import { db } from '../db';
import { message, chat } from '../db/schema';
import { authenticateToken, AuthRequest, optionalAuth } from '../middleware/auth';
import { eq } from 'drizzle-orm';
import { io } from '../index';

const router = express.Router();

const chatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })),
  model: z.string().default('gpt-4o-mini'),
  chatId: z.string().optional(),
});

// Get available models
router.get('/models', (req, res) => {
  const models = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai' },
    { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', provider: 'anthropic' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', provider: 'anthropic' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'google' },
  ];

  res.json({ models, hasAPIKeys: hasValidAPIKeys() });
});

// Chat completion with streaming
router.post('/chat', optionalAuth, async (req: AuthRequest, res) => {
  try {
    if (!hasValidAPIKeys()) {
      return res.status(400).json({ error: 'No AI API keys configured' });
    }

    const { messages, model, chatId } = chatSchema.parse(req.body);
    const userId = req.user?.id;

    // Set up the appropriate AI provider
    let aiModel;
    if (model.startsWith('gpt-') && config.openaiApiKey) {
      aiModel = openai(model);
    } else if (model.startsWith('claude-') && config.anthropicApiKey) {
      aiModel = anthropic(model);
    } else if (model.startsWith('gemini-') && config.googleApiKey) {
      aiModel = google(model);
    } else {
      // Fallback to available model
      if (config.openaiApiKey) {
        aiModel = openai('gpt-4o-mini');
      } else if (config.anthropicApiKey) {
        aiModel = anthropic('claude-3-haiku-20240307');
      } else if (config.googleApiKey) {
        aiModel = google('gemini-pro');
      } else {
        return res.status(400).json({ error: 'No compatible AI model available' });
      }
    }

    // Save user message if authenticated and chatId provided
    if (userId && chatId) {
      const userMessage = messages[messages.length - 1];
      if (userMessage?.role === 'user') {
        await db.insert(message).values({
          chatId,
          role: userMessage.role,
          content: userMessage.content,
          attachments: [],
        });
      }
    }

    const result = await streamText({
      model: aiModel,
      messages,
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Set up streaming response
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    let fullResponse = '';
    
    for await (const delta of result.textStream) {
      fullResponse += delta;
      res.write(delta);
      
      // Emit to socket if chatId provided
      if (chatId) {
        io.to(chatId).emit('chat-delta', { delta, chatId });
      }
    }

    res.end();

    // Save assistant message if authenticated and chatId provided
    if (userId && chatId && fullResponse) {
      await db.insert(message).values({
        chatId,
        role: 'assistant',
        content: fullResponse,
        attachments: [],
      });

      // Update chat title if it's the first exchange
      const chatMessages = await db.select().from(message).where(eq(message.chatId, chatId));
      if (chatMessages.length <= 2) {
        const firstUserMessage = chatMessages.find(m => m.role === 'user');
        if (firstUserMessage) {
          const title = firstUserMessage.content.toString().slice(0, 50) + '...';
          await db.update(chat).set({ title }).where(eq(chat.id, chatId));
        }
      }
    }

  } catch (error) {
    console.error('Chat error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

// Get chat history
router.get('/chat/:chatId/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify chat ownership
    const chatData = await db.select().from(chat).where(eq(chat.id, chatId));
    if (chatData.length === 0 || chatData[0].userId !== userId) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messages = await db
      .select()
      .from(message)
      .where(eq(message.chatId, chatId))
      .orderBy(message.createdAt);

    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

export default router;