import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Card } from 'react-native-paper';

export default function Homepage() {
  const router = useRouter();

  const handleCreateBuilder = () => {
    router.push('/(tabs)/builder');
  };

  const handleSearchParts = () => {
    router.push('/(tabs)/search');
  };

  const features = [
    {
      id: 1,
      title: 'Search Parts',
      description: 'Browse and filter through thousands of PC components',
      icon: 'search' as const,
      color: '#2196F3',
      onPress: handleSearchParts,
      available: true,
    },
    {
      id: 2,
      title: 'Build Your PC',
      description: 'Create and customize your perfect PC build',
      icon: 'build' as const,
      color: '#4CAF50',
      onPress: handleCreateBuilder,
      available: true,
    },
    {
      id: 3,
      title: 'Compare Builds',
      description: 'Compare different PC configurations side by side',
      icon: 'git-compare' as const,
      color: '#FF9800',
      onPress: () => {},
      available: false,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <View style={styles.heroIcon}>
            <Ionicons name="hardware-chip" size={60} color="#2196F3" />
          </View>
          <Text style={styles.heroTitle}>PC Part Picker</Text>
          <Text style={styles.heroSubtitle}>
            Build your dream PC with ease. Find compatible parts, compare
            prices, and create the perfect build for your needs.
          </Text>
          <Button
            mode="contained"
            onPress={handleCreateBuilder}
            style={styles.ctaButton}
            contentStyle={styles.ctaButtonContent}
            labelStyle={styles.ctaButtonText}>
            Create a Builder
          </Button>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Main Features</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <Card
              key={feature.id}
              style={[
                styles.featureCard,
                !feature.available && styles.featureCardDisabled,
              ]}
              onPress={feature.available ? feature.onPress : undefined}>
              <Card.Content style={styles.featureCardContent}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.color + '20' },
                  ]}>
                  <Ionicons
                    name={feature.icon}
                    size={32}
                    color={feature.available ? feature.color : '#ccc'}
                  />
                </View>
                <Text
                  style={[
                    styles.featureTitle,
                    !feature.available && styles.featureTextDisabled,
                  ]}>
                  {feature.title}
                  {!feature.available && (
                    <Text style={styles.comingSoonBadge}> (Coming Soon)</Text>
                  )}
                </Text>
                <Text
                  style={[
                    styles.featureDescription,
                    !feature.available && styles.featureTextDisabled,
                  ]}>
                  {feature.description}
                </Text>
                {feature.available && (
                  <TouchableOpacity
                    style={[
                      styles.featureButton,
                      { backgroundColor: feature.color },
                    ]}
                    onPress={feature.onPress}>
                    <Text style={styles.featureButtonText}>
                      {feature.title === 'Search Parts'
                        ? 'Search Now'
                        : 'Get Started'}
                    </Text>
                  </TouchableOpacity>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <View style={styles.footerIconContainer}>
            <Ionicons name="hardware-chip" size={20} color="#fff" />
          </View>
          <Text style={styles.footerAppName}>PC Part Picker</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  // Hero Section
  heroSection: {
    backgroundColor: 'white',
    paddingVertical: 50,
  },
  heroContent: {
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  ctaButton: {
    borderRadius: 12,
    elevation: 3,
  },
  ctaButtonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Features Section
  featuresSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    marginBottom: 8,
  },
  featureCardDisabled: {
    opacity: 0.6,
  },
  featureCardContent: {
    padding: 20,
    alignItems: 'center',
  },
  featureIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  featureTextDisabled: {
    color: '#ccc',
  },
  comingSoonBadge: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'normal',
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  featureButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  featureButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  // Footer
  footer: {
    backgroundColor: '#1a1a1a',
    marginTop: 40,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    alignItems: 'center',
  },
  footerIconContainer: {
    flexDirection: 'row',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  footerAppName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footerSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  footerCopyright: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});
