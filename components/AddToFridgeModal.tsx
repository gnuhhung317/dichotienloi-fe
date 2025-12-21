import { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddToFridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddToFridgeModal({ isOpen, onClose }: AddToFridgeModalProps) {
  const [quantity, setQuantity] = useState('1');
  const [selectedUnit, setSelectedUnit] = useState('kg');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedQuickDate, setSelectedQuickDate] = useState('');
  const [itemName, setItemName] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    'Cà chua',
    'Cà rốt',
    'Cải thảo',
    'Cải bó xôi',
    'Sữa tươi',
    'Sữa đặc',
    'Thịt bò',
    'Thịt heo',
  ];

  const units = ['kg', 'g', 'l', 'ml', 'quả', 'hộp', 'chai', 'gói', 'bó'];
  const locations = [
    { id: 'fresh', label: 'Ngăn mát', icon: '🌡️' },
    { id: 'frozen', label: 'Ngăn đông', icon: '❄️' },
    { id: 'dry', label: 'Tủ đồ khô', icon: '📦' },
  ];

  const quickDates = [
    { id: '3days', label: '+3 ngày', days: 3 },
    { id: '1week', label: '+1 tuần', days: 7 },
    { id: '1month', label: '+1 tháng', days: 30 },
  ];

  const filteredSuggestions = itemName
    ? suggestions.filter((s) => s.toLowerCase().includes(itemName.toLowerCase()))
    : [];

  const handleQuantityChange = (delta: number) => {
    const current = parseInt(quantity) || 0;
    const newValue = Math.max(1, current + delta);
    setQuantity(newValue.toString());
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
            <TouchableOpacity onPress={onClose}>
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
                onChangeText={(text) => {
                  setItemName(text);
                  setShowSuggestions(text.length > 0);
                }}
                autoFocus
              />
              {/* Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <View style={styles.suggestions}>
                  {filteredSuggestions.map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => {
                        setItemName(suggestion);
                        setShowSuggestions(false);
                      }}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Quantity */}
            <View style={styles.section}>
              <Text style={styles.label}>Số lượng *</Text>
              <View style={styles.quantityRow}>
                <View style={styles.quantityControl}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(-1)}
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
                  />
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(1)}
                  >
                    <Ionicons name="add" size={20} color="#6B7280" />
                  </TouchableOpacity>
                </View>
                <View style={styles.unitPicker}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {units.map((unit) => (
                      <TouchableOpacity
                        key={unit}
                        style={[
                          styles.unitButton,
                          selectedUnit === unit && styles.unitButtonActive,
                        ]}
                        onPress={() => setSelectedUnit(unit)}
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
                    ))}
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

            {/* Storage Location */}
            <View style={styles.section}>
              <Text style={styles.label}>Vị trí *</Text>
              <View style={styles.locationGrid}>
                {locations.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={[
                      styles.locationButton,
                      selectedLocation === location.id && styles.locationButtonActive,
                    ]}
                    onPress={() => setSelectedLocation(location.id)}
                  >
                    <Text style={styles.locationIcon}>{location.icon}</Text>
                    <Text style={styles.locationText}>{location.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!itemName || !selectedLocation) && styles.submitButtonDisabled,
                ]}
                disabled={!itemName || !selectedLocation}
                onPress={() => {
                  console.log('Add to fridge:', { itemName, quantity, selectedUnit, selectedLocation });
                  onClose();
                }}
              >
                <Text style={styles.submitButtonText}>Thêm vào tủ</Text>
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
