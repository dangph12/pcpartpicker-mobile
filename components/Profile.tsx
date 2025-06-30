/* eslint-disable import/no-unresolved */
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { supabase } from '~/lib/subpabase';
import Avatar from './Avatar';

export default function Profile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    let ignore = false;
    const getProfile = async () => {
      setLoading(true);
      const { user } = session;
      const { data, error } = await supabase
        .from('profiles')
        .select(`username, avatar_url`)
        .eq('id', user.id)
        .single();

      if (!ignore) {
        if (error) {
          console.warn(error);
        } else if (data) {
          setUsername(data.username || '');
          setAvatarUrl(data.avatar_url || '');
        }
      }
      setLoading(false);
    };
    getProfile();
    return () => {
      ignore = true;
    };
  }, [session]);
  const updateProfile = async ({
    username,
    avatarUrl,
  }: {
    username: string;
    avatarUrl: string;
  }) => {
    try {
      setLoading(true);
      if (!session?.user) {
        throw new Error('No user session found');
      }
      const updates = {
        id: session.user.id,
        username,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };
      const { error } = await supabase.from('profiles').upsert(updates);
      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error updating profile:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert(error.message);
    }
    setLoading(false);
  };
  return (
    <View style={styles.container}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Avatar
          size={200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ username, avatarUrl: url });
          }}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <TextInput label="Email" value={session.user?.email || ''} disabled />
      </View>
      <View style={styles.verticallySpaced}>
        <TextInput
          label="Username"
          value={username || ''}
          onChangeText={(text) => setUsername(text)}
        />
      </View>
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          onPress={() => updateProfile({ username, avatarUrl })}
          disabled={loading}>
          {loading ? 'Loading...' : 'Update Profile'}
        </Button>
      </View>
      <View style={styles.verticallySpaced}>
        <Button onPress={() => signOut()} disabled={loading}>
          {loading ? 'Loading...' : 'Sign Out'}
        </Button>
      </View>
    </View>
  );
}

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
