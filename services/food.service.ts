import api from '../lib/api';

export interface Food {
  _id: string;
  name: string;
  category: string;
  unit: string;
  groupId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  icon?: string;
}

export interface Unit {
  _id: string;
  name: string;
  abbreviation?: string;
}

export interface FoodLog {
  _id: string;
  foodName: string;
  action: string;
  timestamp: string;
}

class FoodService {
  /**
   * Lấy danh sách thực phẩm của nhóm
   */
  async getFoodsInGroup(): Promise<Food[]> {
    try {
      const response = await api.get('/food');
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tạo thực phẩm mới
   */
  async createFood(data: {
    name: string;
    foodCategoryName: string;
    unitName: string;
  }): Promise<Food> {
    try {
      const response = await api.post('/food', data);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thực phẩm
   */
  async updateFood(data: {
    name: string;
    newCategory: string;
    newUnit: string;
  }): Promise<Food> {
    try {
      const response = await api.put('/food', data);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa thực phẩm
   */
  async deleteFood(name: string): Promise<void> {
    try {
      await api.delete('/food', {
        data: { name },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách tất cả categories
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await api.get('/food/category');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Get categories error:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách tất cả units
   */
  async getAllUnits(): Promise<Unit[]> {
    try {
      const response = await api.get('/food/unit');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Get units error:', error);
      return [];
    }
  }

  /**
   * Lấy danh sách units (dạng string đơn giản)
   */
  async getUnitsAsStrings(): Promise<string[]> {
    try {
      const units = await this.getAllUnits();
      return units.map((u) => u.name || u._id);
    } catch {
      // Fallback to default units
      return ['kg', 'g', 'l', 'ml', 'quả', 'hộp', 'chai', 'gói', 'bó'];
    }
  }

  /**
   * Lấy danh sách categories (dạng string đơn giản)
   */
  async getCategoriesAsStrings(): Promise<string[]> {
    try {
      const categories = await this.getAllCategories();
      return categories.map((c) => c.name || c._id);
    } catch {
      return [];
    }
  }

  /**
   * Lấy lịch sử thay đổi thực phẩm
   */
  async getFoodLogs(): Promise<FoodLog[]> {
    try {
      const response = await api.get('/food/log');
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Get food logs error:', error);
      return [];
    }
  }

  /**
   * Tìm kiếm thực phẩm theo tên
   */
  async searchFoods(query: string): Promise<Food[]> {
    try {
      const allFoods = await this.getFoodsInGroup();
      return allFoods.filter((food) =>
        food.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Search foods error:', error);
      return [];
    }
  }

  /**
   * Lấy foodId từ tên food
   */
  async getFoodIdByName(name: string): Promise<string | null> {
    try {
      const foods = await this.getFoodsInGroup();
      const food = foods.find((f) => f.name.toLowerCase() === name.toLowerCase());
      return food ? food._id : null;
    } catch (error) {
      console.error('Get food by name error:', error);
      return null;
    }
  }
}

export const foodService = new FoodService();
