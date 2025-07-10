import { Link } from 'expo-router';
import { Text, View } from 'react-native';

const NotAuthorize = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: 'red' }}>
        You are not authorized to view this page.
      </Text>
      <Link href="/" style={{ marginTop: 20, color: 'blue' }}>
        Go to Home
      </Link>
      <Link href="/login" style={{ marginTop: 20, color: 'blue' }}>
        Go to Login
      </Link>
    </View>
  );
};

export default NotAuthorize;
