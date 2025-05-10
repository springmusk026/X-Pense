import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';

export default function NotFoundScreen() {
  const [scaleAnim] = useState(new Animated.Value(1));

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found', headerStyle: { backgroundColor: '#EEF2FF' } }} />
      <LinearGradient
        colors={['#EEF2FF', '#F8FAFC']}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.illustrationContainer}>
            <MaterialCommunityIcons name="map-marker-question" size={80} color="#2563eb" />
          </View>
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.text}>
            The page you're looking for doesn't exist or has been moved.
          </Text>
          <Link href="/" asChild>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable 
                style={styles.button}
                onPress={() => {
                  animateButton();
                }}
              >
                <MaterialCommunityIcons name="home" size={20} color="#FFFFFF" />
                <Text style={styles.buttonText}>Return to Home</Text>
              </Pressable>
            </Animated.View>
          </Link>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  illustrationContainer: {
    backgroundColor: '#EFF6FF',
    padding: 24,
    borderRadius: 100,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1E293B',
    letterSpacing: -0.5,
  },
  text: {
    fontSize: 17,
    marginBottom: 36,
    textAlign: 'center',
    color: '#64748B',
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
});
