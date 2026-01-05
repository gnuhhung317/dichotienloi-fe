import { useState } from 'react';
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserManagement } from './admin/UserManagement';
import { CategoryManagement } from './admin/CategoryManagement';
import { UnitManagement } from './admin/UnitManagement';
import { Statistics } from './admin/Statistics';
import { useAuth } from '../context/AuthContext';

interface AdminDashboardProps {
    onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'users' | 'categories' | 'units' | 'stats'>('stats');
    const { user } = useAuth();

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement />;
            case 'categories':
                return <CategoryManagement />;
            case 'units':
                return <UnitManagement />;
            case 'stats':
                return <Statistics />;
            default:
                return <Statistics />;
        }
    };

    const menuItems = [
        { id: 'stats', label: 'Thống kê', icon: 'bar-chart' },
        { id: 'users', label: 'Tài khoản', icon: 'people' },
        { id: 'categories', label: 'Danh mục', icon: 'list' },
        { id: 'units', label: 'Đơn vị', icon: 'cube' },
    ];

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: onLogout }
        ])
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Admin Dashboard</Text>
                    <Text style={styles.welcomeText}>Xin chào, {user?.name}</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {renderContent()}
            </View>

            <View style={styles.bottomNav}>
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.navItem, isActive && styles.activeNavItem]}
                            onPress={() => setActiveTab(item.id as any)}
                        >
                            <Ionicons
                                name={item.icon as any}
                                size={24}
                                color={isActive ? '#16A34A' : '#6B7280'}
                            />
                            <Text style={[styles.navLabel, isActive && styles.activeNavLabel]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    welcomeText: {
        color: '#6B7280',
        fontSize: 14
    },
    logoutButton: {
        padding: 8
    },
    content: {
        flex: 1,
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: 20, // Safe area padding likely needed
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 12,
    },
    activeNavItem: {
        // borderTopWidth: 2,
        // borderTopColor: '#16A34A',
    },
    navLabel: {
        fontSize: 10,
        marginTop: 4,
        color: '#6B7280',
    },
    activeNavLabel: {
        color: '#16A34A',
        fontWeight: '600',
    },
});
