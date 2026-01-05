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
    image?: string;
  } | string;
  quantity: number;
  is_bought: boolean;
  shoppingListId?: string;
  assignedTo?: {
    _id: string;
    fullName?: string;
    avatarUrl?: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShoppingItemDTO {
  foodId: string;
  quantity: number;
  date?: string;
  assignedTo?: string;
}

export interface UpdateShoppingItemDTO {
  itemId: string;
  newQuantity?: number;
  assignedTo?: string;
  isBought?: boolean;
}

export interface MarkAsBoughtDTO {
  itemId: string;
  isBought: boolean;
}

export interface ShoppingList {
  _id: string;
  date: string;
  status: string;
}

class ShoppingService {
  /**
   * Helper để normalize data từ backend (xử lý Decimal128)
   */
  private normalizeItem(item: any): ShoppingItem {
    if (!item) return item;
    return {
      ...item,
      _id: item._id ? item._id.toString() : item._id,
      quantity: item.quantity?.$numberDecimal ? parseFloat(item.quantity.$numberDecimal) : item.quantity
    };
  }
  /**
   * Lấy danh sách mua sắm
   */
  async getShoppingItems(date?: string): Promise<ShoppingItem[]> {
    try {
      const url = date ? `/shopping?date=${date}` : '/shopping';
      const response = await api.get(url);
      const items = response.data.data || response.data;
      return Array.isArray(items) ? items.map((item: any) => this.normalizeItem(item)) : [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy danh sách các ngày đi chợ
   */
  async getShoppingLists(): Promise<ShoppingList[]> {
    try {
      const response = await api.get('/shopping/lists');
      return response.data;
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
      return this.normalizeItem(response.data.data || response.data);
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
      return this.normalizeItem(response.data.data || response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật số lượng và người được giao
   */
  async updateItem(data: {
    itemId: string;
    newQuantity?: number;
    assignedTo?: string;
  }): Promise<ShoppingItem> {
    try {
      const response = await api.put('/shopping', data);
      return this.normalizeItem(response.data.data || response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Alias for backward compatibility if needed, but updated logic
   */
  async updateItemQuantity(data: { itemId: string; newQuantity: number; }): Promise<ShoppingItem> {
    return this.updateItem(data);
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
