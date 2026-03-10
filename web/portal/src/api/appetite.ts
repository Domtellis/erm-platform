import axios from 'axios';

const BASE_URL = '/api/appetite';

export interface Threshold {
    id: string;
    appetite_id: string;
    metric_name: string;
    display_name?: string;
    description?: string;
    operator: string;
    limit_value: number;
    severity_mapping: { warning?: string; critical?: string;[key: string]: string | undefined };
    created_at: string;
}

export interface AppetiteStatement {
    id: string;
    category: string;
    title: string;
    description: string;
    version: string;
    is_active: boolean;
    created_at: string;
    thresholds: Threshold[];
}

export const getCurrentAppetite = async (category: string = 'safety'): Promise<AppetiteStatement> => {
    const response = await axios.get(`${BASE_URL}/appetites/current?category=${category}`);
    return response.data;
};

export const updateThresholdLimit = async (thresholdId: string, limitValue: number): Promise<Threshold> => {
    const response = await axios.put(`${BASE_URL}/appetites/thresholds/${thresholdId}`, { limit_value: limitValue });
    return response.data;
};
