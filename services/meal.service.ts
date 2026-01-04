import api from '../lib/api';

export interface MealPlanItem {
    _id: string;
    recipeId: {
        _id: string;
        name: string;
        description?: string;
        image?: string;
    }; // Populated
    date: string; // ISO string
    mealType: 'breakfast' | 'lunch' | 'dinner';
}

export interface AddMealDTO {
    recipeId: string;
    date: string; // YYYY-MM-DD or ISO
    mealType: string;
}

class MealService {
    async getWeeklyPlan(startDate: Date, endDate: Date): Promise<MealPlanItem[]> {
        try {
            const response = await api.get('/meal', {
                params: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Get weekly plan error:', error);
            throw error;
        }
    }

    async addRecipeToMealPlan(data: AddMealDTO) {
        try {
            const response = await api.post('/meal', data);
            return response.data;
        } catch (error) {
            console.error('Add meal error:', error);
            throw error;
        }
    }

    async removeRecipeFromMealPlan(mealRecipeId: string) {
        try {
            await api.delete('/meal', {
                data: { mealRecipeId }
            });
        } catch (error) {
            console.error('Remove meal error:', error);
            throw error;
        }
    }
}

export const mealService = new MealService();
