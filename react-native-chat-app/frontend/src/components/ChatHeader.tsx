import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Appbar, Menu, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import { useChat } from '../contexts/ChatContext';

export const ChatHeader: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const { currentChat, selectedModel, setSelectedModel } = useChat();
  const [visible, setVisible] = React.useState(false);

  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  const toggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  };

  const models = [
    { id: 'gpt-4o-mini', name: 'GPT-4 Omni Mini' },
    { id: 'gpt-4o', name: 'GPT-4 Omni' },
    { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
    { id: 'gemini-pro', name: 'Gemini Pro' },
  ];

  const selectedModelName = models.find(m => m.id === selectedModel)?.name || 'GPT-4 Omni Mini';

  return (
    <Appbar.Header style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <Appbar.Action 
        icon="menu" 
        onPress={toggleDrawer}
        iconColor={theme.colors.onSurface}
      />
      
      <Appbar.Content
        title={currentChat?.title || 'New Chat'}
        subtitle={`Model: ${selectedModelName}`}
        titleStyle={{ color: theme.colors.onSurface }}
        subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
      />
      
      <Menu
        visible={visible}
        onDismiss={closeMenu}
        anchor={
          <Appbar.Action
            icon="robot"
            onPress={openMenu}
            iconColor={theme.colors.onSurface}
          />
        }
      >
        {models.map((model) => (
          <Menu.Item
            key={model.id}
            onPress={() => {
              setSelectedModel(model.id);
              closeMenu();
            }}
            title={model.name}
            leadingIcon={selectedModel === model.id ? "check" : undefined}
          />
        ))}
      </Menu>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 1,
  },
});