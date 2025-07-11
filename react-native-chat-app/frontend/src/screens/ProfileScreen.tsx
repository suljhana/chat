import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  Title,
  Text,
  Button,
  Card,
  List,
  Divider,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

export const ProfileScreen = () => {
  const { user, logout } = useAuth();
  const { isConnected } = useChat();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Profile</Title>
      </View>

      <Card style={styles.profileCard}>
        <Card.Content>
          <Title style={styles.userEmail}>{user?.email}</Title>
          <Text style={styles.userLabel}>Account Email</Text>
        </Card.Content>
      </Card>

      <Card style={styles.statusCard}>
        <Card.Content>
          <List.Item
            title="Connection Status"
            description={isConnected ? 'Connected to chat server' : 'Disconnected'}
            left={(props) => (
              <List.Icon
                {...props}
                icon={isConnected ? 'wifi' : 'wifi-off'}
                color={isConnected ? '#4CAF50' : '#F44336'}
              />
            )}
          />
        </Card.Content>
      </Card>

      <Card style={styles.settingsCard}>
        <Card.Content>
          <List.Item
            title="App Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="About"
            description="AI Chat App - React Native Version"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#F44336"
          textColor="white"
        >
          Logout
        </Button>
      </View>
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
  profileCard: {
    margin: 20,
    marginBottom: 16,
    elevation: 2,
  },
  userEmail: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    elevation: 2,
  },
  settingsCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    elevation: 2,
  },
  buttonContainer: {
    paddingHorizontal: 20,
  },
  logoutButton: {
    paddingVertical: 8,
  },
});