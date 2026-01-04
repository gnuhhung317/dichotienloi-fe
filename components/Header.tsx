import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface HeaderProps {
  syncStatus: 'synced' | 'syncing' | 'offline';
  groupName?: string;
}

export function Header({ syncStatus, groupName }: HeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Đi Chợ Tiện Lợi</Text>
          {groupName && <Text style={styles.subtitle}>{groupName}</Text>}
        </View>
        <View style={styles.rightSection}>
          {/* Sync Status Indicator */}
          <View style={styles.syncIndicator}>
            <Text style={styles.statusIcon}>
              {syncStatus === 'synced' && '☁️'}
              {syncStatus === 'syncing' && '🔄'}
              {syncStatus === 'offline' && '📡'}
            </Text>
          </View>
          {/* Notifications */}
          <TouchableOpacity style={styles.notificationButton}>
            <Text style={styles.bellIcon}>🔔</Text>
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
  },
  bellIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
});
