import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Text } from 'react-native-paper';

interface MarkdownProps {
  children: string;
  style?: StyleProp<TextStyle>;
}

export const Markdown: React.FC<MarkdownProps> = ({ children, style }) => {
  // Simple markdown rendering - just display as text for now
  // In a full implementation, you'd use react-native-markdown-display
  return (
    <Text style={style}>
      {children}
    </Text>
  );
};