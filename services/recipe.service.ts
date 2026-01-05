import { Platform } from 'react-native';
import api from '../lib/api';
import { API_CONFIG } from '../config/app.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export interface RecipeIngredient {
    foodId: {
        _id: string;
        name: string;
    } | string;
    quantity: number; // Will come as number from backend now
    unitId: {
        _id: string;
        name: string;
    } | string;
}

export interface Recipe {
    _id: string;
    name: string;
    description: string;
    ownerType: 'group' | 'global';
    ownerId: string;
    groupId: string | null;
    ingredients: RecipeIngredient[];
    created_at?: string;
    image?: string; // Optional image field
    matchCount?: number;
    totalIngredients?: number;
    matchPercentage?: number;
    missingIngredients?: any[];
}

export interface CreateRecipeDTO {
    name: string;
    description: string;
    groupOnly: boolean;
    ingredients?: {
        foodId: string;
        quantity: number;
        unitId: string;
    }[];
}

class RecipeService {
    private normalizeRecipe(recipe: any): Recipe {
        if (!recipe) return recipe;
        return {
            ...recipe,
            ingredients: Array.isArray(recipe.ingredients)
                ? recipe.ingredients.map((ing: any) => ({
                    ...ing,
                    quantity: typeof ing.quantity === 'object' && ing.quantity?.$numberDecimal
                        ? parseFloat(ing.quantity.$numberDecimal)
                        : (typeof ing.quantity === 'object' ? 0 : Number(ing.quantity)) // Fallback if simplified
                }))
                : []
        };
    }

    async getRecipes(groupOnly: boolean = true, sortByAvailability: boolean = false): Promise<Recipe[]> {
        try {
            const response = await api.get('/recipe', {
                params: { groupOnly, sortByAvailability }
            });
            return Array.isArray(response.data) ? response.data.map(r => this.normalizeRecipe(r)) : [];
        } catch (error) {
            console.error('Get recipes error:', error);
            throw error;
        }
    }

    async uploadImage(imageUri: string): Promise<string> {
        try {
            const token = await AsyncStorage.getItem('accessToken');

            if (Platform.OS === 'web') {
                // Web implementation
                const response = await fetch(imageUri);
                const blob = await response.blob();

                const formData = new FormData();
                formData.append('file', blob, 'photo.jpg');

                const uploadResponse = await fetch(`${API_CONFIG.BASE_URL}/upload`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                });

                const responseData = await uploadResponse.json();

                if (!uploadResponse.ok) {
                    throw new Error(responseData.message || 'Upload failed');
                }

                return responseData.url;
            } else {
                // Native implementation
                const response = await FileSystem.uploadAsync(`${API_CONFIG.BASE_URL}/upload`, imageUri, {
                    fieldName: 'file',
                    httpMethod: 'POST',
                    uploadType: 1, // FileSystem.FileSystemUploadType.MULTIPART (1)
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const responseData = JSON.parse(response.body);

                if (response.status !== 200) {
                    throw new Error(responseData.message || 'Upload failed');
                }

                return responseData.url;
            }
        } catch (error) {
            console.error('Upload image error:', error);
            throw error;
        }
    }

    async createRecipe(data: CreateRecipeDTO & { image?: string }): Promise<Recipe> {
        let imageUrl = data.image;

        if (data.image && !data.image.startsWith('http')) {
            imageUrl = await this.uploadImage(data.image);
        }

        const response = await api.post('/recipe', { ...data, image: imageUrl });
        return this.normalizeRecipe(response.data);
    }

    async getRecipeById(recipeId: string): Promise<Recipe> {
        const response = await api.get(`/recipe/${recipeId}`);
        return this.normalizeRecipe(response.data);
    }

    async deleteRecipe(recipeId: string) {
        await api.delete('/recipe', { data: { recipeId } });
    }

    async updateRecipe(recipeId: string, data: CreateRecipeDTO & { image?: string }): Promise<Recipe> {
        let imageUrl = data.image;

        if (data.image && !data.image.startsWith('http')) {
            imageUrl = await this.uploadImage(data.image);
        }

        const response = await api.put('/recipe', { ...data, recipeId, image: imageUrl });
        return this.normalizeRecipe(response.data);
    }

    async suggestRecipes(): Promise<(Recipe & { matchCount: number; totalIngredients: number; matchPercentage: number; missingIngredients: any[] })[]> {
        const response = await api.get('/recipe/suggest');
        // Type assertion needed because normalizeRecipe returns Recipe, but suggestions have extra fields
        // But spread in normalizeRecipe preserves extra fields
        return Array.isArray(response.data) ? response.data.map(r => this.normalizeRecipe(r) as any) : [];
    }
}

export const recipeService = new RecipeService();
