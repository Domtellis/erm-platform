import axios from 'axios';

// Derive API URL from current hostname
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const MONITORING_API_URL = import.meta.env.VITE_MONITORING_API_URL || `http://${hostname}:4010`;

export interface BreachCase {
    id: string;
    site_id: string;
    metric_name: string;
    observed_value: number;
    severity: string;
    status: string;
    created_at: string;
    triage_due_at?: string;
    decision_due_at?: string;
    closure_due_at?: string;
    triage_completed_at?: string;
    decision_approved_at?: string;
    closed_at?: string;
}

export interface MonitoringMetrics {
    total_active_breaches: number;
    critical_active_breaches: number;
    appetite_compliance_score: number;
}

export const getBreaches = async (token?: string): Promise<BreachCase[]> => {
    const response = await axios.get(`${MONITORING_API_URL}/breaches`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
};

export const getMetrics = async (token?: string): Promise<MonitoringMetrics> => {
    const response = await axios.get(`${MONITORING_API_URL}/breaches/metrics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    return response.data;
};
