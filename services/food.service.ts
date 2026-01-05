import { Platform } from 'react-native';
import api from '../lib/api';
import { API_CONFIG } from '../config/app.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

export interface Food {
  _id: string;
  name: string;
  category: string;
  unit: string;
  groupId?: string;
  image?: string;
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
  foodId: {
    _id: string;
    name: string;
    image?: string;
  };
  foodName: string;
  action: string;
  timestamp: string;
  created_at?: string;
  quantity: number;
}

class FoodService {
  /**
   * Helper normalize
   */
  private normalizeFood(item: any): Food {
    if (!item) return item;
    return {
      ...item,
      _id: item._id ? item._id.toString() : item._id,
    };
  }

  /**
   * Lấy danh sách thực phẩm của nhóm
   */
  async getFoodsInGroup(): Promise<Food[]> {
    try {
      const response = await api.get('/food');
      const data = response.data.data || response.data;
      return Array.isArray(data) ? data.map((f: any) => this.normalizeFood(f)) : [];
    } catch (error) {
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

  /**
   * Tạo thực phẩm mới
   */
  async createFood(data: {
    name: string;
    foodCategoryName: string;
    unitName: string;
    image?: string;
  }): Promise<Food> {
    try {
      let imageUrl = data.image;

      if (data.image && !data.image.startsWith('http')) {
        imageUrl = await this.uploadImage(data.image);
      }

      const response = await api.post('/food', { ...data, image: imageUrl });
      return this.normalizeFood(response.data.data || response.data);
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
    image?: string;
  }): Promise<Food> {
    try {
      let imageUrl = data.image;

      if (data.image && !data.image.startsWith('http')) {
        imageUrl = await this.uploadImage(data.image);
      }

      const response = await api.put('/food', { ...data, image: imageUrl });
      return this.normalizeFood(response.data.data || response.data);
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

  /**
   * Cập nhật ảnh thực phẩm
   */
  async updateFoodImage(foodId: string, imageUri: string): Promise<Food> {
    try {
      let imageUrl = imageUri;

      if (imageUri && !imageUri.startsWith('http')) {
        imageUrl = await this.uploadImage(imageUri);
      }

      const response = await api.patch(`/food/${foodId}/image`, { image: imageUrl });
      return this.normalizeFood(response.data.data || response.data);
    } catch (error) {
      throw error;
    }
  }
}

export const foodService = new FoodService();
