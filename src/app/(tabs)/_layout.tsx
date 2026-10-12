import { Tabs } from 'expo-router';
import { useWindowDimensions } from 'react-native';
import { FloatingTabBar, SideBar, WIDE_BREAKPOINT } from '@/components/TabBar';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { width } = useWindowDimensions();
  const { c } = useTheme();
  const wide = width >= WIDE_BREAKPOINT;
  return (
    <Tabs
      tabBar={(props) => (wide ? <SideBar {...props} /> : <FloatingTabBar {...props} />)}
      screenOptions={{
        headerShown: false,
        tabBarPosition: wide ? 'left' : 'bottom',
        sceneStyle: { backgroundColor: c.bg },
        animation: 'fade',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная' }} />
      <Tabs.Screen name="history" options={{ title: 'История' }} />
      <Tabs.Screen name="stats" options={{ title: 'Аналитика' }} />
      <Tabs.Screen name="settings" options={{ title: 'Профиль' }} />
    </Tabs>
  );
}
