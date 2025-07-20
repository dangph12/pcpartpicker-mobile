import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../../lib/supabase';

async function fetchPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select('amount,status,created_at');
  if (error) {
    console.error('Error fetching payments:', error);
    return [];
  }
  return data ?? [];
}

export default function AdminDashboard() {
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  }>({
    labels: [],
    datasets: [{ data: [] }],
  });

  useEffect(() => {
    async function loadData() {
      const payments = await fetchPayments();
      const dayTotals: Record<string, number> = {};
      payments.forEach((p) => {
        const day = p.created_at?.slice(0, 10) ?? 'Unknown'; // 'YYYY-MM-DD'
        dayTotals[day] = (dayTotals[day] || 0) + Number(p.amount);
      });
      const sortedDays = Object.keys(dayTotals).sort();
      setChartData({
        labels: sortedDays,
        datasets: [{ data: sortedDays.map((d) => dayTotals[d]) }],
      });
    }
    loadData();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to the admin panel</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        {/* Payment Daily Flow Chart */}
        <Text style={styles.chartTitle}>Daily Payment Flow</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
            style: { borderRadius: 16 },
            propsForDots: { r: '6', strokeWidth: '2', stroke: '#2196f3' },
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
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
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    color: '#2196f3',
  },
});
