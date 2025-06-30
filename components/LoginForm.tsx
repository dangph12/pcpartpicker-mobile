/* eslint-disable import/no-unresolved */
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { supabase } from '~/lib/subpabase';

const LoginForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signInWithEmail = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      console.log(email, password);
      console.error('Error signing in:', error);
      Alert.alert(error.message);
    }
    setLoading(false);
    if (!error) {
      router.push('/profile');
    }
  };

  return (
    <View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={(email) => setEmail(email)}
          placeholder="email@address.com"
          autoCapitalize="none"
          right={<TextInput.Icon icon="email" />}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput
          label="Password"
          value={password}
          onChangeText={(password) => setPassword(password)}
          placeholder="Password"
          autoCapitalize="none"
          secureTextEntry
          right={<TextInput.Icon icon="lock" />}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button disabled={loading} onPress={() => signInWithEmail()}>
          Login
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
  },
});

export default LoginForm;
