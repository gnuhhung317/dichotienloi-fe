import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home } from '@/components/Home';
import { Fridge } from '@/components/Fridge';
import { ShoppingList } from '@/components/ShoppingList';
import { MealPlanner } from '@/components/MealPlanner';
import { Profile } from '@/components/Profile';
import { Login } from '@/components/Login';
import { BottomNav } from '@/components/BottomNav';
import { Header } from '@/components/Header';

export default function HomeScreen() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <Home />;
      case 'fridge':
        return <Fridge />;
      case 'shopping':
        return <ShoppingList />;
      case 'meals':
        return <MealPlanner />;
      case 'profile':
        return <Profile onLogout={() => setIsAuthenticated(false)} />;
      default:
        return <Home />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appContainer}>
        {/* App Header */}
        <Header syncStatus={syncStatus} />

        {/* Main Content Area */}
        <View style={styles.content}>
          {renderScreen()}
        </View>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  appContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});
