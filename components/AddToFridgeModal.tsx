import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { foodService } from '../services/food.service';

interface AddToFridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export function AddToFridgeModal({ isOpen, onClose, onSubmit }: AddToFridgeModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('kg');
  // const [selectedLocation, setSelectedLocation] = useState(''); // Removed as per plan
  const [selectedQuickDate, setSelectedQuickDate] = useState('3days');
  const [itemName, setItemName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data State
  const [units, setUnits] = useState<string[]>(['kg', 'g', 'l', 'ml', 'quả', 'hộp', 'chai', 'gói', 'bó']);
  const [categories, setCategories] = useState<string[]>([]);
  const [foods, setFoods] = useState<{ name: string; unit: string }[]>([]); // Store name and unit
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Logic State
  const [isNewItem, setIsNewItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const quickDates = [
    { id: '3days', label: '+3 ngày', days: 3 },
    { id: '1week', label: '+1 tuần', days: 7 },
    { id: '1month', label: '+1 tháng', days: 30 },
  ];

  // Load units, categories and foods from API when modal opens
  useEffect(() => {
    if (isOpen) {
      loadDataFromAPI();
      resetForm();
    }
  }, [isOpen]);

  const loadDataFromAPI = async () => {
    try {
      setIsLoadingData(true);

      // Load units
      const unitsData = await foodService.getUnitsAsStrings();
      if (unitsData.length > 0) {
        setUnits(unitsData);
        setSelectedUnit(unitsData[0]);
      }

      // Load categories
      const categoriesData = await foodService.getCategoriesAsStrings();
      if (categoriesData.length > 0) setCategories(categoriesData);

      // Load foods for suggestions
      const foodsInGroup = await foodService.getFoodsInGroup();
      setFoods(foodsInGroup.map((f) => ({ name: f.name, unit: f.unit || 'kg' })));
    } catch (error) {
      console.error('Load data error:', error);
      // Keep default values if API fails
    } finally {
      setIsLoadingData(false);
    }
  };

  const filteredSuggestions = itemName
    ? foods.filter((f) => f.name.toLowerCase().includes(itemName.toLowerCase())).map(f => f.name)
    : [];

  const handleNameChange = (text: string) => {
    setItemName(text);
    setShowSuggestions(text.length > 0);

    // Check if item exists exact match case-insensitive
    const existingFood = foods.find(f => f.name.toLowerCase() === text.toLowerCase());
    if (existingFood) {
      setIsNewItem(false);
      setSelectedUnit(existingFood.unit); // Auto-set unit
    } else {
      setIsNewItem(true);
      // If switching to new item, reset category if needed, or keep previous
      if (!selectedCategory && categories.length > 0) setSelectedCategory(categories[0]);
    }
  };

  const handleSelectSuggestion = (name: string) => {
    setItemName(name);
    setShowSuggestions(false);

    const existingFood = foods.find(f => f.name === name);
    if (existingFood) {
      setIsNewItem(false);
      setSelectedUnit(existingFood.unit);
    }
  };

  const handleQuantityChange = (delta: number) => {
    const current = parseInt(quantity) || 0;
    const newValue = Math.max(1, current + delta);
    setQuantity(newValue.toString());
  };

  const calculateExpiryDate = () => {
    const selected = quickDates.find((d) => d.id === selectedQuickDate);
    if (!selected) return new Date().toISOString();

    const date = new Date();
    date.setDate(date.getDate() + selected.days);
    return date.toISOString();
  };

  const resetForm = () => {
    setItemName('');
    setQuantity('1');
    setSelectedUnit(units[0] || 'kg');
    setSelectedQuickDate('3days');
    setShowSuggestions(false);
    setIsNewItem(true);
    if (categories.length > 0) setSelectedCategory(categories[0]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!itemName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên món');
      return;
    }

    if (isNewItem && !selectedCategory) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục cho món mới');
      return;
    }

    try {
      setIsSubmitting(true);

      // If new item, create food first
      if (isNewItem) {
        await foodService.createFood({
          name: itemName.trim(),
          foodCategoryName: selectedCategory,
          unitName: selectedUnit
        });
        // Refresh local foods list after create? Optional but good for consistency
        const newFood = { name: itemName.trim(), unit: selectedUnit };
        setFoods([...foods, newFood]);
      }

      await onSubmit({
        foodName: itemName.trim(),
        quantity: parseInt(quantity) || 1,
        // unit: selectedUnit, // No need to send unit if backend ignores it for existing, but for new item we just created it with this unit.
        // location: selectedLocation, // Backend ignores
        expiredAt: calculateExpiryDate(),
      });

      resetForm();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi thêm vào tủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Thêm đồ vào tủ</Text>
            <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Item Name */}
            <View style={styles.section}>
              <Text style={styles.label}>Tên món *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Cà chua, Sữa tươi..."
                placeholderTextColor="#9CA3AF"
                value={itemName}
                onChangeText={(text) => handleNameChange(text)}
                autoFocus
                editable={!isSubmitting}
              />
              {/* Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {filteredSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => handleSelectSuggestion(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Category (Only for new items) */}
            {isNewItem && (
              <View style={styles.section}>
                <Text style={styles.label}>Danh mục *</Text>
                <View style={styles.unitPicker}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.unitButton,
                          selectedCategory === cat && styles.unitButtonActive,
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                        disabled={isSubmitting}
                      >
                        <Text
                          style={[
                            styles.unitText,
                            selectedCategory === cat && styles.unitTextActive,
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Quantity */}
            <View style={styles.section}>
              <Text style={styles.label}>Số lượng *</Text>
              <View style={styles.quantityRow}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(-1)}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="remove" size={20} color="#6B7280" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.quantityInput}
                    value={quantity}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 1;
                      setQuantity(Math.max(1, num).toString());
                    }}
                    keyboardType="numeric"
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(1)}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="add" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Unit Selection - readonly if existing item */}
                <View style={styles.unitPicker}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {isNewItem ? (
                      units.map((unit) => (
                        <TouchableOpacity
                          key={unit}
                          style={[
                            styles.unitButton,
                            selectedUnit === unit && styles.unitButtonActive,
                          ]}
                          onPress={() => setSelectedUnit(unit)}
                          disabled={isSubmitting}
                        >
                          <Text
                            style={[
                              styles.unitText,
                              selectedUnit === unit && styles.unitTextActive,
                            ]}
                          >
                            {unit}
                          </Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <View style={[styles.unitButton, styles.unitButtonActive]}>
                        <Text style={styles.unitTextActive}>{selectedUnit}</Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Quick Date */}
            <View style={styles.section}>
              <Text style={styles.label}>Hạn sử dụng *</Text>
              <View style={styles.chipRow}>
                {quickDates.map((date) => (
                  <TouchableOpacity
                    key={date.id}
                    style={[
                      styles.chip,
                      selectedQuickDate === date.id && styles.chipActive,
                    ]}
                    onPress={() => setSelectedQuickDate(date.id)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedQuickDate === date.id && styles.chipTextActive,
                      ]}
                    >
                      {date.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!itemName || (isNewItem && !selectedCategory) || isSubmitting) && styles.submitButtonDisabled,
                ]}
                disabled={!itemName || (isNewItem && !selectedCategory) || isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Thêm vào tủ</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  suggestions: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    maxHeight: 150,
  },
  suggestionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#111827',
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quantityControl: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 12,
    backgroundColor: '#F9FAFB',
  },
  quantityInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    color: '#111827',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D1D5DB',
  },
  unitPicker: {
    width: 100,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginRight: 4,
    backgroundColor: '#FFFFFF',
  },
  unitButtonActive: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  unitText: {
    fontSize: 14,
    color: '#374151',
  },
  unitTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  chipActive: {
    backgroundColor: '#16A34A',
  },
  chipText: {
    fontSize: 14,
    color: '#374151',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  locationGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  locationButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  locationButtonActive: {
    borderColor: '#16A34A',
    backgroundColor: '#D1FAE5',
  },
  locationIcon: {
    fontSize: 24,
  },
  locationText: {
    fontSize: 12,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#16A34A',
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
