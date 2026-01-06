import { View, Text, StyleSheet, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminService } from '../../services/admin.service';
import { foodService, FoodLog } from '../../services/food.service';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

export function Statistics() {
    const [stats, setStats] = useState({
        users: 0,
        categories: 0,
        units: 0
    });
    const [logs, setLogs] = useState<FoodLog[]>([]);
    const [logStats, setLogStats] = useState({
        added: 0,
        removed: 0,
        edited: 0
    });
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [users, cats, units, foodLogs] = await Promise.all([
                adminService.getAllUsers(),
                adminService.getAllCategories(),
                adminService.getAllUnits(),
                adminService.getFoodLogs()
            ]);

            setStats({
                users: users.length,
                categories: cats.length,
                units: units.length
            });

            setLogs(foodLogs);

            // Calculate log stats
            const added = foodLogs.filter(l => l.action.toLowerCase().includes('create') || l.action.toLowerCase().includes('add')).length;
            const removed = foodLogs.filter(l => l.action.toLowerCase().includes('delete') || l.action.toLowerCase().includes('remove')).length;
            const edited = foodLogs.filter(l => l.action.toLowerCase().includes('update') || l.action.toLowerCase().includes('edit')).length;

            setLogStats({ added, removed, edited });

        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const renderLogItem = ({ item }: { item: FoodLog }) => (
        <View style={styles.logItem}>
            <View style={[styles.logIcon,
            item.action.includes('create') ? styles.bgGreen :
                item.action.includes('delete') ? styles.bgRed : styles.bgBlue
            ]}>
                <Ionicons
                    name={
                        item.action.includes('create') ? "add" :
                            item.action.includes('delete') ? "trash" : "create"
                    }
                    size={16}
                    color="#FFFFFF"
                />
            </View>
            <View style={styles.logContent}>
                <Text style={styles.logAction}>{item.action} - {item.foodId?.name || item.foodName}</Text>
                <Text style={styles.logTime}>{new Date(item.created_at || item.timestamp).toLocaleString('vi-VN')}</Text>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.headerTitle}>Thống kê hệ thống</Text>

            {/* System Overview */}
            <View style={styles.grid}>
                <View style={[styles.card, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name="people" size={32} color="#2563EB" />
                    <Text style={styles.statValue}>{stats.users}</Text>
                    <Text style={styles.statLabel}>Người dùng</Text>
                </View>

                <View style={[styles.card, { backgroundColor: '#DCFCE7' }]}>
                    <Ionicons name="list" size={32} color="#16A34A" />
                    <Text style={styles.statValue}>{stats.categories}</Text>
                    <Text style={styles.statLabel}>Danh mục</Text>
                </View>

                <View style={[styles.card, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="cube" size={32} color="#D97706" />
                    <Text style={styles.statValue}>{stats.units}</Text>
                    <Text style={styles.statLabel}>Đơn vị tính</Text>
                </View>
            </View>

            <Text style={[styles.headerTitle, { marginTop: 32 }]}>Hoạt động thực phẩm</Text>
            <View style={styles.grid}>
                <View style={[styles.card, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.statValue, { color: '#16A34A' }]}>{logStats.added}</Text>
                    <Text style={styles.statLabel}>Đã thêm</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.statValue, { color: '#2563EB' }]}>{logStats.edited}</Text>
                    <Text style={styles.statLabel}>Đã sửa</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#FEF2F2' }]}>
                    <Text style={[styles.statValue, { color: '#DC2626' }]}>{logStats.removed}</Text>
                    <Text style={styles.statLabel}>Đã xóa</Text>
                </View>
            </View>

            <Text style={[styles.headerTitle, { marginTop: 32, fontSize: 18 }]}>Nhật ký gần đây</Text>
            {isLoading ? (
                <ActivityIndicator size="small" color="#16A34A" />
            ) : (
                <View style={styles.logsList}>
                    {logs.slice(0, 10).map((log) => (
                        <View key={log._id} style={styles.logItemWrapper}>
                            {renderLogItem({ item: log })}
                        </View>
                    ))}
                    {logs.length === 0 && <Text style={styles.emptyText}>Chưa có dữ liệu nhật ký</Text>}
                </View>
            )}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        padding: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: '30%',
        aspectRatio: 1,
        borderRadius: 16,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#4B5563',
        marginTop: 2,
        textAlign: 'center'
    },
    logsList: {
        marginTop: 8,
    },
    logItemWrapper: {
        marginBottom: 12,
    },
    logItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    logIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    bgGreen: { backgroundColor: '#16A34A' },
    bgRed: { backgroundColor: '#EF4444' },
    bgBlue: { backgroundColor: '#3B82F6' },
    logContent: {
        flex: 1,
    },
    logAction: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },
    logTime: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 20,
    }
});
