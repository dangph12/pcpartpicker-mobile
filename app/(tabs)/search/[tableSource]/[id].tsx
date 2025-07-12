/* eslint-disable import/no-unresolved */
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import ProductDetail from '~/components/ProductDetail';
import ErrorToast from '~/components/toasts/ErrorToast';
import SuccessToast from '~/components/toasts/SuccessToast';
import { useAuth } from '~/contexts/AuthContext';
import { addToBuilder } from '~/utils/addToBuilder';

export default function ProductDetailScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { tableSource, id } = useLocalSearchParams<{
    tableSource: string;
    id: string;
  }>();
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);
  const [showErrorToast, setShowErrorToast] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleAddToBuilder = async () => {
    try {
      await addToBuilder(session?.user.id!, tableSource!, id!);
      setShowSuccessToast(true);
      router.push(`/builder`);
    } catch (error) {
      setErrorMessage(
        (error as Error).message || 'Failed to add product to builder.'
      );
      setShowErrorToast(true);
    }
  };

  return (
    <>
      <ProductDetail tableSource={tableSource} id={id} />
      <View style={styles.addButtonContainer}>
        <Button
          mode="contained"
          onPress={handleAddToBuilder}
          style={styles.addButton}>
          Add to Builder
        </Button>
      </View>
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
}

const styles = StyleSheet.create({
  addButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  addButton: {
    elevation: 5,
  },
});
