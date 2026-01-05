import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recipeService, Recipe } from '../services/recipe.service';
import { RecipeDetailModal } from './RecipeDetailModal';
import { API_CONFIG } from '../config/app.config';
import { mealService } from '../services/meal.service';
import DateTimePicker from '@react-native-community/datetimepicker';

interface SuggestionViewProps {
    onAddSuccess?: () => void;
}

interface SuggestedRecipe extends Recipe {
    matchCount: number;
    totalIngredients: number;
    matchPercentage: number;
    missingIngredients: any[];
}

export function SuggestionView({ onAddSuccess }: SuggestionViewProps) {
    const [recipes, setRecipes] = useState<SuggestedRecipe[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [showDetail, setShowDetail] = useState(false);

    // Add to Plan State
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [recipeToAdd, setRecipeToAdd] = useState<SuggestedRecipe | null>(null);
    const [targetDate, setTargetDate] = useState(new Date());
    const [targetMealType, setTargetMealType] = useState('lunch');
    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        loadSuggestions();
    }, []);

    const loadSuggestions = async () => {
        try {
            setIsLoading(true);
            const data = await recipeService.suggestRecipes();
            setRecipes(data);
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể tải gợi ý món ăn');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRecipePress = (recipe: SuggestedRecipe) => {
        setSelectedRecipe(recipe);
        setShowDetail(true);
    };

    const handleAddPress = (recipe: SuggestedRecipe) => {
        setRecipeToAdd(recipe);
        setTargetDate(new Date());
        setTargetMealType('lunch');
        setShowAddDialog(true);
    };

    const confirmAddToPlan = async () => {
        if (!recipeToAdd) return;
        try {
            await mealService.addRecipeToMealPlan({
                recipeId: recipeToAdd._id,
                date: targetDate.toISOString(),
                mealType: targetMealType
            });
            Alert.alert('Thành công', 'Đã thêm món ăn vào lịch');
            setShowAddDialog(false);
            setRecipeToAdd(null);
            if (onAddSuccess) onAddSuccess();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể thêm món ăn');
        }
    };

    const renderItem = ({ item }: { item: SuggestedRecipe }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleRecipePress(item)}>
            <Image
                source={{ uri: item.image ? (item.image.startsWith('http') ? item.image : `${API_CONFIG.UPLOADS_URL}/${item.image}`) : 'https://via.placeholder.com/150' }}
                style={styles.image}
            />
            <View style={styles.cardContent}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <View style={styles.matchInfo}>
                    <Ionicons name="nutrition" size={16} color={getMatchColor(item.matchPercentage)} />
                    <Text style={[styles.matchText, { color: getMatchColor(item.matchPercentage) }]}>
                        {item.matchCount}/{item.totalIngredients} nguyên liệu có sẵn
                    </Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
            </View>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddPress(item)}
            >
                <Ionicons name="add-circle" size={32} color="#16A34A" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    const getMatchColor = (percentage: number) => {
        if (percentage >= 80) return '#16A34A'; // Green
        if (percentage >= 50) return '#F59E0B'; // Orange
        return '#EF4444'; // Red
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setTargetDate(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#16A34A" />
                </View>
            ) : recipes.length > 0 ? (
                <FlatList
                    data={recipes}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <View style={styles.centerContainer}>
                    <Ionicons name="basket-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyText}>Không tìm thấy món ăn phù hợp với nguyên liệu trong tủ lạnh</Text>
                </View>
            )}

            {selectedRecipe && showDetail && (
                <RecipeDetailModal
                    isOpen={showDetail}
                    onClose={() => setShowDetail(false)}
                    recipe={selectedRecipe}
                    onEdit={() => { }}
                    onDeleteSuccess={() => { }}
                />
            )}

            {/* Add To Plan Dialog */}
            <Modal
                transparent
                visible={showAddDialog}
                animationType="fade"
                onRequestClose={() => setShowAddDialog(false)}
            >
                <View style={styles.dialogOverlay}>
                    <View style={styles.dialog}>
                        <Text style={styles.dialogTitle}>Thêm vào lịch ăn</Text>
                        {recipeToAdd && <Text style={styles.dialogSubtitle}>{recipeToAdd.name}</Text>}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Ngày:</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar" size={20} color="#4B5563" />
                                <Text style={styles.dateText}>{targetDate.toLocaleDateString('vi-VN')}</Text>
                            </TouchableOpacity>
                        </View>

                        {showDatePicker && (
                            <DateTimePicker
                                value={targetDate}
                                mode="date"
                                display="default"
                                onChange={onChangeDate}
                                minimumDate={new Date()}
                            />
                        )}

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Bữa:</Text>
                            <View style={styles.mealTypeContainer}>
                                {['breakfast', 'lunch', 'dinner'].map((type) => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[styles.mealTypeButton, targetMealType === type && styles.mealTypeButtonActive]}
                                        onPress={() => setTargetMealType(type)}
                                    >
                                        <Text style={[styles.mealTypeText, targetMealType === type && styles.mealTypeTextActive]}>
                                            {type === 'breakfast' ? 'Sáng' : type === 'lunch' ? 'Trưa' : 'Tối'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View style={styles.dialogActions}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddDialog(false)}>
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={confirmAddToPlan}>
                                <Text style={styles.confirmButtonText}>Thêm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        alignItems: 'center',
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    matchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 4
    },
    matchText: {
        fontSize: 12,
        fontWeight: '500',
    },
    description: {
        fontSize: 14,
        color: '#6B7280',
    },
    addButton: {
        padding: 8
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    // Dialog Styles
    dialogOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 16
    },
    dialog: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20
    },
    dialogTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 8
    },
    dialogSubtitle: {
        fontSize: 16,
        color: '#4B5563',
        textAlign: 'center',
        marginBottom: 20
    },
    formGroup: {
        marginBottom: 16
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151',
        marginBottom: 8
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        gap: 8
    },
    dateText: {
        fontSize: 16,
        color: '#111827'
    },
    mealTypeContainer: {
        flexDirection: 'row',
        gap: 8
    },
    mealTypeButton: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center'
    },
    mealTypeButtonActive: {
        backgroundColor: '#DCFCE7',
        borderWidth: 1,
        borderColor: '#16A34A'
    },
    mealTypeText: {
        fontSize: 14,
        color: '#4B5563'
    },
    mealTypeTextActive: {
        color: '#16A34A',
        fontWeight: '600'
    },
    dialogActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center'
    },
    cancelButtonText: {
        color: '#4B5563',
        fontWeight: '500'
    },
    confirmButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#16A34A',
        alignItems: 'center'
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: '600'
    }
});
