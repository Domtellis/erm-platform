import axios from 'axios';

const API_URL = 'http://localhost:4011'; // Decisioning Service

export interface RiskAssessment {
    id: string;
    breach_case_id: string;
    title: string;
    summary?: string;
    impact_score: number;
    likelihood_score: number;
    risk_level: string;
    assessed_by: string;
    created_at: string;
}

export interface CreateRiskAssessmentDto {
    breach_case_id: string;
    title: string;
    summary?: string;
    impact_score: number;
    likelihood_score: number;
    submitted_by: string;
}

export const getAssessments = async (breachCaseId: string, token: string): Promise<RiskAssessment[]> => {
    const response = await axios.get(`${API_URL}/assessments?breach_case_id=${breachCaseId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const createAssessment = async (data: CreateRiskAssessmentDto, token: string): Promise<RiskAssessment> => {
    const response = await axios.post(`${API_URL}/assessments`, data, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};
