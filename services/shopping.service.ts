import api from '../lib/api';

export interface ShoppingItem {
  _id: string;
  foodId: {
    _id: string;
    name: string;
    unitId: {
      _id: string;
      name: string;
    } | string;
  } | string;
  quantity: number;
  is_bought: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShoppingItemDTO {
  foodId: string;
  quantity: number;
}

export interface UpdateShoppingItemDTO {
  itemId: string;
  newQuantity?: number;
  isBought?: boolean;
}

export interface MarkAsBoughtDTO {
  itemId: string;
  isBought: boolean;
}

class ShoppingService {
  /**
   * Lấy danh sách mua sắm
   */
  async getShoppingItems(): Promise<ShoppingItem[]> {
    try {
      const response = await api.get('/shopping');
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thêm vào danh sách mua
   */
  async addItemToShoppingList(data: CreateShoppingItemDTO): Promise<ShoppingItem> {
    try {
      const response = await api.post('/shopping', data);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đánh dấu đã mua
   */
  async markItemAsBought(data: MarkAsBoughtDTO): Promise<ShoppingItem> {
    try {
      const response = await api.put('/shopping/marker', data);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật số lượng
   */
  async updateItemQuantity(data: {
    itemId: string;
    newQuantity: number;
  }): Promise<ShoppingItem> {
    try {
      const response = await api.put('/shopping', data);
      return response.data.data || response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa khỏi danh sách mua
   */
  async deleteItem(itemId: string): Promise<void> {
    try {
      await api.delete('/shopping', {
        data: { itemId },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lọc items đã mua và chưa mua
   */
  getBoughtItems(items: ShoppingItem[]): ShoppingItem[] {
    return items.filter((item) => item.is_bought);
  }

  getUnboughtItems(items: ShoppingItem[]): ShoppingItem[] {
    return items.filter((item) => !item.is_bought);
  }

  /**
   * Tính tổng items chưa mua
   */
  getUnboughtCount(items: ShoppingItem[]): number {
    return this.getUnboughtItems(items).length;
  }
}

export const shoppingService = new ShoppingService();
