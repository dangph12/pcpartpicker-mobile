import { useLocalSearchParams, useRouter } from 'expo-router';
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

const AdminProfileDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profile_with_email')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    if (id) fetchProfile();
  }, [id]);

  useEffect(() => {
    const fetchOrders = async () => {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });
      if (error) {
        setOrders([]);
      } else {
        setOrders(data || []);
      }
      setOrdersLoading(false);
    };
    if (id) fetchOrders();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text>Profile not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Details */}
      <Text style={styles.title}>Profile Detail</Text>
      <Text style={styles.label}>
        User ID: <Text style={styles.value}>{profile.id}</Text>
      </Text>
      <Text style={styles.label}>
        Display Name:{' '}
        <Text style={styles.value}>{profile.display_name || '-'}</Text>
      </Text>
      <Text style={styles.label}>
        Address: <Text style={styles.value}>{profile.address || '-'}</Text>
      </Text>
      <Text style={styles.label}>
        Email: <Text style={styles.value}>{profile.user_email || '-'}</Text>
      </Text>
      <Text style={styles.label}>
        Updated At:{' '}
        <Text style={styles.value}>
          {profile.updated_at
            ? new Date(profile.updated_at).toLocaleString()
            : '-'}
        </Text>
      </Text>

      {/* User Orders */}
      <Text style={[styles.title, { marginTop: 32 }]}>Orders</Text>
      {ordersLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" />
          <Text>Loading orders...</Text>
        </View>
      ) : !orders.length ? (
        <Text>No orders found for this user.</Text>
      ) : (
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerCell]}>Order ID</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Date</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Status</Text>
          </View>
          {orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.tableRow}
              onPress={() => router.push(`/admin/order/${order.id}`)}>
              <Text style={styles.tableCell}>#{order.id}</Text>
              <Text style={styles.tableCell}>
                {new Date(order.created_at).toLocaleString()}
              </Text>
              <Text style={styles.tableCell}>{order.status || 'Pending'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontWeight: 'bold', marginTop: 10 },
  value: { fontWeight: 'normal' },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
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

export default AdminProfileDetail;
