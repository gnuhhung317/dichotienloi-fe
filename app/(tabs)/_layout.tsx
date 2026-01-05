import { Tabs, Link } from 'expo-router';
import React from 'react';
import { Home, Refrigerator, ShoppingCart, CalendarDays, User } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        tabBarActiveTintColor: '#10b981',
        tabBarStyle: { display: 'none' },
        headerRight: () => (
          <Link href="/notification" asChild>
            <Pressable className="mr-4">
              {({ pressed }) => (
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="black"
                  style={{ opacity: pressed ? 0.5 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
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
