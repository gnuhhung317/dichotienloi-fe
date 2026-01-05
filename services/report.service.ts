import api from '../lib/api';

export interface ReportItem {
    _id: string;
    foodName: string;
    unitName: string;
    image?: string;
    totalQuantity: number;
    count: number;
}

class ReportService {
    async getShoppingReport(startDate: string, endDate: string): Promise<ReportItem[]> {
        const response = await api.get<ReportItem[]>('/report/shopping', {
            params: { startDate, endDate }
        });
        return response.data;
    }

    async getConsumptionReport(startDate: string, endDate: string): Promise<ReportItem[]> {
        const response = await api.get<ReportItem[]>('/report/consumption', {
            params: { startDate, endDate }
        });
        return response.data;
    }
}

export default new ReportService();
