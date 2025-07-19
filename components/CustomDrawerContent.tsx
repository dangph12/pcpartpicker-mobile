/* eslint-disable import/no-unresolved */
import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Drawer } from 'react-native-paper';
import { useAuth } from '~/contexts/AuthContext';

const CustomDrawerContent = (props: any) => {
  const pathname = usePathname();
  const { profile } = useAuth();

  return (
    <DrawerContentScrollView {...props}>
      <Drawer.Section>
        <DrawerItem
          label="Home"
          icon={({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          )}
          focused={pathname === '/'}
          onPress={() => router.push('/')}
        />
        <DrawerItem
          label="Search"
          icon={({ color, size }) => (
            <Ionicons name="search-outline" color={color} size={size} />
          )}
          focused={pathname === '/search'}
          onPress={() => router.push('/search')}
        />
        <DrawerItem
          label="Builder"
          icon={({ color, size }) => (
            <Ionicons name="construct-outline" color={color} size={size} />
          )}
          focused={pathname === '/builder'}
          onPress={() => router.push('/builder')}
        />
        <DrawerItem
          label="Orders"
          icon={({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          )}
          focused={pathname === '/order'}
          onPress={() => router.push('/order')}
        />
        <DrawerItem
          label="Profile"
          icon={({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          )}
          focused={pathname === '/profile'}
          onPress={() => router.push('/profile')}
        />
      </Drawer.Section>
      {profile?.role === 'admin' && (
        <Drawer.Section>
          <DrawerItem
            label="Admin Dashboard"
            icon={({ color, size }) => (
              <Ionicons
                name="shield-checkmark-outline"
                color={color}
                size={size}
              />
            )}
            focused={pathname === '/admin'}
            onPress={() => router.push('/admin')}
          />
          <DrawerItem
            label="Admin Users"
            icon={({ color, size }) => (
              <Ionicons name="people-outline" color={color} size={size} />
            )}
            focused={pathname === '/admin/users'}
            onPress={() => router.push('/admin/users')}
          />
        </Drawer.Section>
      )}
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  adminSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 16,
    color: '#666',
  },
  adminMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 2,
  },
  adminMenuText: {
    fontSize: 15,
    color: '#333',
  },
});

export default CustomDrawerContent;
