import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useChat } from '../contexts/ChatContext';
import { Messages } from './Messages';
import { MultimodalInput } from './MultimodalInput';
import { Overview } from './Overview';
import { SuggestedActions } from './SuggestedActions';
import { apiClient } from '../services/api';

interface ChatProps {
  id: string;
  selectedChatModel: string;
  selectedVisibilityType: 'private' | 'public';
  isReadonly: boolean;
  hasAPIKeys: boolean;
}

export const Chat: React.FC<ChatProps> = ({
  id,
  selectedChatModel,
  selectedVisibilityType,
  isReadonly,
  hasAPIKeys,
}) => {
  const theme = useTheme();
  const { messages, addMessage, isLoading, setIsLoading } = useChat();
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<any[]>([]);

  // Show error if no API keys are configured
  if (hasAPIKeys === false) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
          <Text variant="headlineMedium" style={[styles.errorTitle, { color: theme.colors.onErrorContainer }]}>
            Missing AI API Keys
          </Text>
          <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
            The chat app requires at least one AI API key to be configured in the backend.
          </Text>
          <Text variant="bodyMedium" style={[styles.errorText, { color: theme.colors.onErrorContainer }]}>
            Please check the backend configuration and ensure API keys are properly set.
          </Text>
        </View>
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
    };

    // Add user message immediately
    addMessage(userMessage);
    setInput('');
    setIsLoading(true);

    try {
      // Call AI API
      const response = await apiClient.post('/ai/chat', {
        messages: [...messages, userMessage],
        model: selectedChatModel,
        stream: false,
      });

      // Add AI response
      addMessage({
        role: 'assistant',
        content: response.data.content,
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      Alert.alert('Error', 'Failed to get AI response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedAction = (action: string) => {
    setInput(action);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.messagesContainer}>
        {messages.length === 0 ? (
          <Overview />
        ) : (
          <Messages
            chatId={id}
            messages={messages}
            isLoading={isLoading}
            isReadonly={isReadonly}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        {!isReadonly && (
          <MultimodalInput
            chatId={id}
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            attachments={attachments}
            setAttachments={setAttachments}
          />
        )}
      </View>

      {messages.length === 0 && (
        <View style={styles.suggestedActionsContainer}>
          <SuggestedActions onActionPress={handleSuggestedAction} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  suggestedActionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorCard: {
    padding: 20,
    borderRadius: 12,
    maxWidth: 400,
  },
  errorTitle: {
    textAlign: 'center',
    marginBottom: 12,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 8,
  },
});