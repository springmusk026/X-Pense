import { Slot } from 'expo-router';
import { View } from 'react-native';
import { TabBar } from '../../components/navigation/TabBar';

export default function TabLayout() {
  return (
    <View style={{ flex: 1 , top: 10, left: 0, right: 0, bottom: 0, position: 'absolute' }}>
      <Slot />
      <TabBar />
    </View>
  );
}
