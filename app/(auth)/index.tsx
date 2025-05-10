import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

export default function AuthScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const authenticate = async () => {
    setError(null);
    try {
      setIsAuthenticating(true);
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your expenses',
        fallbackLabel: 'Use passcode',
      });

      if (result.success) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      
      setError('Authentication failed. Please try again.');
      console.error('Authentication error:', error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <LinearGradient
      colors={['#EEF2FF', '#F8FAFC']}
      style={styles.container}
    >
      <View style={styles.content}>
        <LinearGradient
          colors={['#EFF6FF', '#DBEAFE']}
          style={styles.iconContainer}
        >
          <MaterialCommunityIcons name="shield-lock" size={80} color="#2563eb" />
        </LinearGradient>
        <Text style={styles.title}>XPense</Text>
        <Text style={styles.subtitle}>Your Private Finance Tracker</Text>
        
        <View style={styles.privacyContainer}>
          <View style={styles.privacyItem}>
            <MaterialCommunityIcons name="cellphone-lock" size={24} color="#64748B" />
            <Text style={styles.privacyText}>100% Device-Only Storage</Text>
          </View>
          <View style={styles.privacyItem}>
            <MaterialCommunityIcons name="eye-off-outline" size={24} color="#64748B" />
            <Text style={styles.privacyText}>No Trackers or Analytics</Text>
          </View>
          <View style={styles.privacyItem}>
            <MaterialCommunityIcons name="cloud-off-outline" size={24} color="#64748B" />
            <Text style={styles.privacyText}>No Server Connection</Text>
          </View>
          <View style={styles.privacyItem}>
            <MaterialCommunityIcons name="backup-restore" size={24} color="#64748B" />
            <Text style={styles.privacyText}>Local Backup Support</Text>
          </View>
        </View>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            style={[styles.button, isAuthenticating && styles.buttonDisabled]}
            onPress={() => {
              animateButton();
              authenticate();
            }}
            disabled={isAuthenticating}
          >
          {isAuthenticating ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={[styles.buttonText, styles.loadingText]}>
                Authenticating...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons name="fingerprint" size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>Authenticate</Text>
            </View>
          )}
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.disclaimer}>
          Important: All data is stored locally on your device. Uninstalling the app or clearing app data will permanently delete your financial records. Please take regular backups.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
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
    fontSize: 36,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#64748B',
    marginTop: 12,
    marginBottom: 32,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  privacyContainer: {
    marginBottom: 36,
    width: '100%',
    paddingHorizontal: 20,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  privacyText: {
    fontSize: 15,
    color: '#475569',
    marginLeft: 12,
    letterSpacing: 0.2,
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minWidth: 260,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '600',
    marginLeft: 10,
    letterSpacing: 0.3,
  },
  loadingText: {
    marginLeft: 8,
  },
  disclaimer: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});
