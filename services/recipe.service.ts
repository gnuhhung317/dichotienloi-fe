import api from '../lib/api';

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
    async getRecipes(groupOnly: boolean = true): Promise<Recipe[]> {
        try {
            const response = await api.get('/recipe', {
                params: { groupOnly }
            });
            return response.data;
        } catch (error) {
            console.error('Get recipes error:', error);
            throw error;
        }
    }

    async createRecipe(data: CreateRecipeDTO & { image?: string }): Promise<Recipe> {
        if (data.image) {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('groupOnly', String(data.groupOnly));
            if (data.ingredients) {
                formData.append('ingredients', JSON.stringify(data.ingredients));
            }

            // Get filename and type from URI
            const filename = data.image.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : `image/jpeg`;

            // Fetch the image and convert to blob
            const response = await fetch(data.image);
            const blob = await response.blob();
            
            // Append blob to formData
            formData.append('image', blob, filename);

            const uploadResponse = await api.post('/recipe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return uploadResponse.data;
        } else {
            const response = await api.post('/recipe', data);
            return response.data;
        }
    }

    async getRecipeById(recipeId: string): Promise<Recipe> {
        const response = await api.get(`/recipe/${recipeId}`);
        return response.data;
    }

    async deleteRecipe(recipeId: string) {
        await api.delete('/recipe', { data: { recipeId } });
    }
    async updateRecipe(recipeId: string, data: CreateRecipeDTO & { image?: string }): Promise<Recipe> {
        if (data.image && !data.image.startsWith('http')) {
            const formData = new FormData();
            formData.append('recipeId', recipeId);
            formData.append('name', data.name);
            formData.append('description', data.description);
            formData.append('groupOnly', String(data.groupOnly));
            if (data.ingredients) {
                formData.append('ingredients', JSON.stringify(data.ingredients));
            }

            // Get filename and type from URI
            const filename = data.image.split('/').pop() || 'photo.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : `image/jpeg`;

            // Fetch the image and convert to blob
            const response = await fetch(data.image);
            const blob = await response.blob();
            
            // Append blob to formData
            formData.append('image', blob, filename);

            const uploadResponse = await api.put('/recipe', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return uploadResponse.data;
        } else {
            const response = await api.put('/recipe', { ...data, recipeId });
            return response.data;
        }
    }
}

export const recipeService = new RecipeService();
