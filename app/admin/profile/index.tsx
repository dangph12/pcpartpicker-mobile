import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '~/lib/supabase';

const AdminProfilePage = () => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profile_with_email')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) {
        setProfiles([]);
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };
    fetchProfiles();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading profiles...</Text>
      </View>
    );
  }

  if (!profiles.length) {
    return (
      <View style={styles.center}>
        <Text>No profiles found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} horizontal>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, styles.headerCell]}>User ID</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>
            Display Name
          </Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Address</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Email</Text>
          <Text style={[styles.tableCell, styles.headerCell]}>Updated At</Text>
        </View>
        {profiles.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={styles.tableRow}
            onPress={() => router.push(`/admin/profile/${profile.id}`)}>
            <Text style={styles.tableCell}>{profile.id}</Text>
            <Text style={styles.tableCell}>{profile.display_name || '-'}</Text>
            <Text style={styles.tableCell}>{profile.address || '-'}</Text>
            <Text style={styles.tableCell}>{profile.user_email || '-'}</Text>
            <Text style={styles.tableCell}>
              {profile.updated_at
                ? new Date(profile.updated_at).toLocaleString()
                : '-'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    backgroundColor: '#eee',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default AdminProfilePage;
