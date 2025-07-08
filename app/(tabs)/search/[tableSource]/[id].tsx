/* eslint-disable import/no-unresolved */
import { useLocalSearchParams } from 'expo-router';
import ProductDetail from '~/components/ProductDetail';

export default function ProductDetailScreen() {
  const { tableSource, id } = useLocalSearchParams<{
    tableSource: string;
    id: string;
  }>();

  return <ProductDetail tableSource={tableSource} id={id} />;
}
