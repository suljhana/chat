'use server';

import { generateText, Message } from 'ai';
import { cookies } from 'next/headers';

import { myProvider } from '@/lib/ai/providers';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function deleteTrailingMessages() {
  // This is a placeholder function to resolve the import error.
  // The original implementation was not available after removing authentication.
}
