/* eslint-disable import/no-unresolved */
import { Stack } from 'expo-router';
import 'react-native-url-polyfill/auto';
import { AuthProvider } from '~/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
