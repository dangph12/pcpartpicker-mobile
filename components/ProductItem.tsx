/* eslint-disable import/no-unresolved */
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-paper';
import ErrorToast from '~/components/toasts/ErrorToast';
import SuccessToast from '~/components/toasts/SuccessToast';
import { useAuth } from '~/contexts/AuthContext';
import Product from '~/types/Product';
import { addToBuilder } from '~/utils/addToBuilder';

const ProductItem = ({
  item,
  tableSource,
}: {
  item: Product;
  tableSource?: string;
}) => {
  const router = useRouter();
  const { session } = useAuth();
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const [showErrorToast, setShowErrorToast] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleAddToBuilder = async () => {
    try {
      await addToBuilder(session?.user.id!, tableSource!, item.id);
      setShowSuccessToast(true);
    } catch (error) {
      setErrorMessage(
        (error as Error).message || 'Failed to add product to builder.'
      );
      setShowErrorToast(true);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/(tabs)/search/${tableSource}/${item.id}`)}
        activeOpacity={0.7}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.productImage}
          resizeMode="cover"
        />
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>${item.price || 'N/A'}</Text>
        <Text style={styles.manufacturer}>
          Manufacturer: {item.manufacturer}
        </Text>
        <Button
          mode="contained"
          onPress={handleAddToBuilder}
          style={styles.addButton}>
          Add to Builder
        </Button>
      </TouchableOpacity>
      <SuccessToast
        message="Product added to builder successfully!"
        showToast={showSuccessToast}
        setShowToast={setShowSuccessToast}
      />
      <ErrorToast
        message={errorMessage}
        showToast={showErrorToast}
        setShowToast={setShowErrorToast}
      />
    </>
  );
};

export default ProductItem;

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    flex: 1,
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
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
  },
  productName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066cc',
    marginBottom: 4,
  },
  manufacturer: {
    fontSize: 10,
    color: '#666',
  },
  addButton: {
    marginTop: 10,
  },
});
