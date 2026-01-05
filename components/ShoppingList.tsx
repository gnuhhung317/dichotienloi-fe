import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { shoppingService, ShoppingItem, ShoppingList as ShoppingListType } from '../services/shopping.service';
import groupService, { GroupMember } from '../services/group.service';
import { AddToShoppingListModal } from './AddToShoppingListModal';
import { EditShoppingItemModal } from './EditShoppingItemModal';
import { API_CONFIG } from '../config/app.config';

import { useGroup } from '../context/GroupContext';

export function ShoppingList() {
  const { hasGroup } = useGroup();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);

  // Date Management
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Load initial data
  useEffect(() => {
    if (hasGroup) {
      loadGroupMembers();
      loadShoppingItems(selectedDate);
    } else {
      setIsLoading(false);
    }
  }, [hasGroup]);

  // Reload items when date changes
  useEffect(() => {
    if (hasGroup) {
      loadShoppingItems(selectedDate);
    }
  }, [selectedDate]);

  const loadGroupMembers = async () => {
    try {
      const storedMembers = await groupService.getMyGroupMembers();
      setGroupMembers(storedMembers.members);
    } catch (error) {
      console.error('Load members error:', error);
    }
  };

  const loadShoppingItems = async (date: Date) => {
    try {
      setIsLoading(true);
      const dateStr = date.toISOString(); // Send ISO string, backend handles parsing
      const shoppingItems = await shoppingService.getShoppingItems(dateStr);
      setItems(shoppingItems);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tải danh sách mua sắm');
      console.error('Load shopping items error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleAddItem = async (data: { foodId: string; quantity: number, assignedTo?: string }) => {
    try {
      const newItem = await shoppingService.addItemToShoppingList({
        ...data,
        date: selectedDate.toISOString()
      });
      setItems([...items, newItem]);
      Alert.alert('Thành công', 'Đã thêm vào danh sách mua');
      setShowAddModal(false);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể thêm sản phẩm');
      console.error('Add item error:', error);
    }
  };

  const handleUpdateItem = async (itemId: string, newQuantity: number, assignedTo?: string) => {
    try {
      const updatedItem = await shoppingService.updateItem({ itemId, newQuantity, assignedTo });
      setItems(items.map(item => item._id === itemId ? updatedItem : item));
      Alert.alert('Thành công', 'Đã cập nhật sản phẩm');
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật sản phẩm');
      console.error('Update item error:', error);
    }
  };

  const openEditModal = (item: ShoppingItem) => {
    setEditingItem(item);
    setShowEditModal(true);
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

  // Date Navigation Helpers
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  const formatDate = (date: Date) => {
    if (isToday(date)) return 'Hôm nay';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
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

  if (!hasGroup) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people-outline" size={64} color="#D1D5DB" />
        <Text style={styles.emptyText}>Chưa tham gia nhóm</Text>
        <Text style={styles.emptySubText}>Vui lòng tham gia một nhóm để quản lý mua sắm</Text>
      </View>
    );
  }

  const renderItem = (item: ShoppingItem, isDone: boolean) => {
    // Resolve Assigned User
    let displayUser: { _id: string; displayName: string; avatarUrl?: string } | null = null;

    if (item.assignedTo) {
      if (typeof item.assignedTo === 'object') {
        displayUser = {
          _id: item.assignedTo._id,
          displayName: item.assignedTo.name || 'Unknown',
          avatarUrl: item.assignedTo.avatarUrl
        };
      } else {
        // Try to find in groupMembers if we only have ID (fallback)
        const member = groupMembers.find(m => m.userId === item.assignedTo);
        if (member && member.user) {
          displayUser = {
            _id: member.user._id,
            displayName: member.user.name,
            avatarUrl: member.user.avatarUrl
          };
        }
      }
    }

    return (
      <View key={item._id} style={[styles.itemRow, isDone && styles.itemRowDone]}>
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

        <TouchableOpacity
          style={styles.itemInfo}
          onPress={() => openEditModal(item)}
          activeOpacity={0.7}
        >
          <View style={styles.itemMainRow}>
            <View style={{ flex: 1 }}>
              <Text style={isDone ? styles.itemNameChecked : styles.itemNameDone}>
                {typeof item.foodId === 'object' ? item.foodId.name : 'Loading...'}
              </Text>
              <Text style={styles.itemQuantity}>
                {item.quantity} {typeof item.foodId === 'object' && typeof item.foodId.unitId === 'object' ? item.foodId.unitId.name : ''}
              </Text>
            </View>
            {typeof item.foodId === 'object' && item.foodId.image && (
              <Image
                source={{ uri: `${API_CONFIG.UPLOADS_URL}/${item.foodId.image}` }}
                style={styles.itemImage}
              />
            )}
          </View>

          {/* Assigned User Chip */}
          {displayUser && (
            <View style={styles.assignedChip}>
              {displayUser.avatarUrl ? (
                <Image
                  source={{ uri: `${API_CONFIG.UPLOADS_URL}/${displayUser.avatarUrl}` }}
                  style={styles.assignedAvatar}
                />
              ) : (
                <View style={styles.assignedAvatarPlaceholder}>
                  <Text style={styles.assignedInitials}>
                    {displayUser.displayName ? displayUser.displayName.charAt(0).toUpperCase() : '?'}
                  </Text>
                </View>
              )}
              <Text style={styles.assignedName}>
                {displayUser.displayName}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDeleteItem(item._id)}
        >
          <Ionicons name="trash-outline" size={16} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Navigation Header */}
      <View style={styles.dateHeader}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={24} color="#4B5563" />
        </TouchableOpacity>
        <View style={styles.dateDisplay}>
          <Ionicons name="calendar-outline" size={18} color="#10B981" style={{ marginRight: 8 }} />
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
        </View>
        <TouchableOpacity onPress={() => changeDate(1)} style={styles.navBtn}>
          <Ionicons name="chevron-forward" size={24} color="#4B5563" />
        </TouchableOpacity>
      </View>

      {/* Progress Header */}
      {items.length > 0 && (
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
      )}

      <ScrollView style={styles.listContent}>
        <View style={styles.itemsContainer}>
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="basket-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Danh sách trống</Text>
              <Text style={styles.emptySubText}>Chọn ngày khác hoặc thêm món mới</Text>
            </View>
          ) : (
            <>
              {/* Chưa mua */}
              {unboughtItems.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Chưa mua ({unboughtItems.length})</Text>
                  {unboughtItems.map((item) => renderItem(item, false))}
                </>
              )}

              {/* Đã mua */}
              {boughtItems.length > 0 && (
                <>
                  <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
                    Đã mua ({boughtItems.length})
                  </Text>
                  {boughtItems.map((item) => renderItem(item, true))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView >

      {/* FAB Button */}
      < TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)
        }
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity >

      {/* Add Modal */}
      < AddToShoppingListModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddItem}
        groupMembers={groupMembers}
      />

      <EditShoppingItemModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateItem}
        item={editingItem}
        groupMembers={groupMembers}
      />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    zIndex: 10,
  },
  navBtn: {
    padding: 8,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
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
    paddingBottom: 80,
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
    alignItems: 'flex-start', // Align start to handle varying heights
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
    marginTop: 4, // Align with text
  },
  checkBoxChecked: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  itemInfo: {
    flex: 1,
  },
  itemMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemNameDone: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginLeft: 8,
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
    marginTop: 0,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 16
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
  assignedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 8,
  },
  assignedAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  assignedAvatarPlaceholder: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  assignedInitials: {
    fontSize: 10,
    color: '#1E40AF',
    fontWeight: 'bold',
  },
  assignedName: {
    fontSize: 11,
    color: '#4B5563',
  }

});
