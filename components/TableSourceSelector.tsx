import { router } from 'expo-router';
import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { tableSourceMap } from '~/utils/tableSourceUtils';

type TableSource = {
  id: string;
  name: string;
  description: string;
};

const TableSourceSelector = () => {
  const handleSelectTableSource = (tableSource: string) => {
    router.push(`/(tabs)/search/${tableSource}` as any);
  };

  const renderTableSourceItem = ({ item }: { item: TableSource }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleSelectTableSource(item.id)}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={Object.values(tableSourceMap) as TableSource[]}
      renderItem={renderTableSourceItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.row}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  itemContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flex: 1,
    marginHorizontal: 4,
  },
  itemContent: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default TableSourceSelector;
