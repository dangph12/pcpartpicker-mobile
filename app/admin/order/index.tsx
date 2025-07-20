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
          <TouchableOpacity
            key={order.id}
            style={styles.tableRow}
            onPress={() => router.push(`/admin/order/${order.id}`)}>
            <Text style={styles.tableCell}>#{order.id}</Text>
            <Text style={styles.tableCell}>{order.user_id}</Text>
            <Text style={styles.tableCell}>
              {new Date(order.created_at).toLocaleString()}
            </Text>
            <Text style={styles.tableCell}>{order.status || 'Pending'}</Text>
            <Text style={styles.tableCell}>
              {order.payment_amount != null ? order.payment_amount : '-'}
            </Text>
            <Text style={styles.tableCell}>{order.payment_status || '-'}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
});

export default AdminOrderPage;
