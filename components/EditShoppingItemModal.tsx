import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShoppingItem } from '../services/shopping.service';
import { API_CONFIG } from '../config/app.config';

interface EditShoppingItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (itemId: string, newQuantity: number) => Promise<void>;
    item: ShoppingItem | null;
}

export function EditShoppingItemModal({
    isOpen,
    onClose,
    onSubmit,
    item,
}: EditShoppingItemModalProps) {
    const [quantity, setQuantity] = useState('1');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && item) {
            setQuantity(item.quantity.toString());
        }
    }, [isOpen, item]);

    const handleQuantityChange = (delta: number) => {
        const current = parseFloat(quantity) || 0;
        const newValue = Math.max(0.1, current + delta);
        // Round to 1 decimal place to avoid floating point issues
        setQuantity(Math.round(newValue * 10) / 10 + '');
    };

    const handleSubmit = async () => {
        if (!item) return;

        const val = parseFloat(quantity.replace(',', '.'));
        if (!val || val <= 0) {
            Alert.alert('Lỗi', 'Số lượng không hợp lệ');
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmit(item._id, val);
            onClose();
        } catch (error) {
            // Error handled in parent
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!item) return null;

    const foodName = typeof item.foodId === 'object' ? item.foodId.name : 'Sản phẩm';
    const unitName = typeof item.foodId === 'object' && typeof item.foodId.unitId === 'object' ? item.foodId.unitId.name : '';
    const imageUrl = typeof item.foodId === 'object' && item.foodId.image ? `${API_CONFIG.UPLOADS_URL}/${item.foodId.image}` : null;

    return (
        <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Chỉnh sửa số lượng</Text>
                        <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.itemInfo}>
                            {imageUrl ? (
                                <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Ionicons name="cube-outline" size={32} color="#9CA3AF" />
                                </View>
                            )}
                            <View>
                                <Text style={styles.itemName}>{foodName}</Text>
                                {unitName ? <Text style={styles.itemUnit}>Đơn vị: {unitName}</Text> : null}
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>Số lượng</Text>
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
                                    value={quantity.toString()}
                                    onChangeText={setQuantity}
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
                        </View>
                    </View>

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
                            style={[styles.btn, styles.submitBtn]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>Lưu thay đổi</Text>
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
        paddingBottom: 20,
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
        padding: 16,
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 12,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    placeholderImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    itemUnit: {
        fontSize: 14,
        color: '#6B7280',
    },
    section: {
        marginBottom: 20,
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 8,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    quantityBtn: {
        width: 44,
        height: 44,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    quantityInput: {
        width: 80,
        height: 44,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
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
    submitBtnText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
