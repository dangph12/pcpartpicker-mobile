/* eslint-disable import/no-unresolved */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Product from '~/types/Product';

const ProductItem = ({ item }: { item: Product }) => {
  return (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.image_url }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <Text style={styles.productName} numberOfLines={2}>
        {item.name}
      </Text>
      <Text style={styles.productPrice}>${item.price || 'N/A'}</Text>
      <Text>Manufacturer: {item.manufacturer}</Text>
    </View>
  );
};

export default ProductItem;

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    width: 150,
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
});
