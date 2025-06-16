/* eslint-disable import/no-unresolved */
import React from 'react';
import ProductList from '~/components/ProductList';

export default function SearchScreen() {
  return <ProductList tableSource="cases_detailed" />;
}
