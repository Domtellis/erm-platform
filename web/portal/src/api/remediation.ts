import axios from 'axios';

const API_URL = 'http://localhost:4011'; // Decisioning Service

export interface RemediationPlan {
    id: string;
    risk_assessment_id: string;
    title: string;
    description: string;
    assigned_to: string;
    due_date: string;
    status: 'open' | 'in_progress' | 'completed';
    created_at: string;
}

export interface CreateRemediationDto {
    risk_assessment_id: string;
    title: string;
    description: string;
    assigned_to: string;
    due_date: string;
}

export const getRemediations = async (riskAssessmentId: string, token: string): Promise<RemediationPlan[]> => {
    const response = await axios.get(`${API_URL}/remediations?risk_assessment_id=${riskAssessmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createRemediation = async (data: CreateRemediationDto, token: string): Promise<RemediationPlan> => {
    const response = await axios.post(`${API_URL}/remediations`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
