import axios from 'axios';

const AUDIT_API_URL = import.meta.env.VITE_AUDIT_API_URL || 'http://localhost:4013';

export interface TrendPoint {
    date: string;
    critical: number;
    high: number;
    medium: number;
    low: number;
}

export const getRiskTrends = async (days: number = 30, token?: string): Promise<TrendPoint[]> => {
    const response = await axios.get(`${AUDIT_API_URL}/reports/trends`, {
        params: { days },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
};

export const getBurndown = async (days: number = 30, token?: string): Promise<{ date: string; open: number }[]> => {
    const response = await axios.get(`${AUDIT_API_URL}/reports/burndown`, {
        params: { days },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
};
