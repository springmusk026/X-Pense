import { Slot } from 'expo-router';
import { View } from 'react-native';
import { TabBar } from '../../components/navigation/TabBar';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <TabBar />
    </View>
  );
}
