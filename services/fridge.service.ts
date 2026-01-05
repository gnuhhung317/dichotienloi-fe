import api from '../lib/api';

export interface FridgeItem {
  _id: string;
  foodId: {
    _id: string;
    name: string;
    categoryId: string;
    image?: string;
  } | string;
  unitId: {
    _id: string;
    name: string;
  } | string;
  quantity: number;
  expiredAt: string;
  storagePlace?: string;
  status: 'available' | 'expired';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFridgeItemDTO {
  foodName: string;
  quantity: number;
  expiredAt: string;
}

export interface UpdateFridgeItemDTO {
  itemId: string;
  quantity?: number;
  expiredAt?: string;
}

export interface TakeOutItemDTO {
  itemId: string;
  quantity: number;
  action: 'consume' | 'discard';
}

class FridgeService {
  /**
   * Helper để normalize data từ backend (xử lý Decimal128)
   */
  private normalizeItem(item: any): FridgeItem {
    if (!item) return item;
    return {
      ...item,
      _id: item._id ? item._id.toString() : item._id,
      quantity: item.quantity?.$numberDecimal ? parseFloat(item.quantity.$numberDecimal) : item.quantity
    };
  }

  /**
   * Lấy danh sách hàng trong tủ lạnh
   */
  async getFridgeItems(): Promise<FridgeItem[]> {
    try {
      const response = await api.get('/fridge');
      const items = response.data.data || response.data; // Just in case structure varies
      return Array.isArray(items) ? items.map((item: any) => this.normalizeItem(item)) : [];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Thêm hàng vào tủ lạnh
   */
  async createFridgeItem(data: CreateFridgeItemDTO): Promise<FridgeItem> {
    try {
      const response = await api.post('/fridge', data);
      return this.normalizeItem(response.data.data || response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cập nhật thông tin hàng trong tủ
   */
  async updateFridgeItem(data: UpdateFridgeItemDTO): Promise<FridgeItem> {
    try {
      const response = await api.put('/fridge', data);
      return this.normalizeItem(response.data.data || response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Lấy hoặc loại bỏ hàng khỏi tủ
   * action: 'consume' (lấy để dùng) hoặc 'discard' (loại bỏ)
   */
  async takeOutFridgeItem(data: TakeOutItemDTO): Promise<FridgeItem> {
    try {
      const response = await api.patch('/fridge', data);
      return this.normalizeItem(response.data.data || response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Xóa hàng khỏi tủ lạnh
   */
  async deleteFridgeItem(itemId: string): Promise<void> {
    try {
      await api.delete('/fridge', {
        data: { itemId },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Tính toán số ngày còn lại đến hạn
   */
  calculateDaysUntilExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  }

  /**
   * Lấy trạng thái hàng dựa trên ngày hết hạn
   * 'fresh' (xanh) > 5 ngày
   * 'expiring' (vàng) 1-5 ngày
   * 'expired' (đỏ) <= 0 ngày
   */
  getItemStatus(expiryDate: string): 'fresh' | 'expiring' | 'expired' {
    const daysLeft = this.calculateDaysUntilExpiry(expiryDate);

    if (daysLeft > 5) return 'fresh';
    if (daysLeft > 0) return 'expiring';
    return 'expired';
  }

  /**
   * Format ngày thành chuỗi hiển thị
   */
  formatExpiryDisplay(expiryDate: string): string {
    const daysLeft = this.calculateDaysUntilExpiry(expiryDate);

    if (daysLeft < 0) {
      return 'Đã hết hạn';
    }
    if (daysLeft === 0) {
      return 'Hôm nay hết';
    }
    if (daysLeft === 1) {
      return 'Ngày mai hết';
    }
    return `${daysLeft} ngày`;
  }
}

export const fridgeService = new FridgeService();
