/* eslint-disable import/no-unresolved */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-url-polyfill/auto';
import Profile from '~/components/Profile';
import { useAuth } from '~/contexts/AuthContext';

export default function Index() {
  const router = useRouter();
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!session && !loading) {
      router.push('/');
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {session && <Profile session={session} />}
    </View>
  );
}
