/* eslint-disable import/no-unresolved */
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
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
import { supabase } from '~/lib/subpabase';
import Avatar from './Avatar';
import ErrorToast from './toasts/ErrorToast';
import SuccessToast from './toasts/SuccessToast';

const registerSchema = z
  .object({
    displayName: z.string().min(1, 'Display name is required').trim(),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Email is invalid')
      .trim(),
    phone: z.string().min(10, 'Phone number must be at least 10 digits').trim(),
    address: z.string().min(1, 'Address is required').trim(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .min(1, 'Password is required'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('default.png');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName,
            phone: data.phone,
            address: data.address,
            avatar_url: avatarUrl,
          },
        },
      });

      if (authError) {
        setErrorMessage(authError.message);
        setShowErrorToast(true);
        return;
      }

      if (user) {
        setSuccessMessage(
          'Registration successful! Please check your email for confirmation.'
        );
        setShowSuccessToast(true);

        reset();
        setAvatarUrl('default.png');
      } else {
        setErrorMessage('Registration failed. Please try again.');
        setShowErrorToast(true);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred');
      setShowErrorToast(true);
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

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
              Create Account
            </Text>

            <Avatar
              size={120}
              url={avatarUrl}
              onUpload={(filePath: string) => setAvatarUrl(filePath)}
            />

            <View style={styles.formContainer}>
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
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Email"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={styles.input}
                      error={!!errors.email}
                      right={<TextInput.Icon icon="email" />}
                    />
                    <HelperText type="error" visible={!!errors.email}>
                      {errors.email?.message}
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

              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      secureTextEntry
                      style={styles.input}
                      error={!!errors.password}
                      right={<TextInput.Icon icon="lock" />}
                    />
                    <HelperText type="error" visible={!!errors.password}>
                      {errors.password?.message}
                    </HelperText>
                  </>
                )}
              />

              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <>
                    <TextInput
                      label="Confirm Password"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      mode="outlined"
                      secureTextEntry
                      style={styles.input}
                      error={!!errors.confirmPassword}
                      right={<TextInput.Icon icon="lock-check" />}
                    />
                    <HelperText type="error" visible={!!errors.confirmPassword}>
                      {errors.confirmPassword?.message}
                    </HelperText>
                  </>
                )}
              />

              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                disabled={loading}
                style={styles.button}>
                Create Account
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
});

export default RegisterForm;
