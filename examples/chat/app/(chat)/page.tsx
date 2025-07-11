
import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { hasValidAPIKeys } from '@/lib/ai/api-keys';

export default async function Page() {
  const id = generateUUID();
  const hasAPIKeys = hasValidAPIKeys();
  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedChatModel={DEFAULT_CHAT_MODEL}
        isReadonly={false}
        hasAPIKeys={hasAPIKeys}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
