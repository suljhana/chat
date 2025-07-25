import { getChatById, getVotesByChatId, voteMessage } from '@/lib/db/queries';
import { getEffectiveSession, shouldPersistData } from '@/lib/auth-utils';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const session = await getEffectiveSession();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // In dev mode without auth, return empty votes
  if (!shouldPersistData()) {
    return Response.json([], { status: 200 });
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  if (chat.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const votes = await getVotesByChatId({ id: chatId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const {
    chatId,
    messageId,
    type,
  }: { chatId: string; messageId: string; type: 'up' | 'down' } =
    await request.json();

  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  const session = await getEffectiveSession();

  if (!session || !session.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // In dev mode without auth, just return success without persisting
  if (!shouldPersistData()) {
    return new Response('Message voted', { status: 200 });
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return new Response('Chat not found', { status: 404 });
  }

  if (chat.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  await voteMessage({
    chatId,
    messageId,
    type: type,
  });

  return new Response('Message voted', { status: 200 });
}
