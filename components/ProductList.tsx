/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import Loading from '~/components/Loading';
import Pagination from '~/components/Pagination';
import { supabase } from '~/lib/subpabase';
import Product from '~/types/Product';
import ProductItem from './ProductItem';
import ErrorToast from './toasts/ErrorToast';

const ProductList = ({ tableSource }: { tableSource: string }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const LIMIT = 20;

  const fetchProducts = async (tableSource: string, page: number = 1) => {
    try {
      setLoading(true);

      // First, get the total count
      const { count, error: countError } = await supabase
        .from(tableSource)
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error fetching count:', countError);
        setErrorMessage('Failed to load products count. Please try again.');
        setShowErrorToast(true);
        return;
      }

      const totalItems = count || 0;
      setTotalPages(Math.ceil(totalItems / LIMIT));

      // Then fetch the products for current page
      const offset = (page - 1) * LIMIT;
      const { data, error } = await supabase
        .from(tableSource)
        .select('id, name, image_url, price, manufacturer')
        .range(offset, offset + LIMIT - 1);

      if (error) {
        console.error('Error fetching products:', error);
        setErrorMessage('Failed to load products. Please try again.');
        setShowErrorToast(true);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An unexpected error occurred while loading products.');
      setShowErrorToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(tableSource, page);
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchProducts(tableSource, 1);
  }, [tableSource]);

  if (loading) {
    return <Loading />;
  }

  return (
    <View style={styles.container}>
      <ErrorToast
        message={errorMessage}
        showToast={showErrorToast}
        setShowToast={setShowErrorToast}
      />
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
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
