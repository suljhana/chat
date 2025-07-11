import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../contexts/ChatContext';
import { Chat } from '../components/Chat';
import { ChatHeader } from '../components/ChatHeader';
import { generateId } from '../utils/generateId';

const ChatScreen: React.FC = () => {
  const theme = useTheme();
  const { currentChat, createChat } = useChat();
  const [chatId, setChatId] = useState<string>(() => generateId());

  useEffect(() => {
    // Auto-create a chat if none exists
    if (!currentChat) {
      createChat();
    }
  }, [currentChat, createChat]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <ChatHeader />
          <Chat 
            id={currentChat?.id || chatId}
            selectedChatModel="gpt-4o-mini"
            selectedVisibilityType="private"
            isReadonly={false}
            hasAPIKeys={true}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default ChatScreen;