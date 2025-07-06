/* eslint-disable import/no-unresolved */
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import CustomDrawerContent from '~/components/CustomDrawerContent';
import { AuthProvider } from '~/contexts/AuthContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
              headerShown: false,
            }}>
            <Drawer.Screen
              name="(tabs)"
              options={{
                title: 'Home',
                headerShown: false,
              }}
            />
            <Drawer.Screen
              name="profile"
              options={{ title: 'Profile', headerShown: true }}
            />
            <Drawer.Screen
              name="login"
              options={{ title: 'Login', headerShown: true }}
            />
            <Drawer.Screen
              name="register"
              options={{ title: 'Register', headerShown: true }}
            />
            <Drawer.Screen
              name="admin"
              options={{
                title: 'Admin Panel',
                headerShown: false,
              }}
            />
          </Drawer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
