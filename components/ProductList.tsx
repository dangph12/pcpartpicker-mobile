/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import Loading from '~/components/Loading';
import Pagination from '~/components/Pagination';
import ProductFilter, { FilterOptions } from '~/components/ProductFilter';
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
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});

  const LIMIT = 20;

  const fetchProducts = async (
    tableSource: string,
    page: number = 1,
    filterOptions: FilterOptions = {}
  ) => {
    try {
      setLoading(true);

      // Build the query with filters
      let countQuery = supabase
        .from(tableSource)
        .select('*', { count: 'exact', head: true });
      let dataQuery = supabase
        .from(tableSource)
        .select('id, name, image_url, price, manufacturer');

      // Apply name filter
      if (filterOptions.searchName) {
        const nameFilter = `%${filterOptions.searchName}%`;
        countQuery = countQuery.ilike('name', nameFilter);
        dataQuery = dataQuery.ilike('name', nameFilter);
      }

      // Apply manufacturer filter
      if (filterOptions.manufacturer) {
        countQuery = countQuery.eq('manufacturer', filterOptions.manufacturer);
        dataQuery = dataQuery.eq('manufacturer', filterOptions.manufacturer);
      }

      // Apply price range filters
      if (filterOptions.priceRanges && filterOptions.priceRanges.length > 0) {
        // Build individual conditions for each price range
        const orConditions: string[] = [];

        filterOptions.priceRanges.forEach((range) => {
          switch (range) {
            case '0-100':
              orConditions.push('and(price.gte.0,price.lte.100)');
              break;
            case '100-200':
              orConditions.push('and(price.gt.100,price.lte.200)');
              break;
            case '200-300':
              orConditions.push('and(price.gt.200,price.lte.300)');
              break;
            case '300+':
              orConditions.push('price.gt.300');
              break;
          }
        });

        if (orConditions.length > 0) {
          const priceFilter = orConditions.join(',');
          countQuery = countQuery.or(priceFilter);
          dataQuery = dataQuery.or(priceFilter);
        }
      }

      // First, get the total count
      const { count, error: countError } = await countQuery;

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
      const { data, error } = await dataQuery.range(offset, offset + LIMIT - 1);

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
    fetchProducts(tableSource, page, filters);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
    fetchProducts(tableSource, 1, newFilters);
  };

  const handleOpenFilter = () => {
    setShowFilter(true);
  };

  const handleCloseFilter = () => {
    setShowFilter(false);
  };

  useEffect(() => {
    setCurrentPage(1);
    setFilters({});
    fetchProducts(tableSource, 1, {});
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

      {/* Filter Button */}
      <View style={styles.filterContainer}>
        <Button
          mode="outlined"
          onPress={handleOpenFilter}
          icon="filter"
          style={styles.filterButton}>
          Filter
        </Button>
      </View>

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

      {/* Filter Modal */}
      <Modal
        visible={showFilter}
        animationType="slide"
        presentationStyle="pageSheet">
        <ProductFilter
          tableSource={tableSource}
          onFilterChange={handleFilterChange}
          onClose={handleCloseFilter}
        />
      </Modal>
    </View>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  filterButton: {
    alignSelf: 'flex-end',
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
