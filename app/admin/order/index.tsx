import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '~/lib/supabase';

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];

const AdminOrderPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('order_with_payment')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        setOrders([]);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  // Helper to update order status
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setLoading(true);
    await supabase
      .from('orders') // <-- changed from 'order' to 'orders'
      .update({ status: newStatus })
      .eq('id', orderId);
    // Refresh orders
    const { data, error } = await supabase
      .from('order_with_payment')
      .select('*')
      .order('created_at', { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (!orders.length) {
    return (
      <View style={styles.center}>
        <Text>No orders found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell]}>Order ID</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>User ID</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Status</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>
              Payment Amount
            </Text>
            <Text style={[styles.tableCell, styles.headerCell]}>
              Payment Status
            </Text>
          </View>
          {orders.map((order) => (
            <View key={order.id} style={styles.tableRow}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => router.push(`/admin/order/${order.id}`)}
                activeOpacity={0.7}>
                <Text style={styles.tableCell}>#{order.id}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => router.push(`/admin/order/${order.id}`)}
                activeOpacity={0.7}>
                <Text style={styles.tableCell}>{order.user_id}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => router.push(`/admin/order/${order.id}`)}
                activeOpacity={0.7}>
                <Text style={styles.tableCell}>
                  {new Date(order.created_at).toLocaleString()}
                </Text>
              </TouchableOpacity>
              <View style={styles.tableCell}>
                <Picker
                  selectedValue={order.status || 'pending'}
                  style={styles.picker}
                  onValueChange={(value) => handleStatusChange(order.id, value)}
                  mode="dropdown">
                  {STATUS_OPTIONS.map((status) => (
                    <Picker.Item key={status} label={status} value={status} />
                  ))}
                </Picker>
              </View>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => router.push(`/admin/order/${order.id}`)}
                activeOpacity={0.7}>
                <Text style={styles.tableCell}>
                  {order.payment_amount != null ? order.payment_amount : '-'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => router.push(`/admin/order/${order.id}`)}
                activeOpacity={0.7}>
                <Text style={styles.tableCell}>
                  {order.payment_status || '-'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#eee',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  picker: {
    height: 30,
    width: '100%',
    fontSize: 14,
  },
});

export default AdminOrderPage;
