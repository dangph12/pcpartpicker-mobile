import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Loading from '~/components/Loading';
import { supabase } from '~/lib/supabase';
import Case from '~/types/Case';
import Cpu from '~/types/Cpu';
import CpuCooler from '~/types/CpuCooler';
import Gpu from '~/types/Gpu';
import Memory from '~/types/Memory';
import Motherboard from '~/types/Motherboard';
import PowerSupply from '~/types/PowerSupplies';
import Storage from '~/types/Storage';
import { formatSpecLabel } from '~/utils/formatSpecLabel';
import { TableSourceKey, tableSourceMap } from '~/utils/tableSourceUtils';
import ErrorToast from './toasts/ErrorToast';

type ProductType =
  | Case
  | Cpu
  | CpuCooler
  | Gpu
  | Memory
  | Motherboard
  | PowerSupply
  | Storage;

const ProductDetail = ({
  tableSource,
  id,
}: {
  tableSource: string;
  id: string;
}) => {
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchProductDetail = async () => {
    if (!tableSource || !id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(tableSource)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product detail:', error);
        setErrorMessage('Failed to load product details');
        setShowErrorToast(true);
      } else {
        setProduct(data);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('An unexpected error occurred');
      setShowErrorToast(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableSource, id]);

  // convert tableSource to interface in types
  const sourceInfo = tableSourceMap[tableSource as TableSourceKey];

  if (loading) {
    return <Loading />;
  }

  if (!product || !sourceInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  const renderProductSpecs = () => {
    const excludeKeys = [
      'id',
      'name',
      'image_url',
      'price',
      'manufacturer',
      'product_url',
    ];
    const specs = Object.entries(product).filter(
      ([key, value]) =>
        !excludeKeys.includes(key) && value !== null && value !== ''
    );

    return specs.map(([key, value]) => (
      <View key={key} style={styles.specRow}>
        <Text style={styles.specLabel}>{formatSpecLabel(key)}:</Text>
        <Text style={styles.specValue}>{String(value)}</Text>
      </View>
    ));
  };

  return (
    <ScrollView style={styles.container}>
      <ErrorToast
        message={errorMessage}
        showToast={showErrorToast}
        setShowToast={setShowErrorToast}
      />
      <View style={styles.header}>
        <Text style={styles.category}>{sourceInfo.name}</Text>
        <Text style={styles.title}>{product.name}</Text>
        <Text style={styles.manufacturer}>{product.manufacturer}</Text>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.image_url }}
          style={styles.productImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          {product.price ? `$${product.price}` : 'Price not available'}
        </Text>
      </View>

      <View style={styles.specsContainer}>
        <Text style={styles.specsTitle}>Specifications</Text>
        {renderProductSpecs()}
      </View>
      <View style={{ height: 50 }} />
    </ScrollView>
  );
};

export default ProductDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    fontWeight: '600',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 32,
  },
  manufacturer: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
  imageContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  productImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  priceContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#059669',
    textAlign: 'center',
  },
  specsContainer: {
    padding: 20,
  },
  specsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  specLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  specValue: {
    flex: 2,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
});
