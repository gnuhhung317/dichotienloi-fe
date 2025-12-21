import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Refrigerator, ShoppingCart, CalendarDays, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        tabBarActiveTintColor: '#10b981',
        tabBarStyle: { display: 'none' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
