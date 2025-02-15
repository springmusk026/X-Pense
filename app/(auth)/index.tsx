import { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AuthScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async () => {
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
      <MaterialCommunityIcons name="shield-lock" size={64} color="#4A90E2" />
      <Text style={styles.title}>Expense Tracker</Text>
      <Text style={styles.subtitle}>Secure your financial data</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={authenticate}
        disabled={isAuthenticating}
      >
        <Text style={styles.buttonText}>
          {isAuthenticating ? 'Authenticating...' : 'Authenticate'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#2A2D43',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginTop: 8,
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});