import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';
import { UIMessage } from '../contexts/ChatContext';
import { Markdown } from './Markdown';

interface MessageProps {
  message: UIMessage;
  isLoading: boolean;
  isReadonly: boolean;
}

export const Message: React.FC<MessageProps> = ({
  message,
  isLoading,
  isReadonly,
}) => {
  const theme = useTheme();
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <View style={[styles.container, isUser && styles.userContainer]}>
      {isAssistant && (
        <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
          <Text style={[styles.avatarText, { color: theme.colors.onPrimary }]}>✨</Text>
        </View>
      )}
      
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        <Surface
          style={[
            styles.messageBubble,
            isUser && [styles.userBubble, { backgroundColor: theme.colors.primary }],
            isAssistant && [styles.assistantBubble, { backgroundColor: theme.colors.surfaceVariant }],
          ]}
          elevation={isUser ? 2 : 0}
        >
          <Markdown
            style={[
              styles.messageText,
              isUser && { color: theme.colors.onPrimary },
              isAssistant && { color: theme.colors.onSurfaceVariant },
            ]}
          >
            {message.content}
          </Markdown>
          
          {isLoading && (
            <View style={styles.loadingIndicator}>
              <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>●●●</Text>
            </View>
          )}
        </Surface>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginVertical: 8,
  },
  userContainer: {
    flexDirection: 'row-reverse',
    alignSelf: 'flex-end',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
  },
  messageContainer: {
    flex: 1,
    maxWidth: '85%',
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: '100%',
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  loadingIndicator: {
    marginTop: 8,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    opacity: 0.7,
  },
});