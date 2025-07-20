import { zodResolver } from '@hookform/resolvers/zod';
import { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, Card, HelperText, Text, TextInput } from 'react-native-paper';
import { z } from 'zod';
import { supabase } from '~/lib/supabase';
import Avatar from './Avatar';
import ErrorToast from './toasts/ErrorToast';
import SuccessToast from './toasts/SuccessToast';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').trim(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').trim(),
  address: z.string().min(1, 'Address is required').trim(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('default.png');

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      phone: '',
      address: '',
    },
  });

  useEffect(() => {
    let ignore = false;
    const getProfile = async () => {
      setLoading(true);
      const { user } = session;

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('phone, address, avatar_url')
          .eq('id', user.id)
          .single();

        if (!ignore) {
          if (profileError) {
            console.warn('Profile error:', profileError);
            setErrorMessage('Failed to load profile data');
            setShowErrorToast(true);
          } else if (profileData) {
            setValue('phone', profileData.phone || '');
            setValue('address', profileData.address || '');
            setAvatarUrl(profileData.avatar_url || 'default.png');
          }

          // display name is in auth metadata
          setValue('displayName', user.user_metadata?.display_name || '');
        }
      } catch (error) {
        if (!ignore) {
          console.error('Error loading profile:', error);
          setErrorMessage('Failed to load profile');
          setShowErrorToast(true);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    getProfile();
    return () => {
      ignore = true;
    };
  }, [session, setValue]);

  const onSubmit = async (data: ProfileFormData) => {
    setUpdating(true);
    try {
      if (!session?.user) {
        throw new Error('No user session found');
      }

      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: data.displayName },
      });

      if (authError) {
        throw authError;
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: data.phone,
          address: data.address,
          avatar_url: avatarUrl,
          updated_at: new Date(),
        })
        .eq('id', session.user.id);

      if (profileError) {
        throw profileError;
      }

      setSuccessMessage('Profile updated successfully!');
      setShowSuccessToast(true);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred');
      }
      setShowErrorToast(true);
      console.error('Error updating profile:', error);
    } finally {
      setUpdating(false);
    }
  };

  const signOut = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setErrorMessage(error.message);
        setShowErrorToast(true);
      }
    } catch (error) {
      setErrorMessage('Error signing out');
      setShowErrorToast(true);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SuccessToast
        message={successMessage}
        showToast={showSuccessToast}
        setShowToast={setShowSuccessToast}
      />
      <ErrorToast
        message={errorMessage}
        showToast={showErrorToast}
        setShowToast={setShowErrorToast}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              My Profile
            </Text>

            <Avatar
              size={120}
              url={avatarUrl}
              onUpload={(filePath: string) => setAvatarUrl(filePath)}
            />

            <View style={styles.formContainer}>
              <TextInput
                label="Email"
                value={session.user?.email || ''}
                mode="outlined"
                disabled
                style={styles.input}
                right={<TextInput.Icon icon="email" />}
              />
              <HelperText type="info" visible>
                Email cannot be changed
              </HelperText>

              <Controller
                control={control}
                name="displayName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Display Name"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      style={styles.input}
                      error={!!errors.displayName}
                      right={<TextInput.Icon icon="account" />}
                    />
                    <HelperText type="error" visible={!!errors.displayName}>
                      {errors.displayName?.message}
                    </HelperText>
                  </>
                )}
              />

              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Phone"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      keyboardType="phone-pad"
                      placeholder="0901234567"
                      style={styles.input}
                      error={!!errors.phone}
                      right={<TextInput.Icon icon="phone" />}
                    />
                    <HelperText type="error" visible={!!errors.phone}>
                      {errors.phone?.message}
                    </HelperText>
                  </>
                )}
              />

              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Address"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      style={styles.input}
                      error={!!errors.address}
                      right={<TextInput.Icon icon="map-marker" />}
                    />
                    <HelperText type="error" visible={!!errors.address}>
                      {errors.address?.message}
                    </HelperText>
                  </>
                )}
              />

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={updating}
                disabled={updating}
                style={styles.button}>
                Update Profile
              </Button>

              <Button
                mode="outlined"
                onPress={signOut}
                disabled={updating}
                style={styles.signOutButton}>
                Sign Out
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginTop: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    gap: 8,
  },
  input: {
    marginBottom: 4,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
  },
  signOutButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
});
