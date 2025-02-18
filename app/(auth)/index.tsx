import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

export default function AuthScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="shield-lock" size={80} color="#2563eb" />
        </View>
        <Text style={styles.title}>Expense Tracker</Text>
        <Text style={styles.subtitle}>Secure your financial data</Text>
        
        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <TouchableOpacity
          style={[styles.button, isAuthenticating && styles.buttonDisabled]}
          onPress={authenticate}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#EFF6FF',
    padding: 24,
    borderRadius: 100,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 8,
    marginBottom: 32,
    textAlign: 'center',
  },
  errorText: {
    color: '#EF4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minWidth: 240,
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
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingText: {
    marginLeft: 8,
  },
});
