import api from '../lib/api';
import { User } from './auth.service';

export interface UserProfile extends User {
  updatedAt?: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
}

class UserService {
  /**
   * Lấy thông tin user hiện tại
   */
  async getMe(): Promise<UserProfile> {
    const response = await api.get<UserProfile>('/user/me');
    return response.data;
  }

  /**
   * Cập nhật thông tin user
   */
  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    const response = await api.put<UserProfile>('/user/me', data);
    return response.data;
  }

  /**
   * Tìm kiếm user theo email
   */
  async searchUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await api.get<User>(`/user/search?email=${email}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Đổi mật khẩu
   */
  async changePassword(data: any): Promise<void> {
    await api.put('/user/password', data);
  }
}

export default new UserService();
