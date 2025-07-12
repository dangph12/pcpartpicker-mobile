/* eslint-disable import/no-unresolved */
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import BuilderItem from '~/components/BuilderItem';
import { useAuth } from '~/contexts/AuthContext';
import { supabase } from '~/lib/subpabase';
import { removeFromBuilder } from '~/utils/removeFromBuilder';
import { TableSourceKey, tableSourceMap } from '~/utils/tableSourceUtils';

const BuilderPage = () => {
  const router = useRouter();
  const { session } = useAuth();
  const [builderData, setBuilderData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuilderData = async () => {
      try {
        setLoading(true);
        // Fetch builder_id using user_id
        const { data: builderData, error: builderError } = await supabase
          .from('builder')
          .select('id')
          .eq('user_id', session?.user.id)
          .single();

        if (builderError || !builderData) {
          console.error('Error fetching builder_id:', builderError);
          return;
        }

        const builderId = builderData.id;

        // Fetch builder parts using builder_id
        const { data: builderPartsData, error: partsError } = await supabase
          .from('builder_parts')
          .select('part_type, part_id')
          .eq('builder_id', builderId);

        if (partsError) {
          console.error('Error fetching builder parts data:', partsError);
        } else {
          const formattedData: Record<string, string> = builderPartsData.reduce(
            (
              acc: Record<string, string>,
              part: { part_type: string; part_id: string }
            ) => {
              acc[`${part.part_type}_id`] = part.part_id;
              return acc;
            },
            {}
          );
          setBuilderData(formattedData);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuilderData();
  }, []);

  const handleRemoveFromBuilder = async (partType: string) => {
    try {
      setLoading(true);
      await removeFromBuilder(session?.user.id!, partType);
      setBuilderData((prevData) => {
        const updatedData = { ...prevData };
        delete updatedData[`${partType}_id`];
        return updatedData;
      });
    } catch (error) {
      console.error('Failed to remove part from builder:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading builder data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {Object.keys(tableSourceMap).map((key) => {
        const tableSource = key as TableSourceKey;
        const productId = builderData[`${tableSource}_id`];

        return (
          <View key={tableSource} style={styles.itemContainer}>
            <Text style={styles.itemTitle}>
              {tableSourceMap[tableSource].name}
            </Text>
            {productId ? (
              <BuilderItem
                productId={productId}
                tableSource={tableSource}
                onRemove={() => handleRemoveFromBuilder(tableSource)}
              />
            ) : (
              <Button
                mode="contained"
                onPress={() => {
                  router.push(`/search/${tableSource}`);
                }}
                style={styles.addButton}>
                Add {tableSourceMap[tableSource].productType}
              </Button>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

export default BuilderPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  itemContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addButton: {
    marginTop: 10,
  },
});
