/* eslint-disable import/no-unresolved */
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import BuilderItem from '~/components/BuilderItem';
import { useAuth } from '~/contexts/AuthContext';
import { supabase } from '~/lib/subpabase';
import { removeFromBuilder } from '~/utils/removeFromBuilder';
import { TableSourceKey, tableSourceMap } from '~/utils/tableSourceUtils';

const BuilderPage = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [builderData, setBuilderData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);

  const calculateTotalPrice = useCallback(async () => {
    try {
      const partIds = Object.values(builderData).filter(Boolean);
      if (partIds.length === 0) {
        setTotalPrice(0);
        return;
      }

      let total = 0;

      // Fetch prices for each part
      for (const [partType, partId] of Object.entries(builderData)) {
        if (partId) {
          const tableSource = partType.replace('_id', '') as TableSourceKey;
          const { data, error } = await supabase
            .from(tableSourceMap[tableSource].table)
            .select('price')
            .eq('id', partId)
            .single();

          if (!error && data?.price) {
            total += parseFloat(data.price);
          }
        }
      }

      setTotalPrice(total * 100);
    } catch (error) {
      console.error('Error calculating total price:', error);
    }
  }, [builderData]);

  const handleCheckout = async () => {
    try {
      const partIds = Object.values(builderData).filter(Boolean);
      if (partIds.length === 0) {
        Alert.alert(
          'Empty Builder',
          'Please add some parts to your build before checking out.'
        );
        return;
      }

      if (!session?.user?.id) {
        Alert.alert(
          'Authentication Error',
          'Please log in to continue with payment.'
        );
        return;
      }

      setProcessingPayment(true);

      // 1. Insert order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({ user_id: session.user.id })
        .select()
        .single();

      if (orderError || !order) {
        throw new Error(
          'Failed to create order: ' + (orderError?.message || 'Unknown error')
        );
      }

      // 2. Insert order_items for each part in builderData
      const orderItems = Object.entries(builderData)
        .filter(([_, partId]) => !!partId)
        .map(([partType, partId]) => ({
          order_id: order.id,
          part_type: partType.replace('_id', ''),
          part_id: partId,
          quantity: 1,
        }));

      if (orderItems.length > 0) {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);
        if (itemsError) {
          throw new Error(
            'Failed to create order items: ' + itemsError.message
          );
        }
      }

      // 3. Call vnpay-create-payment with orderId
      const { data: paymentData, error: paymentError } =
        await supabase.functions.invoke('vnpay-create-payment', {
          body: {
            amount: totalPrice,
            language: 'vn',
            orderInfo: `PC Build Order for ${session?.user.email}`,
            userId: session?.user.id,
            orderId: order.id,
          },
        });

      if (paymentError) {
        throw new Error('Failed to create payment: ' + paymentError.message);
      }

      if (paymentData?.success && paymentData?.data?.paymentUrl) {
        router.navigate({
          pathname: '/payment/vnpay' as any,
          params: {
            url: paymentData.data.paymentUrl,
            orderId: paymentData.data.orderId || order.id,
          },
        });
      } else {
        console.error('Invalid payment response:', paymentData);
        throw new Error('No payment URL received from VNPay');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert(
        'Payment Error',
        error instanceof Error ? error.message : 'Failed to process payment'
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchBuilderData = async () => {
        try {
          setLoading(true);
          // Fetch builder_id using user_id
          const { data: builderData, error: builderError } = await supabase
            .from('builder')
            .select('id')
            .eq('user_id', session?.user.id)
            .single();

          if (builderError || !builderData) {
            console.error('Error fetching builder_id:', builderError);
            return;
          }

          const builderId = builderData.id;

          // Fetch builder parts using builder_id
          const { data: builderPartsData, error: partsError } = await supabase
            .from('builder_parts')
            .select('part_type, part_id')
            .eq('builder_id', builderId);

          if (partsError) {
            console.error('Error fetching builder parts data:', partsError);
          } else {
            const formattedData: Record<string, string> =
              builderPartsData.reduce(
                (
                  acc: Record<string, string>,
                  part: { part_type: string; part_id: string }
                ) => {
                  acc[`${part.part_type}_id`] = part.part_id;
                  return acc;
                },
                {}
              );
            setBuilderData(formattedData);
          }
        } catch (err) {
          console.error('Unexpected error:', err);
        } finally {
          setLoading(false);
        }
      };

      if (session?.user.id) {
        fetchBuilderData();
      }
    }, [session?.user.id])
  );

  // Calculate total price when builderData changes
  useFocusEffect(
    useCallback(() => {
      if (Object.keys(builderData).length > 0) {
        calculateTotalPrice();
      }
    }, [builderData, calculateTotalPrice])
  );

  const handleRemoveFromBuilder = async (partType: string) => {
    try {
      setLoading(true);
      await removeFromBuilder(session?.user.id!, partType);
      setBuilderData((prevData) => {
        const updatedData = { ...prevData };
        delete updatedData[`${partType}_id`];
        return updatedData;
      });
    } catch (error) {
      console.error('Failed to remove part from builder:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading builder data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {Object.keys(tableSourceMap).map((key) => {
        const tableSource = key as TableSourceKey;
        const productId = builderData[`${tableSource}_id`];

        return (
          <View key={tableSource} style={styles.itemContainer}>
            <Text style={styles.itemTitle}>
              {tableSourceMap[tableSource].name}
            </Text>
            {productId ? (
              <BuilderItem
                productId={productId}
                tableSource={tableSource}
                onRemove={() => handleRemoveFromBuilder(tableSource)}
              />
            ) : (
              <Button
                mode="contained"
                onPress={() => {
                  router.push(`/search/${tableSource}`);
                }}
                style={styles.addButton}>
                Add {tableSourceMap[tableSource].productType}
              </Button>
            )}
          </View>
        );
      })}

      {/* Payment Summary Section */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalPrice}>
            {totalPrice.toLocaleString('vi-VN')} VND
          </Text>
        </View>

        <Button
          mode="contained"
          onPress={handleCheckout}
          disabled={
            processingPayment ||
            Object.values(builderData).filter(Boolean).length === 0
          }
          loading={processingPayment}
          style={styles.checkoutButton}
          contentStyle={styles.checkoutButtonContent}>
          {processingPayment ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </View>
    </ScrollView>
  );
};

export default BuilderPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  itemContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addButton: {
    marginTop: 10,
  },
  summaryContainer: {
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  checkoutButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
  },
  checkoutButtonContent: {
    paddingVertical: 8,
  },
});
