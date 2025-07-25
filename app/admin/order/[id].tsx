import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { supabase } from '~/lib/supabase';
import { tableSourceMap } from '~/utils/tableSourceUtils';

const AdminOrderDetail = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [products, setProducts] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderAndItems = async () => {
      setLoading(true);
      // Fetch order with payment info
      const { data: orderData, error: orderError } = await supabase
        .from('order_with_payment')
        .select('*')
        .eq('id', id)
        .single();
      if (orderError || !orderData) {
        setOrder(null);
        setItems([]);
        setProducts({});
        setLoading(false);
        return;
      }
      setOrder(orderData);

      // Fetch order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);
      const orderItems = itemsError ? [] : itemsData || [];
      setItems(orderItems);

      // Fetch product info for each item
      const productsData: Record<string, any> = {};
      for (const item of orderItems) {
        // Use tableSourceMap from utils
        const tableSource = Object.values(tableSourceMap).find(
          (src) =>
            src.productType.toLowerCase() === item.part_type.toLowerCase() ||
            src.table === item.part_type ||
            src.id === item.part_type
        );
        const partId = item.part_id;
        if (tableSource) {
          const { data: productData, error: productError } = await supabase
            .from(tableSource.table)
            .select('name, price, manufacturer, image_url')
            .eq('id', partId)
            .single();
          if (!productError && productData) {
            productsData[item.id] = productData;
          }
        }
      }
      setProducts(productsData);
      setLoading(false);
    };
    if (id) fetchOrderAndItems();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text>Order not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.orderCard}>
        <Text style={styles.orderId}>Order #{order.id}</Text>
        <Text>Date: {new Date(order.created_at).toLocaleString()}</Text>
        <Text>Status: {order.status || 'Pending'}</Text>
        <Text>
          Payment Amount:{' '}
          <Text style={styles.value}>
            {order.payment_amount != null ? order.payment_amount : '-'}
          </Text>
        </Text>
        <Text>
          Payment Status:{' '}
          <Text style={styles.value}>{order.payment_status || '-'}</Text>
        </Text>
      </View>
      <Text style={styles.itemsTitle}>Order Items:</Text>
      {items.length === 0 ? (
        <Text>No items found for this order.</Text>
      ) : (
        items.map((item) => {
          const product = products[item.id];
          return (
            <View key={item.id} style={styles.itemCard}>
              {product ? (
                <View style={styles.productCard}>
                  {product.image_url ? (
                    <Image
                      source={{ uri: product.image_url }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : null}
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {product.name}
                    </Text>
                    <Text style={styles.productPrice}>
                      ${product.price?.toLocaleString() || 'N/A'}
                    </Text>
                    <Text style={styles.manufacturer}>
                      Manufacturer: {product.manufacturer}
                    </Text>
                    <Text style={styles.partType}>Type: {item.part_type}</Text>
                    <Text style={styles.quantity}>
                      Quantity: {item.quantity}
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={{ color: '#999' }}>Product info not found</Text>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderCard: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderId: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
  itemsTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  itemCard: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 6,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  manufacturer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  partType: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  quantity: {
    fontSize: 14,
    color: '#444',
    marginBottom: 2,
  },
  value: {
    fontWeight: 'normal',
  },
});

export default AdminOrderDetail;
