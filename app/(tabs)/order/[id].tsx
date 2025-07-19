/* eslint-disable import/no-unresolved */
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
import { Order } from '~/types/Order';
import { OrderItem } from '~/types/OrderItem';
import Product from '~/types/Product';
import { tableSourceMap } from '~/utils/tableSourceUtils';

const Page = () => {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
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
      setOrder(orderData as Order);

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);

      setItems(itemsError ? [] : (itemsData as OrderItem[]) || []);

      // Fetch product data for each item
      const productsData: Record<string, Product> = {};
      for (const item of itemsData || []) {
        const tableSource = item.part_type;
        const partId = item.part_id;
        if (tableSourceMap[tableSource]) {
          const { data: productData, error: productError } = await supabase
            .from(tableSourceMap[tableSource].table)
            .select('name, price, manufacturer, image_url')
            .eq('id', partId)
            .single();
          if (!productError && productData) {
            productsData[item.id] = productData as Product;
          }
        }
      }
      setProducts(productsData);
      setLoading(false);
    };
    if (id) fetchOrder();
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
});

export default Page;
