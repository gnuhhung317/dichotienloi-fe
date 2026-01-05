import api from '../lib/api';
import { User } from './auth.service';
import { Category, Unit } from './food.service';

export interface CreateUserDTO {
    email: string;
    name: string;
    password?: string;
    role: 'user' | 'admin';
}

export interface UpdateUserDTO {
    email?: string;
    name?: string;
    role?: 'user' | 'admin';
    password?: string;
}

class AdminService {
    // --- User Management ---
    async getAllUsers(): Promise<User[]> {
        const response = await api.get('/admin/users');
        return response.data;
    }

    async createUser(data: CreateUserDTO): Promise<void> {
        await api.post('/admin/users', data);
    }

    async updateUser(userId: string, data: UpdateUserDTO): Promise<void> {
        await api.put(`/admin/users/${userId}`, data);
    }

    async deleteUser(userId: string): Promise<void> {
        await api.delete(`/admin/users/${userId}`);
    }

    // --- Category Management ---
    async getAllCategories(): Promise<Category[]> {
        const response = await api.get('/admin/category');
        return response.data;
    }

    async createCategory(name: string): Promise<Category> {
        const response = await api.post('/admin/category', { name });
        return response.data;
    }

    async updateCategory(oldName: string, newName: string): Promise<Category> {
        const response = await api.put('/admin/category', { oldName, newName });
        return response.data;
    }

    async deleteCategory(name: string): Promise<void> {
        await api.delete(`/admin/category/${name}`);
    }

    // --- Unit Management ---
    async getAllUnits(): Promise<Unit[]> {
        const response = await api.get('/admin/unit');
        return response.data;
    }

    async createUnit(unitName: string): Promise<Unit> {
        const response = await api.post('/admin/unit', { unitName });
        return response.data;
    }

    async updateUnit(oldName: string, newName: string): Promise<Unit> {
        const response = await api.put('/admin/unit', { oldName, newName });
        return response.data;
    }

    async deleteUnit(unitName: string): Promise<void> {
        await api.delete(`/admin/unit/${unitName}`);
    }
}

export const adminService = new AdminService();
