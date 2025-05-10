import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
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

        const containerStyle = useAnimatedStyle(() => {
          return {
            transform: [
              {
                translateY: withSpring(isActive ? -8 : 0, {
                  damping: 15,
                  stiffness: 120,
                })
              }
            ],
          };
        });

        const bgStyle = useAnimatedStyle(() => {
          return {
            opacity: withSpring(isActive ? 1 : 0),
            transform: [
              {
                scale: withSpring(isActive ? 1 : 0.8),
              }
            ],
          };
        });

        return (
          <AnimatedPressable
            key={tab.name}
            style={[styles.tab, containerStyle]}
            onPress={() => router.push(tab.route)}
          >
            <Animated.View style={[styles.activeBackground, bgStyle]} />
            <View style={styles.content}>
              <MaterialCommunityIcons
                name={tab.icon}
                size={24}
                color={isActive ? '#2563eb' : '#94A3B8'}
                style={styles.icon}
              />
              <Animated.Text
                style={[
                  styles.tabText,
                  { 
                    color: isActive ? '#2563eb' : '#94A3B8',
                    fontWeight: isActive ? '700' : '500',
                  }
                ]}
              >
                {tab.label}
              </Animated.Text>
            </View>
            {isActive && (
              <View style={styles.activeDot} />
            )}
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
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingTop: 16,
    paddingHorizontal: 8,
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
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 60,
    marginHorizontal: 4,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  activeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  icon: {
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    letterSpacing: 0.3,
  },
  activeDot: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2563eb',
  },
});
