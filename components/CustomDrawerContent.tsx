import Ionicons from '@expo/vector-icons/Ionicons';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { router, usePathname } from 'expo-router';
import { Drawer } from 'react-native-paper';

const CustomDrawerContent = (props: any) => {
  const pathname = usePathname();
  return (
    <DrawerContentScrollView {...props}>
      <Drawer.Section>
        <DrawerItem
          label="Welcome to the App"
          icon={({ color, size }) => (
            <Ionicons
              name="information-circle-outline"
              color={color}
              size={size}
            />
          )}
          onPress={() => router.push('/welcome')}
        />
      </Drawer.Section>
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
          label="Profile"
          icon={({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          )}
          focused={pathname === '/profile'}
          onPress={() => router.push('/profile')}
        />
      </Drawer.Section>
    </DrawerContentScrollView>
  );
};

export default CustomDrawerContent;
