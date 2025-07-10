/* eslint-disable import/no-unresolved */
import { ActivityIndicator, View } from 'react-native';
import 'react-native-url-polyfill/auto';
import NotAuthorize from '~/components/NotAuthorize';
import Profile from '~/components/Profile';
import { useAuth } from '~/contexts/AuthContext';

export default function Index() {
  const { session, loading } = useAuth();

  if (!session && !loading) {
    return <NotAuthorize />;
  }

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
