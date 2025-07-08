/* eslint-disable import/no-unresolved */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import TableSourceSelector from '~/components/TableSourceSelector';

export default function SearchIndexScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>PC Parts Search</Text>
        <Text style={styles.subtitle}>
          Find the perfect components for your build
        </Text>
      </View>

      <View style={styles.selectorContainer}>
        <TableSourceSelector />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
  },
  selectorContainer: {
    marginHorizontal: 0,
    marginBottom: 16,
    paddingHorizontal: 0,
  },
});
