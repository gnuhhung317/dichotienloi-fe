import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { FridgeItem, fridgeService } from '../services/fridge.service';
import { foodService } from '../services/food.service';
import { API_CONFIG } from '../config/app.config';

interface EditFridgeItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (itemId: string, data: { quantity?: number; expiredAt?: string }) => Promise<void>;
    item: FridgeItem | null;
}

export function EditFridgeItemModal({
    isOpen,
    onClose,
    onSubmit,
    item,
}: EditFridgeItemModalProps) {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState('1');
    const [expiryDate, setExpiryDate] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && item) {
            setQuantity(item.quantity.toString());
            if (item.expiredAt) {
                // Format to YYYY-MM-DD for easier editing
                const date = new Date(item.expiredAt);
                // Adjust for timezone offset if needed, but simplistic YYYY-MM-DD is ok
                const dateString = date.toISOString().split('T')[0];
                setExpiryDate(dateString);
            } else {
                setExpiryDate('');
            }
            if (typeof item.foodId === 'object' && item.foodId.image) {
                setSelectedImage(item.foodId.image.startsWith('http') ? item.foodId.image : `${API_CONFIG.UPLOADS_URL}/${item.foodId.image}`);
            } else {
                setSelectedImage(null);
            }
        }
    }, [isOpen, item]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    const handleQuantityChange = (delta: number) => {
        const current = parseFloat(quantity) || 0;
        const newValue = Math.max(0.1, current + delta);
        setQuantity(Math.round(newValue * 10) / 10 + '');
    };

    const handleExtendExpiry = (days: number) => {
        const current = new Date(expiryDate || new Date());
        current.setDate(current.getDate() + days);
        setExpiryDate(current.toISOString().split('T')[0]);
    };

    const handleSubmit = async () => {
        if (!item) return;

        const val = parseFloat(quantity.replace(',', '.'));
        if (!val || val <= 0) {
            Alert.alert(t('modal.error'), t('fridge.invalidQuantity'));
            return;
        }

        // Validate Date
        let finalDate = undefined;
        if (expiryDate) {
            // Simple validation YYYY-MM-DD
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(expiryDate)) {
                Alert.alert(t('modal.error'), t('fridge.invalidDateFormat'));
                return;
            }
            finalDate = new Date(expiryDate).toISOString();
        }

        try {
            setIsSubmitting(true);

            // Handle image update if changed
            if (item && selectedImage && !selectedImage.startsWith('http')) {
                const foodId = typeof item.foodId === 'object' ? (item.foodId as any)._id : item.foodId;
                await foodService.updateFoodImage(foodId, selectedImage);
            }

            await onSubmit(item._id, {
                quantity: val,
                expiredAt: finalDate
            });
            onClose();
        } catch (error) {
            Alert.alert(t('modal.error'), t('errors.somethingWentWrong'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!item) return null;

    const foodName = typeof item.foodId === 'object' ? item.foodId.name : 'Sản phẩm';
    const unitName = typeof item.unitId === 'object' ? item.unitId.name : '';
    const imageUrl = typeof item.foodId === 'object' && item.foodId.image ? `${API_CONFIG.UPLOADS_URL}/${item.foodId.image}` : null;
    const daysLeft = item.expiredAt ? fridgeService.calculateDaysUntilExpiry(item.expiredAt) : 0;

    return (
        <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{t('fridge.editItem')}</Text>
                        <TouchableOpacity onPress={onClose} disabled={isSubmitting}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.itemInfo}>
                            <TouchableOpacity onPress={pickImage}>
                                {selectedImage ? (
                                    <Image source={{ uri: selectedImage }} style={styles.itemImage} />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.itemName}>{foodName}</Text>
                                <Text style={styles.itemUnit}>
                                    {t('fridge.daysLeft')}: {daysLeft} {t('common.days')}
                                </Text>
                            </View>
                        </View>

                        {/* Quantity */}
                        <View style={styles.section}>
                            <Text style={styles.label}>{t('fridge.quantity')} ({unitName})</Text>
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

                        {/* Expiry Date */}
                        <View style={styles.section}>
                            <Text style={styles.label}>{t('fridge.expiryDate')}</Text>
                            <View style={styles.dateControl}>
                                <TextInput
                                    style={styles.dateInput}
                                    value={expiryDate}
                                    onChangeText={setExpiryDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#9CA3AF"
                                />
                            </View>
                            <View style={styles.quickDateRow}>
                                <TouchableOpacity style={styles.quickDateBtn} onPress={() => handleExtendExpiry(3)}>
                                    <Text style={styles.quickDateText}>+3 {t('common.days')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.quickDateBtn} onPress={() => handleExtendExpiry(7)}>
                                    <Text style={styles.quickDateText}>+1 {t('common.week')}</Text>
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
                            <Text style={styles.cancelBtnText}>{t('modal.cancel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.btn, styles.submitBtn]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitBtnText}>{t('fridge.saveChanges')}</Text>
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
    dateControl: {
        marginBottom: 8,
    },
    dateInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#111827',
    },
    quickDateRow: {
        flexDirection: 'row',
        gap: 8,
    },
    quickDateBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    quickDateText: {
        fontSize: 12,
        color: '#1E40AF',
        fontWeight: '500',
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
