import api from '../lib/api';

export interface Notification {
    _id: string;
    type: 'expire_warning' | 'system';
    content: string;
    is_read: boolean;
    created_at: string;
}

export interface NotificationResponse {
    notifications: Notification[];
    total: number;
    page: number;
    totalPages: number;
    unreadCount: number;
}

class NotificationService {
    async getNotifications(page: number = 1, limit: number = 20): Promise<NotificationResponse> {
        const response = await api.get<NotificationResponse>('/notification', {
            params: { page, limit }
        });
        return response.data;
    }

    async markAsRead(id: string): Promise<Notification> {
        const response = await api.put<Notification>(`/notification/${id}/read`);
        return response.data;
    }

    async markAllAsRead(): Promise<any> {
        const response = await api.put('/notification/read-all');
        return response.data;
    }
}

export default new NotificationService();
