/* eslint-disable import/no-unresolved */
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import LoginForm from '~/components/LoginForm';

const Index = () => {
  return (
    <View style={styles.container}>
      <LoginForm />
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button>
          <Link href="/register">Register</Link>
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});

export default Index;
