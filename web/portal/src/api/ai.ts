import axios from 'axios';

const API_URL = 'http://localhost:4014'; // AI Risk Service

export interface AiAssessmentSuggestion {
    id: string;
    breach_case_id: string;
    model_version: string;
    prompt_version: string;
    impact: number;
    likelihood: number;
    risk_score: number;
    justification: string;
    recommendations: string[];
    latency_ms: number;
    status: 'pending' | 'accepted' | 'modified' | 'rejected';
    human_feedback?: string;
    created_at: string;
}

export const getAiSuggestion = async (breachCaseId: string, token: string): Promise<AiAssessmentSuggestion | null> => {
    try {
        const response = await axios.get(`${API_URL}/ai-suggestions/${breachCaseId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
            return null;
        }
        throw err;
    }
};

export const recordAiFeedback = async (
    suggestionId: string,
    status: 'accepted' | 'modified' | 'rejected',
    feedback: string | undefined,
    token: string
): Promise<AiAssessmentSuggestion> => {
    const response = await axios.patch(`${API_URL}/ai-suggestions/${suggestionId}/feedback`,
        { status, human_feedback: feedback },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
};
