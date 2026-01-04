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

    async createRecipe(data: CreateRecipeDTO): Promise<Recipe> {
        const response = await api.post('/recipe', data);
        return response.data;
    }

    async getRecipeById(recipeId: string): Promise<Recipe> {
        const response = await api.get(`/recipe/${recipeId}`);
        return response.data;
    }

    async deleteRecipe(recipeId: string) {
        await api.delete('/recipe', { data: { recipeId } });
    }
}

export const recipeService = new RecipeService();
