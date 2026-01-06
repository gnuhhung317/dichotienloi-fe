import { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { recipeService, Recipe } from '../services/recipe.service';
import { foodService } from '../services/food.service';
import { API_CONFIG } from '../config/app.config';

interface AddRecipeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Recipe | null;
}

export function AddRecipeModal({ isOpen, onClose, onSuccess, initialData }: AddRecipeModalProps) {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [ingredients, setIngredients] = useState<{ foodId: string; foodName: string; quantity: string; unitId: string; unitName: string }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Ingredient Form State
    const [showIngredientForm, setShowIngredientForm] = useState(false);
    const [searchFoodText, setSearchFoodText] = useState('');
    const [foundFoods, setFoundFoods] = useState<any[]>([]);
    const [selectedFood, setSelectedFood] = useState<any>(null);
    const [ingQuantity, setIngQuantity] = useState('1');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [units, setUnits] = useState<string[]>([]);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newUnit, setNewUnit] = useState('');
    const [showUnitSuggestions, setShowUnitSuggestions] = useState(false);

    // Load metadata
    useEffect(() => {
        if (isOpen) {
            loadMetadata();
            if (initialData) {
                // Populate form
                setName(initialData.name);
                setDescription(initialData.description);
                // Map ingredients
                const mappedIngs = initialData.ingredients.map(ing => ({
                    foodId: typeof ing.foodId === 'object' ? ing.foodId._id : ing.foodId,
                    foodName: typeof ing.foodId === 'object' ? ing.foodId.name : 'Unknown',
                    quantity: ing.quantity.toString(),
                    unitId: typeof ing.unitId === 'object' ? ing.unitId._id : ing.unitId,
                    unitName: typeof ing.unitId === 'object' ? ing.unitId.name : 'đơn vị'
                }));
                setIngredients(mappedIngs);
                if (initialData.image) {
                    // Check if it's full URL or relative
                    if (initialData.image.startsWith('http')) {
                        setImageUri(initialData.image);
                    } else {
                        setImageUri(`${API_CONFIG.UPLOADS_URL}/${initialData.image}`);
                    }
                } else {
                    setImageUri(null);
                }
            } else {
                // Reset form
                setName('');
                setDescription('');
                setIngredients([]);
                setImageUri(null);
            }
        }
    }, [isOpen, initialData]);

    const loadMetadata = async () => {
        const [cats, us] = await Promise.all([
            foodService.getCategoriesAsStrings(),
            foodService.getUnitsAsStrings()
        ]);
        setCategories(cats);
        setUnits(us);
        if (cats.length > 0) setNewCategory(cats[0]);
        if (us.length > 0) setNewUnit(us[0]);
    };

    const [isSearching, setIsSearching] = useState(false);

    const searchFoods = async (text: string) => {
        setSearchFoodText(text);
        setIsCreatingNew(false);
        setSelectedFood(null);

        if (text.length < 2) {
            setFoundFoods([]);
            return;
        }
        try {
            setIsSearching(true);
            const results = await foodService.searchFoods(text);
            setFoundFoods(results.slice(0, 5));
        } catch (error) {
            console.log('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleAddIngredient = async () => {
        let finalFood = selectedFood;

        if (isCreatingNew) {
            if (!newCategory || !newUnit) {
                alert('Vui lòng chọn danh mục và đơn vị');
                return;
            }
            try {
                setIsSubmitting(true); // Reuse submitting state for loading
                const created = await foodService.createFood({
                    name: searchFoodText,
                    foodCategoryName: newCategory,
                    unitName: newUnit
                });
                finalFood = created;
            } catch (err) {
                console.error(err);
                alert('Không thể tạo món mới');
                return;
            } finally {
                setIsSubmitting(false);
            }
        }

        if (!finalFood) {
            alert('Vui lòng chọn thực phẩm');
            return;
        }
        if (!ingQuantity || isNaN(parseFloat(ingQuantity))) {
            alert('Vui lòng nhập số lượng hợp lệ');
            return;
        }

        const newIng = {
            foodId: finalFood._id,
            foodName: finalFood.name,
            quantity: ingQuantity,
            unitId: typeof finalFood.unitId === 'object' ? finalFood.unitId._id : finalFood.unitId,
            unitName: typeof finalFood.unitId === 'object' ? finalFood.unitId.name : finalFood.unit || 'đơn vị'
        };

        setIngredients([...ingredients, newIng]);

        // Reset form
        setSelectedFood(null);
        setSearchFoodText('');
        setFoundFoods([]);
        setIngQuantity('1');
        setIsCreatingNew(false);
        setShowIngredientForm(false);
    };

    const handleRemoveIngredient = (index: number) => {
        const newIngs = [...ingredients];
        newIngs.splice(index, 1);
        setIngredients(newIngs);
    };

    const handleSubmit = async () => {
        if (!name.trim()) return;

        try {
            setIsSubmitting(true);

            const payloadIngredients = ingredients.map(ing => ({
                foodId: ing.foodId,
                quantity: parseFloat(ing.quantity.replace(',', '.')),
                unitId: ing.unitId
            }));

            if (initialData) {
                await recipeService.updateRecipe(initialData._id, {
                    name,
                    description,
                    groupOnly: true,
                    ingredients: payloadIngredients,
                    image: imageUri || undefined
                });
            } else {
                await recipeService.createRecipe({
                    name,
                    description,
                    groupOnly: true,
                    ingredients: payloadIngredients,
                    image: imageUri || undefined
                });
            }
            onSuccess();
            onClose();
            // Form reset happens in useEffect when reopening or clearing initialData
        } catch (error) {
            console.error('Save recipe error:', error);
            alert('Không thể lưu công thức');
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
                    <View style={styles.header}>
                        <Text style={styles.title}>{initialData ? 'Chỉnh sửa công thức' : 'Thêm công thức mới'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* Image Picker */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Hình ảnh (Tùy chọn)</Text>
                            <TouchableOpacity onPress={async () => {
                                const result = await ImagePicker.launchImageLibraryAsync({
                                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                    allowsEditing: true,
                                    aspect: [16, 9],
                                    quality: 0.5,
                                });
                                if (!result.canceled) {
                                    setImageUri(result.assets[0].uri);
                                }
                            }} style={styles.imagePickerButton}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.pickedImage} />
                                ) : (
                                    <View style={styles.placeholderImage}>
                                        <Ionicons name="camera-outline" size={32} color="#9CA3AF" />
                                        <Text style={styles.uploadText}>Chọn ảnh bìa</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>{t('modal.recipeName')} *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ví dụ: Phở bò, Canh chua..."
                                placeholderTextColor="#9CA3AF"
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mô tả / Cách làm</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Nhập mô tả hoặc hướng dẫn nấu..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Ingredients Section */}
                        <View style={styles.formGroup}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.label}>Nguyên liệu ({ingredients.length})</Text>
                                <TouchableOpacity onPress={() => setShowIngredientForm(!showIngredientForm)}>
                                    <Text style={styles.addIngText}>+ Thêm nguyên liệu</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Add Ingredient Form */}
                            {showIngredientForm && (
                                <View style={styles.addIngForm}>
                                    <Text style={styles.subLabel}>Tìm thực phẩm:</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={searchFoodText}
                                        onChangeText={searchFoods}
                                        placeholder="Gõ để tìm kiếm..."
                                    />
                                    {isSearching && <ActivityIndicator size="small" color="#16A34A" style={{ marginTop: 8 }} />}
                                    {!isSearching && foundFoods.length > 0 && (
                                        <View style={styles.searchResults}>
                                            {foundFoods.map(food => (
                                                <TouchableOpacity
                                                    key={food._id}
                                                    style={styles.searchItem}
                                                    onPress={() => {
                                                        setSelectedFood(food);
                                                        setSearchFoodText(food.name);
                                                        setFoundFoods([]);
                                                        setIsCreatingNew(false);
                                                    }}
                                                >
                                                    <Text>{food.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}

                                    {!isSearching && searchFoodText.length > 1 && !selectedFood && (
                                        <TouchableOpacity
                                            style={styles.createNewBtn}
                                            onPress={() => {
                                                setIsCreatingNew(true);
                                                setSelectedFood(null);
                                                setFoundFoods([]);
                                            }}
                                        >
                                            <Text style={styles.createNewText}>+ Tạo mới "{searchFoodText}"</Text>
                                        </TouchableOpacity>
                                    )}

                                    {isCreatingNew && (
                                        <View style={styles.creationForm}>
                                            <Text style={styles.creationLabel}>Chọn thông tin cho món mới:</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                                                {categories.map(c => (
                                                    <TouchableOpacity
                                                        key={c}
                                                        style={[styles.chip, newCategory === c && styles.chipActive]}
                                                        onPress={() => setNewCategory(c)}
                                                    >
                                                        <Text style={[styles.chipText, newCategory === c && styles.chipTextActive]}>{c}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>

                                            <Text style={[styles.creationLabel, { marginTop: 8 }]}>Đơn vị:</Text>
                                            <View style={styles.unitPickerContainer}>
                                                <TextInput
                                                    style={styles.input}
                                                    value={newUnit}
                                                    onChangeText={(text) => {
                                                        setNewUnit(text);
                                                        setShowUnitSuggestions(true);
                                                    }}
                                                    onFocus={() => setShowUnitSuggestions(true)}
                                                    placeholder="Nhập hoặc chọn đơn vị"
                                                />
                                                {showUnitSuggestions && (
                                                    <View style={styles.unitSuggestions}>
                                                        <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 150 }}>
                                                            {units
                                                                .filter(u => u.toLowerCase().includes(newUnit.toLowerCase()))
                                                                .map(u => (
                                                                    <TouchableOpacity
                                                                        key={u}
                                                                        style={styles.suggestionItem}
                                                                        onPress={() => {
                                                                            setNewUnit(u);
                                                                            setShowUnitSuggestions(false);
                                                                        }}
                                                                    >
                                                                        <Text style={styles.suggestionText}>{u}</Text>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            {units.filter(u => u.toLowerCase().includes(newUnit.toLowerCase())).length === 0 && (
                                                                <View style={styles.suggestionItem}>
                                                                    <Text style={[styles.suggestionText, { color: '#9CA3AF' }]}>Tạo mới "{newUnit}"</Text>
                                                                </View>
                                                            )}
                                                        </ScrollView>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    {(selectedFood || isCreatingNew) && (
                                        <View style={styles.selectedFoodParams}>
                                            {selectedFood && <Text style={styles.selectedFoodName}>Đã chọn: {selectedFood.name}</Text>}
                                            {isCreatingNew && <Text style={styles.selectedFoodName}>Đang tạo: {searchFoodText}</Text>}

                                            <View style={styles.qtyRow}>
                                                <TextInput
                                                    style={[styles.input, styles.qtyInput]}
                                                    value={ingQuantity}
                                                    onChangeText={setIngQuantity}
                                                    keyboardType="numeric"
                                                />
                                                <Text style={styles.unitText}>
                                                    {isCreatingNew ? newUnit : (typeof selectedFood.unitId === 'object' ? selectedFood.unitId.name : 'đơn vị')}
                                                </Text>
                                            </View>
                                            <TouchableOpacity style={styles.addIngBtn} onPress={handleAddIngredient}>
                                                <Text style={styles.addIngBtnText}>{isCreatingNew ? 'Tạo & Thêm' : 'Thêm'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            )}

                            {/* Ingredient List */}
                            <View style={styles.ingList}>
                                {ingredients.map((ing, idx) => (
                                    <View key={idx} style={styles.ingItem}>
                                        <Text style={styles.ingText}>
                                            {ing.foodName} - {ing.quantity} {ing.unitName}
                                        </Text>
                                        <TouchableOpacity onPress={() => handleRemoveIngredient(idx)}>
                                            <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.submitButton, (!name.trim() || isSubmitting) && styles.submitButtonDisabled]}
                            disabled={!name.trim() || isSubmitting}
                            onPress={handleSubmit}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.submitButtonText}>{initialData ? 'Lưu thay đổi' : 'Tạo công thức'}</Text>
                            )}
                        </TouchableOpacity>
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
        maxHeight: '90%',
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
    formGroup: {
        marginBottom: 20,
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
    textArea: {
        minHeight: 100,
    },
    submitButton: {
        backgroundColor: '#16A34A',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
    },
    submitButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    addIngText: {
        color: '#16A34A',
        fontWeight: '500',
    },
    addIngForm: {
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    subLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4
    },
    searchResults: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        marginTop: 4,
        maxHeight: 150
    },
    searchItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    selectedFoodParams: {
        marginTop: 12
    },
    selectedFoodName: {
        fontWeight: '600',
        marginBottom: 8,
        color: '#111827'
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    qtyInput: {
        width: 80,
        textAlign: 'center'
    },
    unitText: {
        color: '#6B7280'
    },
    addIngBtn: {
        marginTop: 12,
        backgroundColor: '#D1FAE5',
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8
    },
    addIngBtnText: {
        color: '#047857',
        fontWeight: '600'
    },
    ingList: {
        gap: 8
    },
    ingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 8
    },
    ingText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500'
    },
    createNewBtn: {
        padding: 12,
        backgroundColor: '#EFF6FF',
        borderRadius: 8,
        marginTop: 8,
        borderWidth: 1,
        borderColor: '#BFDBFE',
        alignItems: 'center'
    },
    createNewText: {
        color: '#1D4ED8',
        fontWeight: '600'
    },
    creationForm: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    creationLabel: {
        fontSize: 12,
        color: '#4B5563',
        marginBottom: 8,
        fontWeight: '500'
    },
    chipScroll: {
        marginBottom: 8
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    chipActive: {
        backgroundColor: '#D1FAE5',
        borderColor: '#16A34A'
    },
    chipText: {
        fontSize: 12,
        color: '#374151'
    },
    chipTextActive: {
        color: '#16A34A',
        fontWeight: '600'
    },
    imagePickerButton: {
        height: 160,
        width: '100%',
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    pickedImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderImage: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadText: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    },
    unitPickerContainer: {
        position: 'relative',
        zIndex: 10,
        marginTop: 8
    },
    unitSuggestions: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        marginTop: 4,
        zIndex: 2000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        maxHeight: 150
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
});
