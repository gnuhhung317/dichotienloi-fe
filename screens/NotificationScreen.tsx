import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import notificationService, { Notification } from '../services/notification.service';
import { useNavigation } from '@react-navigation/native';

const NotificationScreen = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const navigation = useNavigation();

    const fetchNotifications = async (pageNum: number, shouldRefresh = false) => {
        try {
            const response = await notificationService.getNotifications(pageNum);
            if (shouldRefresh) {
                setNotifications(response.notifications);
            } else {
                setNotifications(prev => [...prev, ...response.notifications]);
            }
            setHasMore(response.page < response.totalPages);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchNotifications(1, true);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchNotifications(1, true);
    };

    const loadMore = () => {
        if (!hasMore || loading) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage);
    };

    const handleMarkAsRead = async (id: string, isRead: boolean) => {
        if (isRead) return;
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const renderItem = ({ item }: { item: Notification }) => (
        <TouchableOpacity
            style={[styles.itemCallback, !item.is_read && styles.unreadItem]}
            onPress={() => handleMarkAsRead(item._id, item.is_read)}
        >
            <View style={styles.iconContainer}>
                <Ionicons
                    name={item.type === 'expire_warning' ? 'warning-outline' : 'notifications-outline'}
                    size={24}
                    color={item.type === 'expire_warning' ? '#FF9800' : '#2196F3'}
                />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.content}>{item.content}</Text>
                <Text style={styles.time}>{new Date(item.created_at).toLocaleString('vi-VN')}</Text>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Thông báo</Text>
                <TouchableOpacity onPress={handleMarkAllAsRead}>
                    <Text style={styles.readAll}>Đọc tất cả</Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing && notifications.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <FlatList
                    data={notifications}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
                    }
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={notifications.length === 0 ? styles.emptyContainer : styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Không có thông báo nào</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    readAll: {
        fontSize: 14,
        color: '#2196F3',
    },
    listContent: {
        padding: 16,
    },
    itemCallback: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadItem: {
        backgroundColor: '#E3F2FD',
    },
    iconContainer: {
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    content: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        color: '#999',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#2196F3',
        marginLeft: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flexGrow: 1,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    }
});

export default NotificationScreen;
