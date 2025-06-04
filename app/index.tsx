import { router } from 'expo-router';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

const Index = () => {
  return (
    <View>
      <Button mode="contained" onPress={() => router.push('/login')}>
        Go to Login
      </Button>
      <Button mode="contained" onPress={() => router.push('/profile')}>
        Go to Profile
      </Button>
    </View>
  );
};

export default Index;
