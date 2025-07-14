import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button, Card, Divider } from 'react-native-paper';
import { useAuth } from '~/contexts/AuthContext';
import { supabase } from '~/lib/subpabase';

interface PaymentResult {
  success: boolean;
  orderId: string;
  amount: number;
  responseCode: string;
  message: string;
  transactionDate: string;
  bankCode?: string;
  cardType?: string;
}

const PaymentReturnPage = () => {
  const router = useRouter();
  const { session } = useAuth();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const processPaymentReturn = useCallback(async () => {
    try {
      setLoading(true);

      if (params && Object.keys(params).length > 0) {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value && typeof value === 'string') {
            queryParams.append(key, value);
          } else if (Array.isArray(value) && value.length > 0) {
            queryParams.append(key, value[0]);
          }
        });

        let supabaseUrl =
          Constants?.expoConfig?.extra?.supabaseUrl ||
          Constants?.manifest?.extra?.supabaseUrl ||
          process.env.EXPO_PUBLIC_SUPABASE_URL ||
          (supabase as any)?.url;
        let anonKey =
          Constants?.expoConfig?.extra?.supabaseAnonKey ||
          Constants?.manifest?.extra?.supabaseAnonKey ||
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
          (supabase as any)?.auth?.anonKey;

        if (typeof window !== 'undefined') {
          supabaseUrl = supabaseUrl || (window as any).EXPO_PUBLIC_SUPABASE_URL;
          anonKey = anonKey || (window as any).EXPO_PUBLIC_SUPABASE_ANON_KEY;
        }
        if (!supabaseUrl || !anonKey) {
          setError('Supabase URL or anon key is missing.');
          setLoading(false);
          return;
        }
        const edgeUrl = `${supabaseUrl}/functions/v1/vnpay-return?${queryParams.toString()}`;

        let response;
        try {
          response = await fetch(edgeUrl, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${anonKey}`,
            },
          });
        } catch (fetchErr) {
          setError('Network error calling payment validation service.');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const text = await response.text();
          setError(`VNPay validation failed: ${response.status} ${text}`);
          setLoading(false);
          return;
        }

        let vnpayResult;
        try {
          vnpayResult = await response.json();
        } catch (jsonErr) {
          setError('Invalid response from payment validation service.');
          setLoading(false);
          return;
        }

        if (vnpayResult) {
          let paymentData = null;
          if (vnpayResult.orderId) {
            const { data: payment } = await supabase
              .from('payments')
              .select('*')
              .eq('order_id', vnpayResult.orderId)
              .single();
            paymentData = payment;
          }

          setPaymentResult({
            success: vnpayResult.success || false,
            orderId: vnpayResult.orderId || '',
            amount: vnpayResult.amount || 0,
            responseCode: vnpayResult.responseCode || '',
            message:
              vnpayResult.message ||
              (vnpayResult.success ? 'Payment successful' : 'Payment failed'),
            transactionDate:
              paymentData?.updated_at ||
              paymentData?.created_at ||
              new Date().toISOString(),
            bankCode: paymentData?.vnpay_response?.vnp_BankCode,
            cardType: paymentData?.vnpay_response?.vnp_CardType,
          });
        } else {
          throw new Error('No response from VNPay validation service');
        }
      } else {
        const { data: latestPayment, error: paymentError } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', session?.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (paymentError || !latestPayment) {
          throw new Error('No payment information found');
        }

        setPaymentResult({
          success: latestPayment.status === 'completed',
          orderId: latestPayment.order_id,
          amount: parseFloat(latestPayment.amount),
          responseCode: latestPayment.vnpay_response?.vnp_ResponseCode || '',
          message:
            latestPayment.status === 'completed'
              ? 'Payment successful'
              : 'Payment failed',
          transactionDate: latestPayment.updated_at || latestPayment.created_at,
          bankCode: latestPayment.vnpay_response?.vnp_BankCode,
          cardType: latestPayment.vnpay_response?.vnp_CardType,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (session?.user.id) {
      processPaymentReturn();
    }
  }, []);

  const handleContinueShopping = () => {
    router.replace('/(tabs)/builder');
  };

  const handleViewOrders = () => {
    router.push('/(tabs)/builder' as any);
  };

  const getStatusColor = (success: boolean) => {
    return success ? '#4CAF50' : '#f44336';
  };

  const getStatusIcon = (success: boolean) => {
    return success ? '✅' : '❌';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Processing payment result...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Payment Processing Error</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Button
          mode="contained"
          onPress={handleContinueShopping}
          style={styles.button}>
          Return to Builder
        </Button>
      </View>
    );
  }

  if (!paymentResult) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Payment Information</Text>
        <Text style={styles.errorText}>
          Unable to retrieve payment information.
        </Text>
        <Button
          mode="contained"
          onPress={handleContinueShopping}
          style={styles.button}>
          Return to Builder
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.resultCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Text style={styles.statusIcon}>
              {getStatusIcon(paymentResult.success)}
            </Text>
            <Text
              style={[
                styles.statusTitle,
                { color: getStatusColor(paymentResult.success) },
              ]}>
              {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
            </Text>
          </View>

          <Text style={styles.statusMessage}>{paymentResult.message}</Text>

          <Divider style={styles.divider} />

          <View style={styles.detailsContainer}>
            <Text style={styles.sectionTitle}>Payment Details</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID:</Text>
              <Text style={styles.detailValue}>{paymentResult.orderId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>
                {paymentResult.amount.toLocaleString('vi-VN')} VND
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Response Code:</Text>
              <Text style={styles.detailValue}>
                {paymentResult.responseCode}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Transaction Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(paymentResult.transactionDate).toLocaleString(
                  'vi-VN'
                )}
              </Text>
            </View>

            {paymentResult.bankCode && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bank:</Text>
                <Text style={styles.detailValue}>{paymentResult.bankCode}</Text>
              </View>
            )}

            {paymentResult.cardType && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Card Type:</Text>
                <Text style={styles.detailValue}>{paymentResult.cardType}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      <View style={styles.actionContainer}>
        {paymentResult.success ? (
          <>
            <Button
              mode="contained"
              onPress={handleViewOrders}
              style={[styles.button, styles.primaryButton]}>
              View My Orders
            </Button>
            <Button
              mode="outlined"
              onPress={handleContinueShopping}
              style={styles.button}>
              Continue Shopping
            </Button>
          </>
        ) : (
          <>
            <Button
              mode="contained"
              onPress={handleContinueShopping}
              style={[styles.button, styles.primaryButton]}>
              Try Again
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                Alert.alert(
                  'Contact Support',
                  'If you continue to experience issues, please contact our support team.',
                  [{ text: 'OK' }]
                );
              }}
              style={styles.button}>
              Contact Support
            </Button>
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default PaymentReturnPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultCard: {
    marginBottom: 24,
    elevation: 4,
  },
  statusHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  divider: {
    marginVertical: 16,
  },
  detailsContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  actionContainer: {
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
});
