import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shoppingService, ShoppingItem } from '../services/shopping.service';
import { AddToShoppingListModal } from './AddToShoppingListModal';

import { useGroup } from '../context/GroupContext';

export function ShoppingList() {
  const { hasGroup } = useGroup();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Load shopping list on mount
  useEffect(() => {
    if (hasGroup) {
      loadShoppingItems();
    } else {
      setIsLoading(false);
    }
  }, [hasGroup]);

  const loadShoppingItems = async () => {
    try {
      setIsLoading(true);
      const shoppingItems = await shoppingService.getShoppingItems();
      setItems(shoppingItems);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải danh sách mua sắm');
      console.error('Load shopping items error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddItem = async (data: { foodId: string; quantity: number }) => {
    try {
      const newItem = await shoppingService.addItemToShoppingList(data);
      setItems([...items, newItem]);
      Alert.alert('Thành công', 'Đã thêm vào danh sách mua');
      setShowAddModal(false);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể thêm sản phẩm');
      console.error('Add item error:', error);
    }
  };

  const handleMarkAsBought = async (itemId: string, currentStatus: boolean) => {
    try {
      const updatedItem = await shoppingService.markItemAsBought({
        itemId,
        isBought: !currentStatus,
      });
      setItems(items.map((item) => (item._id === itemId ? updatedItem : item)));
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật');
      console.error('Mark as bought error:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert('Xóa', 'Bạn chắc chắn muốn xóa sản phẩm này?', [
      { text: 'Hủy', onPress: () => { } },
      {
        text: 'Xóa',
        onPress: async () => {
          try {
            await shoppingService.deleteItem(itemId);
            setItems(items.filter((item) => item._id !== itemId));
            Alert.alert('Thành công', 'Đã xóa sản phẩm');
          } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa');
            console.error('Delete item error:', error);
          }
        },
      },
    ]);
  };

  // Calculate stats
  const boughtItems = items.filter(item => item.is_bought);
  const unboughtItems = items.filter(item => !item.is_bought);
  const progress = items.length > 0 ? (boughtItems.length / items.length) * 100 : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 8, color: '#6B7280' }}>Đang tải...</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="basket-outline" size={48} color="#D1D5DB" />
        <Text style={styles.emptyText}>Danh sách mua trống</Text>
        <Text style={styles.emptySubText}>Nhấn + để thêm sản phẩm</Text>
      </View>
    );
  }

  if (!hasGroup) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>Chưa tham gia nhóm</Text>
        <Text style={styles.emptySubText}>Vui lòng tham gia một nhóm để quản lý mua sắm</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressTitleRow}>
          <Text style={styles.progressTitle}>Danh sách mua sắm</Text>
          <Text style={styles.progressCount}>
            {boughtItems.length}/{items.length}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${progress}%` },
            ]}
          />
        </View>
      </View>

      <ScrollView style={styles.listContent}>
        <View style={styles.itemsContainer}>
          {/* Chưa mua */}
          {unboughtItems.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Chưa mua ({unboughtItems.length})</Text>
              {unboughtItems.map((item) => (
                <View key={item._id} style={styles.itemRow}>
                  <TouchableOpacity
                    style={styles.checkBox}
                    onPress={() => handleMarkAsBought(item._id, item.is_bought)}
                  >
                    <View style={item.is_bought ? styles.checkBoxChecked : {}}>
                      {item.is_bought && (
                        <Ionicons name="checkmark" size={16} color="#10B981" />
                      )}
                    </View>
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNameDone}>
                      {typeof item.foodId === 'object' ? item.foodId.name : 'Loading...'}
                    </Text>
                    {typeof item.foodId === 'object' && item.foodId.image && (
                      <Image
                        source={{ uri: `http://localhost:4000/uploads/${item.foodId.image}` }}
                        style={styles.itemImage}
                      />
                    )}
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {typeof item.foodId === 'object' && typeof item.foodId.unitId === 'object' ? item.foodId.unitId.name : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteItem(item._id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}

          {/* Đã mua */}
          {boughtItems.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                Đã mua ({boughtItems.length})
              </Text>
              {boughtItems.map((item) => (
                <View key={item._id} style={[styles.itemRow, styles.itemRowDone]}>
                  <TouchableOpacity
                    style={styles.checkBox}
                    onPress={() => handleMarkAsBought(item._id, item.is_bought)}
                  >
                    <View style={styles.checkBoxChecked}>
                      <Ionicons name="checkmark" size={16} color="#10B981" />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemNameChecked}>
                      {typeof item.foodId === 'object' ? item.foodId.name : 'Loading...'}
                    </Text>
                    {typeof item.foodId === 'object' && item.foodId.image && (
                      <Image
                        source={{ uri: `http://localhost:4000/uploads/${item.foodId.image}` }}
                        style={styles.itemImage}
                      />
                    )}
                    <Text style={styles.itemQuantity}>
                      {item.quantity} {typeof item.foodId === 'object' && typeof item.foodId.unitId === 'object' ? item.foodId.unitId.name : ''}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteItem(item._id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add Modal */}
      <AddToShoppingListModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  progressHeader: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  progressTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  progressCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  listContent: {
    flex: 1,
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginVertical: 12,
    marginLeft: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemRowDone: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkBoxChecked: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  itemInfo: {
    flex: 1,
  },
  itemNameDone: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textDecorationLine: 'none',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginTop: 4,
  },
  itemNameChecked: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontSize: 14,
    fontWeight: '500',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
});
