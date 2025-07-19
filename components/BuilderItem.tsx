/* eslint-disable import/no-unresolved */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { supabase } from '~/lib/supabase';
import Product from '~/types/Product';
import { TableSourceKey, tableSourceMap } from '~/utils/tableSourceUtils';

interface BuilderItemProps {
  productId: string;
  tableSource: TableSourceKey;
  onRemove: () => void;
}

const BuilderItem: React.FC<BuilderItemProps> = ({
  productId,
  tableSource,
  onRemove,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from(tableSource)
          .select('*')
          .eq('id', productId)
          .single();

        if (fetchError) {
          console.error('Error fetching product:', fetchError);
          setError('Failed to load product information');
          return;
        }

        if (data) {
          setProduct(data as Product);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (productId && tableSource) {
      fetchProduct();
    }
  }, [productId, tableSource]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" />
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Product not found'}</Text>
        <Text style={styles.productIdText}>Product ID: {productId}</Text>
        <Button mode="contained" onPress={onRemove} style={styles.removeButton}>
          Remove {tableSourceMap[tableSource].productType}
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.productContainer}>
      <Image
        source={{ uri: product.image_url }}
        style={styles.productImage}
        resizeMode="cover"
      />
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
      <Button
        mode="contained"
        onPress={onRemove}
        style={styles.removeButton}
        compact>
        Remove
      </Button>
    </View>
  );
};

export default BuilderItem;

const styles = StyleSheet.create({
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  productId: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    backgroundColor: '#D32F2F',
    minWidth: 80,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 6,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    fontSize: 14,
    color: '#C62828',
    marginBottom: 4,
  },
  productIdText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
});
