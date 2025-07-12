import { DrawerToggleButton } from '@react-navigation/drawer';
import { Stack } from 'expo-router';
export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => <DrawerToggleButton />,
      }}>
      <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
      <Stack.Screen name="users" options={{ title: 'User Management' }} />
    </Stack>
  );
}
