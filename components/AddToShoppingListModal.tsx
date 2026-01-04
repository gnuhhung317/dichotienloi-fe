import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { foodService } from '../services/food.service';

interface AddToShoppingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { foodId: string; quantity: number }) => Promise<void>;
}

export function AddToShoppingListModal({
  isOpen,
  onClose,
  onSubmit,
}: AddToShoppingListModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [itemName, setItemName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [foods, setFoods] = useState<{ name: string; _id: string; unit?: string }[]>([]); // Added unit to state
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>(['kg', 'g', 'l', 'ml', 'quả', 'hộp', 'chai', 'gói', 'bó']);

  // Logic State
  const [isNewItem, setIsNewItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('kg');

  const [isLoadingData, setIsLoadingData] = useState(false);

  // Load foods from API when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDataFromAPI();
      resetForm();
    }
  }, [isOpen]);

  const loadDataFromAPI = async () => {
    try {
      setIsLoadingData(true);
      const foodsInGroup = await foodService.getFoodsInGroup();
      setFoods(foodsInGroup.map(f => ({ name: f.name, _id: f._id, unit: f.unit })));

      const cats = await foodService.getCategoriesAsStrings();
      if (cats.length > 0) setCategories(cats);

      const us = await foodService.getUnitsAsStrings();
      if (us.length > 0) setUnits(us);

    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setIsLoadingData(false);
    }
  };

  const filteredSuggestions = itemName
    ? foods.filter((f) => f.name.toLowerCase().includes(itemName.toLowerCase()))
    : [];

  const handleNameChange = (text: string) => {
    setItemName(text);
    setShowSuggestions(text.length > 0);

    // Check if item exists
    const existingFood = foods.find(f => f.name.toLowerCase() === text.toLowerCase());
    if (existingFood) {
      setIsNewItem(false);
      setSelectedUnit(existingFood.unit || 'kg');
    } else {
      setIsNewItem(true);
      if (!selectedCategory && categories.length > 0) setSelectedCategory(categories[0]);
    }
  };

  const handleSelectSuggestion = (food: { name: string; _id: string; unit?: string }) => {
    setItemName(food.name);
    setShowSuggestions(false);
    setIsNewItem(false);
    setSelectedUnit(food.unit || 'kg');
  };

  const handleQuantityChange = (delta: number) => {
    const current = parseInt(quantity) || 0;
    const newValue = Math.max(1, current + delta);
    setQuantity(newValue.toString());
  };

  const resetForm = () => {
    setItemName('');
    setQuantity('1');
    setIsNewItem(true);
    setShowSuggestions(false);
    if (categories.length > 0) setSelectedCategory(categories[0]);
    if (units.length > 0) setSelectedUnit(units[0]);
  };

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thực phẩm');
      return;
    }

    if (isNewItem && !selectedCategory) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục cho món mới');
      return;
    }

    try {
      setIsSubmitting(true);

      let foodIdToSubmit = '';

      if (isNewItem) {
        // Create new food
        const newFood = await foodService.createFood({
          name: itemName.trim(),
          foodCategoryName: selectedCategory,
          unitName: selectedUnit
        });
        foodIdToSubmit = newFood._id;
        // Update local list
        setFoods([...foods, { name: newFood.name, _id: newFood._id, unit: newFood.unit }]);
      } else {
        // Find existing ID
        const existing = foods.find(f => f.name.toLowerCase() === itemName.trim().toLowerCase());
        if (existing) {
          foodIdToSubmit = existing._id;
        } else {
          // Fallback (shouldn't happen if isNewItem logic is correct)
          Alert.alert('Lỗi', 'Không tìm thấy thực phẩm');
          return;
        }
      }

      // Submit to API
      await onSubmit({
        foodId: foodIdToSubmit,
        quantity: parseInt(quantity) || 1,
      });

      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào danh sách mua sắm');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Thêm vào danh sách mua</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isLoadingData ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
              </View>
            ) : (
              <>
                {/* Item Name / Selection */}
                <View style={styles.section}>
                  <Text style={styles.label}>Tên thực phẩm *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="VD: Cà chua, Sữa tươi..."
                    placeholderTextColor="#9CA3AF"
                    value={itemName}
                    onChangeText={handleNameChange}
                    editable={!isSubmitting}
                  />

                  {/* Suggestions Dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <View style={styles.suggestions}>
                      {filteredSuggestions.slice(0, 5).map((food) => (
                        <TouchableOpacity
                          key={food._id}
                          style={styles.suggestionItem}
                          onPress={() => handleSelectSuggestion(food)}
                        >
                          <Text style={styles.suggestionText}>{food.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Category for New Items */}
                {isNewItem && (
                  <View style={styles.section}>
                    <Text style={styles.label}>Danh mục *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                      {categories.map((cat) => (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.chip,
                            selectedCategory === cat && styles.chipActive
                          ]}
                          onPress={() => setSelectedCategory(cat)}
                          disabled={isSubmitting}
                        >
                          <Text style={[
                            styles.chipText,
                            selectedCategory === cat && styles.chipTextActive
                          ]}>{cat}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Quantity & Unit */}
                <View style={styles.section}>
                  <Text style={styles.label}>Số lượng & Đơn vị</Text>
                  <View style={styles.row}>
                    <View style={styles.quantityControl}>
                      <TouchableOpacity
                        style={styles.quantityBtn}
                        onPress={() => handleQuantityChange(-1)}
                        disabled={isSubmitting}
                      >
                        <Ionicons name="remove" size={20} color="#6B7280" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.quantityInput}
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={(text) => setQuantity(text || '1')}
                        editable={!isSubmitting}
                      />
                      <TouchableOpacity
                        style={styles.quantityBtn}
                        onPress={() => handleQuantityChange(1)}
                        disabled={isSubmitting}
                      >
                        <Ionicons name="add" size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>

                    {/* Unit Picker */}
                    <View style={styles.unitPicker}>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {isNewItem ? (
                          units.map(u => (
                            <TouchableOpacity
                              key={u}
                              style={[styles.unitBtn, selectedUnit === u && styles.unitBtnActive]}
                              onPress={() => setSelectedUnit(u)}
                              disabled={isSubmitting}
                            >
                              <Text style={[styles.unitText, selectedUnit === u && styles.unitTextActive]}>{u}</Text>
                            </TouchableOpacity>
                          ))
                        ) : (
                          <View style={[styles.unitBtn, styles.unitBtnActive]}>
                            <Text style={[styles.unitText, styles.unitTextActive]}>{selectedUnit}</Text>
                          </View>
                        )}
                      </ScrollView>
                    </View>
                  </View>
                </View>
              </>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn]}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelBtnText}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.submitBtn,
                (!itemName.trim() || (isNewItem && !selectedCategory)) && styles.submitBtnDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || !itemName.trim() || (isNewItem && !selectedCategory)}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>Thêm vào danh sách</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
  },
  suggestions: {
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    maxHeight: 150,
  },
  suggestionItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  suggestionText: {
    fontSize: 14,
    color: '#111827',
  },
  infoBox: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#16A34A',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
  },
  chipTextActive: {
    color: '#16A34A',
    fontWeight: '600',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 140,
  },
  quantityBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitPicker: {
    flex: 1,
    overflow: 'hidden',
  },
  unitBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
  },
  unitBtnActive: {
    backgroundColor: '#D1FAE5',
    borderColor: '#16A34A',
  },
  unitText: {
    color: '#374151',
    fontSize: 14,
  },
  unitTextActive: {
    color: '#16A34A',
    fontWeight: '600',
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#F3F4F6',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitBtn: {
    backgroundColor: '#10B981',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
