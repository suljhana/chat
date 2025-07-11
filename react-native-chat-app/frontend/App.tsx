import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ChatProvider } from './src/contexts/ChatContext';
import { theme } from './src/theme';
import ChatScreen from './src/screens/ChatScreen';
import SidebarContent from './src/components/SidebarContent';

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <ChatProvider>
          <NavigationContainer>
            <Drawer.Navigator
              id="MainDrawer"
              drawerContent={(props) => <SidebarContent {...props} />}
              screenOptions={{
                headerShown: false,
                drawerType: 'slide',
                drawerStyle: {
                  backgroundColor: theme.colors.surface,
                  width: 280,
                },
                swipeEnabled: true,
                swipeEdgeWidth: 50,
              }}
            >
              <Drawer.Screen name="Chat" component={ChatScreen} />
            </Drawer.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </ChatProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}