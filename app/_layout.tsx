import { useEffect, useCallback, useState } from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { store } from '../store';
import { Stack } from 'expo-router';
import { initializeDatabase } from '../database';
import { generateRecurringExpenses } from '../store/slices/recurringExpensesSlice';
import { fetchCards } from '../store/slices/cardsSlice';
import {
  setupNotifications,
  scheduleMonthlyBudgetReminder,
  scheduleWeeklySpendingDigest,
} from '../utils/notifications';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded] = useFonts({
    'Arial': require('../assets/fonts/font.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        await initializeDatabase();
        await store.dispatch(generateRecurringExpenses({}));
        await store.dispatch(fetchCards());
        const notificationsEnabled = await setupNotifications();
        if (notificationsEnabled) {
          await scheduleMonthlyBudgetReminder();
          await scheduleWeeklySpendingDigest();
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
  }

  return (
    <Provider store={store}>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fff' },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="modal" 
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitleStyle: {
                color: '#2A2D43',
                fontSize: 18,
                fontWeight: '600',
              },
            }} 
          />
        </Stack>
      </View>
    </Provider>
  );
}
