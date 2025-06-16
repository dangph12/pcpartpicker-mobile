/* eslint-disable import/no-unresolved */
import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Loading from '~/components/Loading';
import { supabase } from '~/lib/subpabase';
import Product from '~/types/Product';
import { convertTableSource } from '~/utils/convertTableSource';
import ProductItem from './ProductItem';

const ProductList = ({ tableSource }: { tableSource: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from(tableSource)
        .select('id, name, image_url, price, manufacturer')
        .limit(20);

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderItem = ({ item, index }: { item: Product; index: number }) => {
    if (index === products.length) {
      return (
        <TouchableOpacity style={styles.showAllCard}>
          <Link
            href={{ pathname: '/search', params: { category: tableSource } }}>
            <Text style={styles.showAllText}>Show All</Text>
          </Link>
        </TouchableOpacity>
      );
    }
    return <ProductItem item={item} />;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <View style={{ padding: 10 }}>
        <Link
          href={{ pathname: '/search', params: { category: tableSource } }}
          style={styles.header}>
          <Text>{convertTableSource(tableSource)}</Text>
          <Text style={{ marginLeft: 'auto', color: 'blue' }}>
            See All &gt;
          </Text>
        </Link>
      </View>
      <FlatList
        data={[...products, {} as Product]} // Add empty object for "Show All" item
        renderItem={renderItem}
        keyExtractor={(item, index) =>
          index === products.length ? 'show-all' : item.id
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'baseline',
    fontSize: 18,
    color: 'blue',
  },
  showAllCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    width: 150,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  showAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
