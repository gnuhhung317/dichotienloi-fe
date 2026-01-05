import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { foodService } from '../services/food.service';
import { fridgeService } from '../services/fridge.service';

interface CreateCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCustomItemModal({ isOpen, onClose, onSuccess }: CreateCustomItemModalProps) {
  const [selectedIcon, setSelectedIcon] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [defaultExpiry, setDefaultExpiry] = useState(3);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dbCategories, setDbCategories] = useState<{ id: string, name: string }[]>([]);

  const foodIcons = [
    { id: 'vegetables', icon: '🥬', label: 'Rau' },
    { id: 'carrot', icon: '🥕', label: 'Củ' },
    { id: 'meat', icon: '🥩', label: 'Thịt' },
    { id: 'chicken', icon: '🍗', label: 'Gà' },
    { id: 'fish', icon: '🐟', label: 'Cá' },
    { id: 'shrimp', icon: '🦐', label: 'Tôm' },
    { id: 'milk', icon: '🥛', label: 'Sữa' },
    { id: 'cheese', icon: '🧀', label: 'Phô mai' },
    { id: 'egg', icon: '🥚', label: 'Trứng' },
    { id: 'bread', icon: '🍞', label: 'Bánh' },
    { id: 'rice', icon: '🍚', label: 'Cơm' },
    { id: 'noodle', icon: '🍜', label: 'Mì' },
    { id: 'fruit', icon: '🍎', label: 'Trái cây' },
    { id: 'sauce', icon: '🧂', label: 'Gia vị' },
    { id: 'drink', icon: '🥤', label: 'Đồ uống' },
    { id: 'dessert', icon: '🍰', label: 'Tráng miệng' },
    { id: 'frozen', icon: '❄️', label: 'Đông lạnh' },
    { id: 'canned', icon: '🥫', label: 'Đồ hộp' },
    { id: 'snack', icon: '🍿', label: 'Snack' },
    { id: 'other', icon: '📦', label: 'Khác' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  const loadMetadata = async () => {
    try {
      const cats = await foodService.getCategoriesAsStrings();
      setDbCategories(cats.map(c => ({ id: c, name: c })));
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });
    }

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setSelectedIcon(''); // Clear icon if image is picked
    }
  };

  const getCategoryIcon = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('rau') || lower.includes('củ')) return '🥬';
    if (lower.includes('thịt')) return '🥩';
    if (lower.includes('cá') || lower.includes('hải sản')) return '🐟';
    if (lower.includes('sữa') || lower.includes('trứng')) return '🥛';
    if (lower.includes('đông lạnh')) return '❄️';
    if (lower.includes('đồ uống')) return '🥤';
    if (lower.includes('bánh')) return '🍞';
    if (lower.includes('gia vị')) return '🧂';
    if (lower.includes('ăn vặt')) return '🍿';
    return '📦';
  };

  const handleSubmit = async () => {
    if (!itemName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên món');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Lỗi', 'Vui lòng chọn danh mục');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Create Food
      const newFood = await foodService.createFood({
        name: itemName.trim(),
        foodCategoryName: selectedCategory,
        unitName: 'kg', // Default unit for custom items for now
        image: imageUri || undefined
      });

      // 2. Add to Fridge
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + defaultExpiry);

      await fridgeService.createFridgeItem({
        foodName: newFood.name, // The backend likely resolves this by name or we might need to update createFridgeItem to take ID if possible. 
        // Looking at fridgeService.createFridgeItem, it takes CreateFridgeItemDTO { foodName, quantity, expiredAt }. 
        // The backend ideally uses foodName to find the Food. Since we just created it, it should be found.
        quantity: 1, // Default quantity
        expiredAt: expiryDate.toISOString()
      });

      Alert.alert('Thành công', 'Đã tạo món mới và thêm vào tủ lạnh!');

      if (onSuccess) onSuccess();
      handleClose();

    } catch (error: any) {
      console.error(error);
      Alert.alert('Lỗi', error.message || 'Không thể tạo món mới');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Reset state
    setItemName('');
    setSelectedCategory('');
    setSelectedIcon('');
    setImageUri(null);
    setDefaultExpiry(3);
    setDescription('');
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Tạo món mới</Text>
            <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Image Upload Options */}
            <View style={styles.section}>
              <Text style={styles.label}>Hình ảnh đại diện</Text>
              <View style={styles.uploadRow}>
                <TouchableOpacity
                  style={[styles.uploadButton, styles.uploadButtonGreen]}
                  onPress={() => pickImage(true)}
                  disabled={isSubmitting}
                >
                  <Ionicons name="camera" size={32} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Chụp ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.uploadButton, styles.uploadButtonBlue]}
                  onPress={() => pickImage(false)}
                  disabled={isSubmitting}
                >
                  <Ionicons name="images" size={32} color="#FFFFFF" />
                  <Text style={styles.uploadButtonText}>Thư viện</Text>
                </TouchableOpacity>
              </View>
              {imageUri && (
                <View style={styles.previewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.previewImage} />
                  <TouchableOpacity
                    style={styles.removeImageBtn}
                    onPress={() => setImageUri(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
              {!imageUri && <Text style={styles.hint}>Hoặc chọn icon bên dưới</Text>}
            </View>

            {/* Icon Selection */}
            {!imageUri && (
              <View style={styles.section}>
                <Text style={styles.label}>Chọn icon</Text>
                <View style={styles.iconGrid}>
                  <ScrollView
                    style={styles.iconScrollView}
                    showsVerticalScrollIndicator={false}
                  >
                    <View style={styles.iconGridInner}>
                      {foodIcons.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.iconButton,
                            selectedIcon === item.id && styles.iconButtonActive,
                          ]}
                          onPress={() => setSelectedIcon(item.id)}
                          disabled={isSubmitting}
                        >
                          <Text style={styles.iconEmoji}>{item.icon}</Text>
                          <Text
                            style={[
                              styles.iconLabel,
                              selectedIcon === item.id && styles.iconLabelActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Item Name */}
            <View style={styles.section}>
              <Text style={styles.label}>Tên hiển thị *</Text>
              <TextInput
                style={styles.input}
                placeholder="VD: Dưa muối mẹ làm, Thịt kho tàu..."
                placeholderTextColor="#9CA3AF"
                value={itemName}
                onChangeText={setItemName}
                editable={!isSubmitting}
              />
              <Text style={styles.hint}>{t('modal.easyNameHint')}</Text>
            </View>

            {/* Category Selection */}
            <View style={styles.section}>
              <Text style={styles.label}>Danh mục *</Text>
              <View style={styles.categoryGrid}>
                {dbCategories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.name && styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category.name)}
                    disabled={isSubmitting}
                  >
                    <Text style={styles.categoryIcon}>{getCategoryIcon(category.name)}</Text>
                    <Text style={styles.categoryLabel}>{category.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Default Expiry Slider */}
            <View style={styles.section}>
              <Text style={styles.label}>Hạn sử dụng mặc định</Text>
              <View style={styles.sliderContainer}>
                <View style={styles.sliderRow}>
                  <View style={styles.sliderTrack}>
                    <View
                      style={[
                        styles.sliderFill,
                        { width: `${(defaultExpiry / 30) * 100}%` }, // Scale to 30 days visual for better UX or 365
                      ]}
                    />
                  </View>
                  <View style={styles.sliderValue}>
                    <Text style={styles.sliderValueText}>{defaultExpiry}</Text>
                  </View>
                </View>
                <View style={styles.sliderButtons}>
                  <TouchableOpacity
                    style={styles.sliderButton}
                    onPress={() => setDefaultExpiry(Math.max(1, defaultExpiry - 1))}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="remove" size={20} color="#374151" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sliderButton}
                    onPress={() => setDefaultExpiry(Math.min(365, defaultExpiry + 1))}
                    disabled={isSubmitting}
                  >
                    <Ionicons name="add" size={20} color="#374151" />
                  </TouchableOpacity>
                </View>
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabelText}>1 ngày</Text>
                  <Text style={styles.sliderLabelText}>Lâu dài</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.infoText}>
                    💡 Khi thêm món này vào tủ lạnh, app sẽ tự điền {defaultExpiry} ngày sử dụng
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Mô tả (tùy chọn)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="VD: Món này thường để ở ngăn mát..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                editable={!isSubmitting}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose} disabled={isSubmitting}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!itemName || !selectedCategory) && styles.submitButtonDisabled,
                ]}
                disabled={!itemName || !selectedCategory || isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitButtonText}>Tạo món</Text>
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
    height: '90%',
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
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 12,
    fontWeight: '500',
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadButtonGreen: {
    backgroundColor: '#16A34A',
  },
  uploadButtonBlue: {
    backgroundColor: '#2563EB',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  previewContainer: {
    marginTop: 12,
    alignItems: 'center',
    position: 'relative',
    width: 120, // thumbnail size
    height: 120,
    alignSelf: 'center'
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 12
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  iconGrid: {
    height: 200,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
  },
  iconScrollView: {
    flex: 1,
  },
  iconGridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  iconButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  iconButtonActive: {
    backgroundColor: '#16A34A',
  },
  iconEmoji: {
    fontSize: 24,
  },
  iconLabel: {
    fontSize: 10,
    color: '#374151',
    textAlign: 'center',
  },
  iconLabelActive: {
    color: '#FFFFFF',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    width: '31%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    alignItems: 'center',
    gap: 4,
  },
  categoryButtonActive: {
    borderColor: '#16A34A',
    backgroundColor: '#D1FAE5',
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  sliderContainer: {
    gap: 12,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#16A34A',
  },
  sliderValue: {
    width: 60,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
  },
  sliderValueText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  sliderButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  sliderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#6B7280',
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 12,
    padding: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#1E40AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
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
