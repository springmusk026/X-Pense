import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
} from 'react-native-reanimated';

type TabRoute = {
  name: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: `/(tabs)${'' | '/expenses' | '/cards' | '/reports' | '/more'}`;
};

const tabs: TabRoute[] = [
  {
    name: 'index',
    label: 'Overview',
    icon: 'view-dashboard',
    route: '/(tabs)',
  },
  {
    name: 'expenses',
    label: 'Expenses',
    icon: 'currency-usd',
    route: '/(tabs)/expenses',
  },
  {
    name: 'cards',
    label: 'Cards',
    icon: 'credit-card',
    route: '/(tabs)/cards',
  },
  {
    name: 'reports',
    label: 'Reports',
    icon: 'chart-bar',
    route: '/(tabs)/reports',
  },
  {
    name: 'more',
    label: 'More',
    icon: 'dots-horizontal',
    route: '/(tabs)/more',
  },
];

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route || 
          (pathname?.startsWith(tab.route + '/') ?? false) ||
          (tab.name === 'index' && pathname === '/(tabs)');

        const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

        const animatedStyles = useAnimatedStyle(() => {
          return {
            transform: [
              {
                scale: withSpring(isActive ? 1.1 : 1, {
                  mass: 0.5,
                  damping: 10,
                  stiffness: 100,
                })
              }
            ],
            opacity: withSpring(isActive ? 1 : 0.7),
          };
        });

        const dotStyle = useAnimatedStyle(() => {
          return {
            opacity: withSpring(isActive ? 1 : 0),
            transform: [
              {
                scale: withSpring(isActive ? 1 : 0),
              },
              {
                translateY: withSpring(isActive ? 0 : 8),
              }
            ],
          };
        });

        const textStyle = useAnimatedStyle(() => {
          return {
            transform: [
              {
                translateY: withSpring(isActive ? -4 : 0),
              }
            ],
            opacity: withSpring(isActive ? 1 : 0.7),
          };
        });

        return (
          <AnimatedPressable
            key={tab.name}
            style={[styles.tab, animatedStyles]}
            onPress={() => router.push(tab.route)}
          >
            <MaterialCommunityIcons
              name={tab.icon}
              size={24}
              color={isActive ? '#4A90E2' : '#757575'}
            />
            <Animated.Text
              style={[
                styles.tabText,
                textStyle,
                { color: isActive ? '#4A90E2' : '#757575' }
              ]}
            >
              {tab.label}
            </Animated.Text>
            <Animated.View style={[styles.dot, dotStyle]} />
          </AnimatedPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px -2px 4px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  dot: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#4A90E2',
  },
});
