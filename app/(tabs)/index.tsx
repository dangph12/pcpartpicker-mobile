/* eslint-disable import/no-unresolved */
import React from 'react';
import { View } from 'react-native';
import ProductList from '~/components/ProductList';

export default function SearchScreen() {
  return (
    <View>
      <ProductList tableSource="cases_detailed" />
      <ProductList tableSource="cpus_detailed" />
    </View>
  );
}
