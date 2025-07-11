import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, useTheme, Surface, IconButton, Divider } from 'react-native-paper';
import { DrawerContentScrollView, DrawerContentComponentProps } from '@react-navigation/drawer';
import { useChat } from '../contexts/ChatContext';
import { format, isToday, isYesterday } from 'date-fns';

export const SidebarContent: React.FC<DrawerContentComponentProps> = (props) => {
  const theme = useTheme();
  const { chats, currentChat, createChat, deleteChat, selectChat } = useChat();

  const handleNewChat = () => {
    const newChat = createChat();
    props.navigation.closeDrawer();
  };

  const handleDeleteChat = (chatId: string) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteChat(chatId)
        },
      ]
    );
  };

  const handleSelectChat = (chatId: string) => {
    selectChat(chatId);
    props.navigation.closeDrawer();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  const groupedChats = chats.reduce((groups, chat) => {
    const date = formatDate(chat.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(chat);
    return groups;
  }, {} as Record<string, typeof chats>);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text variant="titleLarge" style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          AI Chat
        </Text>
        <IconButton
          icon="plus"
          onPress={handleNewChat}
          iconColor={theme.colors.onSurface}
          style={styles.newChatButton}
        />
      </View>

      <Divider style={{ backgroundColor: theme.colors.outline }} />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.keys(groupedChats).length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
              Your conversations will appear here once you start chatting!
            </Text>
          </View>
        ) : (
          Object.entries(groupedChats).map(([date, dateChats]) => (
            <View key={date} style={styles.dateGroup}>
              <Text variant="labelMedium" style={[styles.dateLabel, { color: theme.colors.onSurfaceVariant }]}>
                {date}
              </Text>
              {dateChats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  style={[
                    styles.chatItem,
                    currentChat?.id === chat.id && { backgroundColor: theme.colors.primaryContainer }
                  ]}
                  onPress={() => handleSelectChat(chat.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.chatContent}>
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.chatTitle,
                        { color: currentChat?.id === chat.id ? theme.colors.onPrimaryContainer : theme.colors.onSurface }
                      ]}
                      numberOfLines={2}
                    >
                      {chat.title}
                    </Text>
                  </View>
                  <IconButton
                    icon="delete"
                    size={16}
                    iconColor={theme.colors.onSurfaceVariant}
                    onPress={() => handleDeleteChat(chat.id)}
                    style={styles.deleteButton}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  newChatButton: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  dateGroup: {
    marginTop: 16,
  },
  dateLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  deleteButton: {
    margin: 0,
  },
});

export default SidebarContent;