import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Surface } from 'react-native-paper';

interface SuggestedActionsProps {
  onActionPress: (action: string) => void;
}

interface SuggestedAction {
  title: string;
  description: string;
  action: string;
}

const suggestedActions: SuggestedAction[] = [
  {
    title: 'Write a creative story',
    description: 'about a time traveler',
    action: 'Write a creative story about a time traveler who discovers they can only travel to moments of great historical significance.',
  },
  {
    title: 'Explain quantum physics',
    description: 'in simple terms',
    action: 'Explain quantum physics concepts like superposition and entanglement in simple terms that anyone can understand.',
  },
  {
    title: 'Plan a healthy meal',
    description: 'for the week',
    action: 'Create a healthy meal plan for the week that includes breakfast, lunch, and dinner with balanced nutrition.',
  },
  {
    title: 'Debug this code',
    description: 'and explain the issue',
    action: 'Help me debug a JavaScript function that is supposed to calculate the average of an array but returns NaN.',
  },
];

export const SuggestedActions: React.FC<SuggestedActionsProps> = ({ onActionPress }) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {suggestedActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => onActionPress(action.action)}
            activeOpacity={0.7}
          >
            <Surface
              style={[
                styles.actionCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }
              ]}
              elevation={1}
            >
              <Text
                variant="titleMedium"
                style={[styles.actionTitle, { color: theme.colors.onSurface }]}
                numberOfLines={2}
              >
                {action.title}
              </Text>
              <Text
                variant="bodyMedium"
                style={[styles.actionDescription, { color: theme.colors.onSurfaceVariant }]}
                numberOfLines={2}
              >
                {action.description}
              </Text>
            </Surface>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  actionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 80,
  },
  actionTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  actionDescription: {
    lineHeight: 18,
  },
});