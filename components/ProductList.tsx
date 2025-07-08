/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Loading from '~/components/Loading';
import { supabase } from '~/lib/subpabase';
import Product from '~/types/Product';
import ProductItem from './ProductItem';

const ProductList = ({ tableSource }: { tableSource: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (tableSource: string) => {
    try {
      setLoading(true);
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
    fetchProducts(tableSource);
  }, [tableSource]);

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductItem item={item} tableSource={tableSource} />
        )}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
      />
    </View>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  flatList: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 5,
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
