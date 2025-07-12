/* eslint-disable import/no-unresolved */
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Checkbox, RadioButton, TextInput } from 'react-native-paper';
import { z } from 'zod';
import { supabase } from '~/lib/subpabase';

// Price ranges
const PRICE_RANGES = [
  { label: '$0 - $100', min: 0, max: 100, value: '0-100' },
  { label: '$100 - $200', min: 100, max: 200, value: '100-200' },
  { label: '$200 - $300', min: 200, max: 300, value: '200-300' },
  { label: 'Over $300', min: 300, max: null, value: '300+' },
] as const;

// Zod schema for filter form
const filterSchema = z.object({
  searchName: z.string().optional(),
  manufacturer: z.string().optional(),
  priceRanges: z.array(z.string()).optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

export interface FilterOptions {
  searchName?: string;
  manufacturer?: string;
  priceRanges?: string[];
}

interface ProductFilterProps {
  tableSource: string;
  onFilterChange: (filters: FilterOptions) => void;
  onClose: () => void;
}

const ProductFilter: React.FC<ProductFilterProps> = ({
  tableSource,
  onFilterChange,
  onClose,
}) => {
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const { control, handleSubmit, reset, setValue, watch } =
    useForm<FilterFormData>({
      resolver: zodResolver(filterSchema),
      defaultValues: {
        searchName: '',
        manufacturer: '',
        priceRanges: [],
      },
    });

  const watchedPriceRanges = watch('priceRanges') || [];

  // Fetch unique manufacturers from the table
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from(tableSource)
          .select('manufacturer')
          .not('manufacturer', 'is', null);

        if (error) {
          console.error('Error fetching manufacturers:', error);
          return;
        }

        // Get unique manufacturers and sort them
        const uniqueManufacturers = [
          ...new Set(data.map((item) => item.manufacturer)),
        ].sort();

        setManufacturers(uniqueManufacturers);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchManufacturers();
  }, [tableSource]);

  const onSubmit = (data: FilterFormData) => {
    // Clean up empty values
    const filters: FilterOptions = {};

    if (data.searchName?.trim()) {
      filters.searchName = data.searchName.trim();
    }

    if (data.manufacturer) {
      filters.manufacturer = data.manufacturer;
    }

    if (data.priceRanges && data.priceRanges.length > 0) {
      filters.priceRanges = data.priceRanges;
    }

    onFilterChange(filters);
    onClose();
  };

  const handleClearFilters = () => {
    reset({
      searchName: '',
      manufacturer: '',
      priceRanges: [],
    });
  };

  const togglePriceRange = (value: string) => {
    const currentRanges = watchedPriceRanges;
    const newRanges = currentRanges.includes(value)
      ? currentRanges.filter((range) => range !== value)
      : [...currentRanges, value];

    setValue('priceRanges', newRanges);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filter Products</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search by name */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Search by Name</Text>
          <Controller
            control={control}
            name="searchName"
            render={({ field: { onChange, value } }) => (
              <TextInput
                mode="outlined"
                placeholder="Enter product name..."
                value={value}
                onChangeText={onChange}
                style={styles.searchInput}
                dense
              />
            )}
          />
        </View>

        {/* Manufacturer filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Manufacturer</Text>
          {loading ? (
            <Text style={styles.loadingText}>Loading manufacturers...</Text>
          ) : (
            <Controller
              control={control}
              name="manufacturer"
              render={({ field: { onChange, value } }) => (
                <RadioButton.Group onValueChange={onChange} value={value || ''}>
                  <View style={styles.radioOption}>
                    <RadioButton value="" />
                    <Text style={styles.radioLabel}>All Manufacturers</Text>
                  </View>
                  {manufacturers.map((manufacturer) => (
                    <View key={manufacturer} style={styles.radioOption}>
                      <RadioButton value={manufacturer} />
                      <Text style={styles.radioLabel}>{manufacturer}</Text>
                    </View>
                  ))}
                </RadioButton.Group>
              )}
            />
          )}
        </View>

        {/* Price range filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          {PRICE_RANGES.map((range) => (
            <View key={range.value} style={styles.checkboxOption}>
              <Checkbox
                status={
                  watchedPriceRanges.includes(range.value)
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => togglePriceRange(range.value)}
              />
              <TouchableOpacity
                style={styles.checkboxLabel}
                onPress={() => togglePriceRange(range.value)}>
                <Text style={styles.checkboxLabelText}>{range.label}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <Button
          mode="outlined"
          onPress={handleClearFilters}
          style={styles.clearButton}>
          Clear Filters
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          style={styles.applyButton}>
          Apply Filters
        </Button>
      </View>
    </View>
  );
};

export default ProductFilter;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: 'white',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkboxLabel: {
    flex: 1,
    marginLeft: 8,
  },
  checkboxLabelText: {
    fontSize: 14,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});
