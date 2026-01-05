import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recipe, recipeService } from '../services/recipe.service';
import { API_CONFIG } from '../config/app.config';

interface RecipeDetailModalProps {
    isOpen: boolean;
    recipe: Recipe | null;
    onClose: () => void;
    onEdit: (recipe: Recipe) => void;
    onDeleteSuccess: () => void;
}

export function RecipeDetailModal({
    isOpen,
    recipe,
    onClose,
    onEdit,
    onDeleteSuccess,
}: RecipeDetailModalProps) {
    if (!recipe) return null;

    const handleDelete = () => {
        Alert.alert('Xóa công thức', 'Bạn có chắc chắn muốn xóa công thức này?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await recipeService.deleteRecipe(recipe._id);
                        onDeleteSuccess();
                        onClose();
                    } catch (error) {
                        Alert.alert('Lỗi', 'Không thể xóa công thức');
                    }
                },
            },
        ]);
    };

    return (
        <Modal visible={isOpen} animationType="slide" onRequestClose={onClose}>
            <View style={styles.container}>
                {/* Header Image */}
                <View style={styles.imageContainer}>
                    {recipe.image ? (
                        <Image
                            source={{ uri: recipe.image.startsWith('http') ? recipe.image : `${API_CONFIG.UPLOADS_URL}/${recipe.image}` }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={styles.placeholderImage}>
                            <Ionicons name="restaurant" size={64} color="#D1D5DB" />
                        </View>
                    )}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Ionicons name="close-circle" size={32} color="rgba(0,0,0,0.5)" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{recipe.name}</Text>

                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Mô tả</Text>
                        <Text style={styles.description}>{recipe.description || 'Chưa có mô tả'}</Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Nguyên liệu ({recipe.ingredients.length})</Text>
                        {recipe.ingredients.map((ing, index) => (
                            <View key={index} style={styles.ingredientRow}>
                                <View style={styles.bullet} />
                                <Text style={styles.ingredientText}>
                                    {typeof ing.foodId === 'object' ? ing.foodId.name : 'Unknown'}
                                    {' - '}
                                    <Text style={styles.quantity}>{ing.quantity} {typeof ing.unitId === 'object' ? ing.unitId.name : ''}</Text>
                                </Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={() => onEdit(recipe)}>
                        <Ionicons name="create-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.btnText}>Chỉnh sửa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={handleDelete}>
                        <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.btnText}>Xóa</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    imageContainer: {
        height: 250,
        width: '100%',
        backgroundColor: '#F3F4F6',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    closeBtn: {
        position: 'absolute',
        top: 40,
        right: 16,
        zIndex: 10
    },
    content: {
        flex: 1,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8
    },
    metaRow: {
        flexDirection: 'row',
        gap: 16
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    metaText: {
        color: '#6B7280',
        fontSize: 14
    },
    section: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12
    },
    description: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24
    },
    ingredientRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981',
        marginTop: 2
    },
    ingredientText: {
        fontSize: 16,
        color: '#374151',
        flex: 1
    },
    quantity: {
        fontWeight: '600',
        color: '#111827'
    },
    footer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB'
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8
    },
    editBtn: {
        backgroundColor: '#3B82F6'
    },
    deleteBtn: {
        backgroundColor: '#EF4444'
    },
    btnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600'
    }
});
