import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Trang chủ', icon: '🏠' },
    { id: 'fridge', label: 'Tủ lạnh', icon: '❄️' },
    { id: 'shopping', label: 'Mua sắm', icon: '🛒' },
    { id: 'meals', label: 'Thực đơn', icon: '📅' },
    { id: 'profile', label: 'Cá nhân', icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={[styles.tab, isActive && styles.activeTab]}
            >
              <Text style={styles.icon}>{tab.icon}</Text>
              <Text style={[styles.label, isActive && styles.activeLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 0,
    paddingVertical: 4,
    paddingBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 0,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#F0FDF4',
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
  },
  activeLabel: {
    color: '#16A34A',
    fontWeight: '600',
  },
});
