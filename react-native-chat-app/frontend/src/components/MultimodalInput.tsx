import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { IconButton, useTheme, Surface } from 'react-native-paper';

interface MultimodalInputProps {
  chatId: string;
  input: string;
  setInput: (input: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  attachments: any[];
  setAttachments: (attachments: any[]) => void;
}

export const MultimodalInput: React.FC<MultimodalInputProps> = ({
  chatId,
  input,
  setInput,
  handleSubmit,
  isLoading,
  attachments,
  setAttachments,
}) => {
  const theme = useTheme();

  const onSubmit = () => {
    if (input.trim() && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <View style={styles.container}>
      <Surface
        style={[
          styles.inputContainer,
          { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.outline }
        ]}
        elevation={1}
      >
        <TextInput
          style={[
            styles.textInput,
            { color: theme.colors.onSurfaceVariant }
          ]}
          placeholder="Send a message..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={1000}
          onSubmitEditing={onSubmit}
          blurOnSubmit={false}
        />
        
        <View style={styles.actions}>
          <IconButton
            icon="send"
            size={20}
            iconColor={input.trim() && !isLoading ? theme.colors.primary : theme.colors.onSurfaceVariant}
            onPress={onSubmit}
            disabled={!input.trim() || isLoading}
            style={[
              styles.sendButton,
              { backgroundColor: input.trim() && !isLoading ? theme.colors.primary : theme.colors.surfaceVariant }
            ]}
          />
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButton: {
    margin: 0,
    borderRadius: 20,
    width: 36,
    height: 36,
  },
});