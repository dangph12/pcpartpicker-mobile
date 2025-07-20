import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ProductList from '~/components/ProductList';
import { TableSourceKey, tableSourceMap } from '~/utils/tableSourceUtils';

export default function TableSourceScreen() {
  const { tableSource } = useLocalSearchParams<{ tableSource: string }>();

  if (!tableSource) {
    return null;
  }

  const sourceInfo = tableSourceMap[tableSource as TableSourceKey];

  if (!sourceInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{sourceInfo.name}</Text>
        <Text style={styles.subtitle}>{sourceInfo.description}</Text>
      </View>
      <ProductList tableSource={tableSource} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
