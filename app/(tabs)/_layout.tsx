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
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search/index"
        options={{
          title: 'Search',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="search" color={color} />
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
            <FontAwesome size={28} name="wrench" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="order/index"
        options={{
          title: 'Order',
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="shopping-basket" color={color} />
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
