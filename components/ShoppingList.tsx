import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AddToShoppingListModal } from './AddToShoppingListModal';

interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  quantity: string;
  checked: boolean;
  addedBy: string;
}

export function ShoppingList() {
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: 1, name: 'Cà chua', category: 'Rau củ', quantity: '5 quả', checked: false, addedBy: 'Minh' },
    { id: 2, name: 'Sữa tươi', category: 'Sữa', quantity: '2 hộp', checked: false, addedBy: 'Lan' },
    { id: 3, name: 'Thịt bò', category: 'Thịt', quantity: '500g', checked: false, addedBy: 'Minh' },
    { id: 4, name: 'Bánh mì', category: 'Bánh', quantity: '1 ổ', checked: true, addedBy: 'Lan' },
    { id: 5, name: 'Trứng gà', category: 'Sữa', quantity: '10 quả', checked: false, addedBy: 'Minh' },
  ]);

  const [newItem, setNewItem] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Rau củ', 'Sữa', 'Thịt', 'Bánh']));
  const [showAddModal, setShowAddModal] = useState(false);

  const toggleItem = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (newItem.trim()) {
      const newId = Math.max(...items.map((i) => i.id), 0) + 1;
      setItems((prev) => [
        ...prev,
        {
          id: newId,
          name: newItem,
          category: 'Khác',
          quantity: '1',
          checked: false,
          addedBy: 'Bạn',
        },
      ]);
      setNewItem('');
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const uncheckedItems = items.filter((item) => !item.checked);
  const checkedItems = items.filter((item) => item.checked);
  const progress = items.length > 0 ? (checkedItems.length / items.length) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressTitleRow}>
          <Text style={styles.progressTitle}>Danh sách mua sắm</Text>
          <Text style={styles.progressCount}>
            {checkedItems.length}/{items.length}
          </Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
        </View>
      </View>

      {/* Quick Add */}
      <View style={styles.quickAddContainer}>
        <View style={styles.quickAddRow}>
          <TextInput
            style={styles.quickAddInput}
            value={newItem}
            onChangeText={setNewItem}
            onSubmitEditing={addItem}
            placeholder="Thêm nhanh..."
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity style={styles.quickAddBtn} onPress={addItem}>
            <Ionicons name="add" size={20} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailAddBtn} onPress={() => setShowAddModal(true)}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.detailAddText}>Chi tiết</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Shopping List */}
      <ScrollView style={styles.listContainer}>
        {/* Unchecked Items - Grouped by Category */}
        <View style={styles.listContent}>
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            const uncheckedCategoryItems = categoryItems.filter((item) => !item.checked);
            if (uncheckedCategoryItems.length === 0) return null;

            const isExpanded = expandedCategories.has(category);

            return (
              <View key={category} style={styles.categorySection}>
                <TouchableOpacity
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(category)}
                >
                  <View style={styles.categoryTitleRow}>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{uncheckedCategoryItems.length}</Text>
                    </View>
                  </View>
                  <Ionicons 
                    name={isExpanded ? "chevron-up" : "chevron-down"} 
                    size={16} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.categoryItems}>
                    {uncheckedCategoryItems.map((item) => (
                      <View key={item.id} style={styles.itemCard}>
                        <TouchableOpacity
                          style={styles.checkbox}
                          onPress={() => toggleItem(item.id)}
                        >
                          <View style={item.checked ? styles.checkboxChecked : styles.checkboxUnchecked}>
                            {item.checked && <Ionicons name="checkmark" size={16} color="#16A34A" />}
                          </View>
                        </TouchableOpacity>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName}>{item.name}</Text>
                          <View style={styles.itemMeta}>
                            <Text style={styles.itemMetaText}>{item.quantity}</Text>
                            <Text style={styles.itemMetaText}>•</Text>
                            <Text style={styles.itemMetaText}>Thêm bởi {item.addedBy}</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => deleteItem(item.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Checked Items */}
        {checkedItems.length > 0 && (
          <View style={styles.checkedSection}>
            <Text style={styles.checkedTitle}>Đã mua ({checkedItems.length})</Text>
            <View style={styles.checkedItems}>
              {checkedItems.map((item) => (
                <View key={item.id} style={styles.checkedItemCard}>
                  <TouchableOpacity
                    style={styles.checkbox}
                    onPress={() => toggleItem(item.id)}
                  >
                    <View style={styles.checkboxChecked}>
                      <Ionicons name="checkmark" size={16} color="#16A34A" />
                    </View>
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text style={styles.checkedItemName}>{item.name}</Text>
                    <Text style={styles.checkedItemQuantity}>{item.quantity}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => deleteItem(item.id)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {showAddModal && (
        <AddToShoppingListModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 14,
    color: '#4B5563',
  },
  quickAddContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAddInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    fontSize: 14,
    color: '#111827',
  },
  quickAddBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#16A34A',
    borderRadius: 12,
  },
  detailAddText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryItems: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  checkbox: {
    padding: 4,
  },
  checkboxUnchecked: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderRadius: 4,
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    backgroundColor: '#D1FAE5',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  itemMetaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteBtn: {
    padding: 8,
  },
  checkedSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  checkedTitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 12,
  },
  checkedItems: {
    gap: 8,
  },
  checkedItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  checkedItemName: {
    fontSize: 16,
    color: '#6B7280',
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  checkedItemQuantity: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
