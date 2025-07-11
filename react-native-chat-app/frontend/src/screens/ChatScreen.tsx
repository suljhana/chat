import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { GiftedChat, IMessage, Send } from 'react-native-gifted-chat';
import { IconButton, TextInput, Appbar } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useChat } from '../contexts/ChatContext';

export const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { messages, sendMessage, loadMessages, currentChat, isConnected } = useChat();
  const [inputText, setInputText] = useState('');

  // Load messages when screen mounts
  useEffect(() => {
    const { chatId } = route.params as { chatId: string };
    if (chatId) {
      loadMessages(chatId);
    }
  }, [route.params]);

  // Convert messages to GiftedChat format
  const giftedMessages = messages
    .map((msg) => ({
      _id: msg.id,
      text: msg.content,
      createdAt: new Date(msg.createdAt),
      user: {
        _id: msg.role === 'user' ? 1 : 2,
        name: msg.role === 'user' ? 'You' : 'AI Assistant',
        avatar: msg.role === 'user' ? undefined : '🤖',
      },
    }))
    .reverse();

  const handleSend = async () => {
    if (inputText.trim() && currentChat) {
      const messageText = inputText.trim();
      setInputText('');
      await sendMessage(messageText);
    }
  };

  const onGiftedChatSend = (messages: IMessage[] = []) => {
    if (messages.length > 0 && currentChat) {
      sendMessage(messages[0].text);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content 
          title={currentChat?.title || 'Chat'} 
          subtitle={isConnected ? 'Connected' : 'Disconnected'}
        />
      </Appbar.Header>
      
      <GiftedChat
        messages={giftedMessages}
        onSend={onGiftedChatSend}
        user={{ _id: 1 }}
        renderSend={(props) => (
          <Send {...props}>
            <View style={styles.sendButton}>
              <IconButton icon="send" size={24} iconColor="#007AFF" />
            </View>
          </Send>
        )}
        textInputProps={{
          multiline: true,
          maxLength: 1000,
        }}
        placeholder="Type a message..."
        alwaysShowSend
        scrollToBottom
        infiniteScroll
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
});