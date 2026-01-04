import api from '../lib/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  /**
   * Đăng ký tài khoản mới
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    
    // Lưu token và user info
    await this.saveAuthData(response.data);
    
    return response.data;
  }

  /**
   * Đăng nhập
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    
    // Lưu token và user info
    await this.saveAuthData(response.data);
    
    return response.data;
  }

  /**
   * Lấy thông tin user hiện tại
   */
  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    
    // Cập nhật user info trong storage
    await AsyncStorage.setItem('user', JSON.stringify(response.data));
    
    return response.data;
  }

  /**
   * Đăng xuất
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Xóa tất cả dữ liệu auth
      await this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });
    
    // Lưu token mới
    await this.saveAuthData(response.data);
    
    return response.data;
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  }

  /**
   * Lấy user từ storage
   */
  async getStoredUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting stored user:', error);
      return null;
    }
  }

  /**
   * Lưu auth data vào storage
   */
  private async saveAuthData(data: AuthResponse): Promise<void> {
    await AsyncStorage.multiSet([
      ['accessToken', data.accessToken],
      ['refreshToken', data.refreshToken],
      ['user', JSON.stringify(data.user)],
    ]);
  }

  /**
   * Xóa tất cả auth data
   */
  private async clearAuthData(): Promise<void> {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }
}

export default new AuthService();
