import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { UIMessage } from '../contexts/ChatContext';
import { Message } from './Message';

interface MessagesProps {
  chatId: string;
  messages: UIMessage[];
  isLoading: boolean;
  isReadonly: boolean;
}

export const Messages: React.FC<MessagesProps> = ({
  chatId,
  messages,
  isLoading,
  isReadonly,
}) => {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.messagesContainer}>
        {messages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLoading={isLoading && index === messages.length - 1}
            isReadonly={isReadonly}
          />
        ))}
        
        {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
          <View style={styles.loadingContainer}>
            <Message
              message={{
                id: 'loading',
                role: 'assistant',
                content: 'Thinking...',
                createdAt: new Date().toISOString(),
              }}
              isLoading={true}
              isReadonly={isReadonly}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  messagesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  loadingContainer: {
    opacity: 0.7,
  },
});