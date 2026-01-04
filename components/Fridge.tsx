import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fridgeService, FridgeItem } from '../services/fridge.service';
import { AddToFridgeModal } from './AddToFridgeModal';

import { foodService } from '../services/food.service';

export function Fridge() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<FridgeItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Categories state
  const [categories, setCategories] = useState<{ id: string; label: string; icon: string }[]>([
    { id: 'all', label: 'Tất cả', icon: '🏪' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load data when component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        loadFridgeItems(),
        loadCategories()
      ]);
    } catch (error) {
      console.error('Initial load error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await foodService.getAllCategories();
      const mappedCats = cats.map(c => ({
        id: c._id,
        label: c.name,
        icon: getCategoryIcon(c.name)
      }));
      setCategories([{ id: 'all', label: 'Tất cả', icon: '🏪' }, ...mappedCats]);
    } catch (error) {
      console.error('Load categories error:', error);
    }
  };

  const getCategoryIcon = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('rau') || lower.includes('củ') || lower.includes('quả')) return '🥬';
    if (lower.includes('thịt')) return '🥩';
    if (lower.includes('cá') || lower.includes('hải sản')) return '🐟';
    if (lower.includes('sữa') || lower.includes('trứng')) return '🥛';
    if (lower.includes('đông lạnh')) return '❄️';
    if (lower.includes('đồ khô') || lower.includes('gia vị')) return '🧂';
    if (lower.includes('đồ uống')) return '🥤';
    if (lower.includes('bánh')) return '🍪';
    return '📦';
  };

  const loadFridgeItems = async () => {
    try {
      const fridgeItems = await fridgeService.getFridgeItems();
      setItems(fridgeItems);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải danh sách tủ lạnh');
      console.error('Load fridge items error:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadFridgeItems();
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải lại danh sách');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddFridgeItem = async (data: any) => {
    try {
      await fridgeService.createFridgeItem({
        foodName: data.foodName,
        quantity: data.quantity,
        expiredAt: data.expiredAt,
      });
      // Reload list to get populated data
      await loadFridgeItems();
      setShowAddModal(false);
      Alert.alert('Thành công', 'Đã thêm vào tủ lạnh');
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể thêm vào tủ');
      console.error('Add fridge item error:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert('Xác nhận', 'Bạn chắc chắn muốn xóa?', [
      { text: 'Hủy', onPress: () => { }, style: 'cancel' },
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            await fridgeService.deleteFridgeItem(itemId);
            setItems(items.filter((item) => item._id !== itemId));
            Alert.alert('Thành công', 'Đã xóa khỏi tủ');
          } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa');
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const getStatusStyle = (expiryDate: string) => {
    const status = fridgeService.getItemStatus(expiryDate);
    switch (status) {
      case 'fresh':
        return styles.statusFresh;
      case 'expiring':
        return styles.statusExpiring;
      case 'expired':
        return styles.statusExpired;
      default:
        return styles.statusDefault;
    }
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const foodName = typeof item.foodId === 'object' ? item.foodId?.name : '';
    const categoryId = typeof item.foodId === 'object' ? item.foodId?.categoryId : '';

    // Filter by search
    const matchesSearch = foodName.toLowerCase().includes(searchText.toLowerCase());

    // Filter by category
    const matchesCategory = selectedCategory === 'all' || categoryId === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={16} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm trong tủ lạnh..."
              placeholderTextColor="#9CA3AF"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="funnel-outline" size={20} color="#4B5563" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewModeButton}
            onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            <Ionicons
              name={viewMode === 'grid' ? 'list' : 'grid-outline'}
              size={20}
              color="#4B5563"
            />
          </TouchableOpacity>
        </View>

        {/* Category Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryLabel,
                selectedCategory === category.id && styles.categoryLabelActive
              ]}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Loading State */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16A34A" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Tủ lạnh trống</Text>
          <Text style={styles.emptyText}>Thêm đồ vào tủ để bắt đầu</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.itemsContainer}
          onScroll={({ nativeEvent }) => {
            // Có thể thêm pull-to-refresh logic ở đây
          }}
          scrollEventThrottle={16}
        >
          {viewMode === 'grid' ? (
            <View style={styles.gridContainer}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.gridItem}
                  onLongPress={() => handleDeleteItem(item._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.gridItemImageContainer}>
                    <Text style={styles.foodEmoji}>🥬</Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusStyle(item.expiredAt)]}>
                    <Text style={styles.statusText}>
                      {fridgeService.formatExpiryDisplay(item.expiredAt)}
                    </Text>
                  </View>
                  <View style={styles.gridItemInfo}>
                    <Text style={styles.gridItemName} numberOfLines={2}>
                      {typeof item.foodId === 'object' ? item.foodId?.name : 'Loading...'}
                    </Text>
                    <Text style={styles.gridItemQuantity}>
                      {item.quantity} {typeof item.unitId === 'object' ? item.unitId?.name : ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.listContainer}>
              {filteredItems.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={styles.listItem}
                  onLongPress={() => handleDeleteItem(item._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.listItemImageContainer}>
                    <Text style={styles.foodEmojiLarge}>🥬</Text>
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemName}>
                      {typeof item.foodId === 'object' ? item.foodId?.name : 'Loading...'}
                    </Text>
                    <Text style={styles.listItemQuantity}>
                      {item.quantity} {typeof item.unitId === 'object' ? item.unitId?.name : ''}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, getStatusStyle(item.expiredAt)]}>
                    <Text style={styles.statusText}>
                      {fridgeService.formatExpiryDisplay(item.expiredAt)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add to Fridge Modal */}
      <AddToFridgeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddFridgeItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    padding: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111827',
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryChipActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#16A34A',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#16A34A',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemsContainer: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 12,
  },
  gridItem: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  gridItemImageContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  foodEmoji: {
    fontSize: 48,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusFresh: {
    backgroundColor: '#D1FAE5',
    borderColor: '#A7F3D0',
  },
  statusExpiring: {
    backgroundColor: '#FED7AA',
    borderColor: '#FDBA74',
  },
  statusExpired: {
    backgroundColor: '#FECACA',
    borderColor: '#FCA5A5',
  },
  statusDefault: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#111827',
  },
  gridItemInfo: {
    padding: 12,
  },
  gridItemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  gridItemQuantity: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContainer: {
    padding: 16,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  listItemImageContainer: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  foodEmojiLarge: {
    fontSize: 36,
  },
  listItemInfo: {
    flex: 1,
  },
  listItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  listItemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 32,
    width: 56,
    height: 56,
    backgroundColor: '#16A34A',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
