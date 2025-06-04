import { Stack } from 'expo-router';
import 'react-native-url-polyfill/auto';
import { AuthProvider } from '~/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile/index" options={{ title: 'Profile' }} />
      </Stack>
    </AuthProvider>
  );
}
