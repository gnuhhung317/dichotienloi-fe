import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import reportService, { ReportItem } from '../services/report.service';
import { useNavigation } from '@react-navigation/native';

type ReportType = 'shopping' | 'consumption';

const ReportScreen = () => {
    const navigation = useNavigation();
    const [reportType, setReportType] = useState<ReportType>('shopping');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [data, setData] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Date picker state
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        // Set default range to current month
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        setStartDate(start);
        setEndDate(end);
    }, []);

    useEffect(() => {
        fetchReport();
    }, [reportType, startDate, endDate]);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];

            let result;
            if (reportType === 'shopping') {
                result = await reportService.getShoppingReport(startStr, endStr);
            } else {
                result = await reportService.getConsumptionReport(startStr, endStr);
            }
            setData(result);
        } catch (error) {
            console.error('Failed to fetch report', error);
        } finally {
            setLoading(false);
        }
    };

    const onChangeStart = (event: any, selectedDate?: Date) => {
        setShowStartPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onChangeEnd = (event: any, selectedDate?: Date) => {
        setShowEndPicker(Platform.OS === 'ios');
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    const renderItem = ({ item }: { item: ReportItem }) => (
        <View style={styles.itemContainer}>
            <Image
                source={{ uri: item.image || 'https://via.placeholder.com/50' }}
                style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.foodName}</Text>
                <Text style={styles.itemCount}>Số lần: {item.count}</Text>
            </View>
            <View style={styles.itemQuantity}>
                <Text style={styles.quantityText}>
                    {parseFloat(item.totalQuantity.toFixed(2))} {item.unitName}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.title}>Báo cáo</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, reportType === 'shopping' && styles.activeTab]}
                    onPress={() => setReportType('shopping')}
                >
                    <Text style={[styles.tabText, reportType === 'shopping' && styles.activeTabText]}>Mua sắm</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, reportType === 'consumption' && styles.activeTab]}
                    onPress={() => setReportType('consumption')}
                >
                    <Text style={[styles.tabText, reportType === 'consumption' && styles.activeTabText]}>Tiêu thụ</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowStartPicker(true)}>
                    <Text style={styles.dateLabel}>Từ: {startDate.toLocaleDateString('vi-VN')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowEndPicker(true)}>
                    <Text style={styles.dateLabel}>Đến: {endDate.toLocaleDateString('vi-VN')}</Text>
                </TouchableOpacity>
            </View>

            {showStartPicker && (
                <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={onChangeStart}
                    maximumDate={endDate}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={onChangeEnd}
                    minimumDate={startDate}
                />
            )}

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#4CAF50" />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>Không có dữ liệu trong khoảng thời gian này</Text>
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
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 8,
        justifyContent: 'space-around',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    activeTab: {
        backgroundColor: '#4CAF50',
    },
    tabText: {
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: '#fff',
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        marginTop: 1,
    },
    dateButton: {
        padding: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        minWidth: 140,
        alignItems: 'center',
    },
    dateLabel: {
        color: '#333',
    },
    listContent: {
        padding: 16,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 8,
        borderRadius: 8,
        elevation: 1,
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 4,
    },
    itemCount: {
        fontSize: 12,
        color: '#888',
    },
    itemQuantity: {
        alignItems: 'flex-end',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    }
});

export default ReportScreen;
