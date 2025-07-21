import { Ionicons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'blue',
        headerLeft: () => <DrawerToggleButton />,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <Ionicons name="search-outline" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="search/[tableSource]"
        options={{
          href: null,
          title: 'Search',
        }}
      />
      <Tabs.Screen
        name="search/[tableSource]/[id]"
        options={{
          href: null,
          title: 'Product Detail',
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: 'Builder',
          tabBarIcon: ({ color }) => (
            <Ionicons name="construct-outline" color={color} size={28} />
          ),
        }}
      />

      <Tabs.Screen
        name="order/index"
        options={{
          title: 'Order',
          tabBarIcon: ({ color }) => (
            <Ionicons name="list-outline" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="order/[id]"
        options={{
          href: null,
          title: 'Order Detail',
        }}
      />
    </Tabs>
  );
}
