import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {
  FAB,
  Text,
  Card,
  Title,
  ActivityIndicator,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useChat, Chat } from '../contexts/ChatContext';

export const ChatListScreen = () => {
  const navigation = useNavigation();
  const { chats, isLoading, loadChats, createChat, deleteChat, setCurrentChat } = useChat();

  useEffect(() => {
    loadChats();
  }, []);

  const handleCreateChat = async () => {
    try {
      const newChat = await createChat('New Chat');
      setCurrentChat(newChat);
      navigation.navigate('Chat' as never, { chatId: newChat.id } as never);
    } catch (error) {
      Alert.alert('Error', 'Failed to create chat');
    }
  };

  const handleChatPress = (chat: Chat) => {
    setCurrentChat(chat);
    navigation.navigate('Chat' as never, { chatId: chat.id } as never);
  };

  const handleDeleteChat = async (chatId: string) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteChat(chatId),
        },
      ]
    );
  };

  const renderChatItem = ({ item }: { item: Chat }) => (
    <Card style={styles.chatCard} onPress={() => handleChatPress(item)}>
      <Card.Content style={styles.chatContent}>
        <View style={styles.chatInfo}>
          <Title numberOfLines={1} style={styles.chatTitle}>
            {item.title}
          </Title>
          <Text style={styles.chatDate}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <IconButton
          icon="delete"
          size={20}
          onPress={() => handleDeleteChat(item.id)}
        />
      </Card.Content>
    </Card>
  );

  if (isLoading && chats.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading chats...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Your Chats</Title>
      </View>
      
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to start a new conversation</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleCreateChat}
        label="New Chat"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  chatCard: {
    marginBottom: 12,
    elevation: 2,
  },
  chatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  chatDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});