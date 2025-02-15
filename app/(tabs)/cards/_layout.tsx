import { Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CardsLayout() {
  const router = useRouter();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ 
          title: 'Cards',
          headerRight: () => (
            <Pressable onPress={() => router.push('/cards/new')} style={{ marginRight: 15 }}>
              <MaterialCommunityIcons name="plus" size={24} color="#4A90E2" />
            </Pressable>
          ),
          headerTitleStyle: {
            color: '#2A2D43',
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="new"
        options={{ 
          title: 'Add Card',
          presentation: 'modal',
          headerTitleStyle: {
            color: '#2A2D43',
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{ 
          title: 'Card Details',
          headerTitleStyle: {
            color: '#2A2D43',
            fontSize: 18,
            fontWeight: '600',
          },
        }}
      />
    </Stack>
  );
}
