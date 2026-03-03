import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import axios from 'axios';
import { Check, X, Shield, User, Brain, AlertTriangle } from 'lucide-react';

interface DecisionCardProps {
    caseData: {
        id: string;
        site_id: string;
        metric_name: string;
        observed_value: number;
        severity: string;
    };
    onClose: () => void;
}

import { useAuth } from 'react-oidc-context';

export function DecisionReviewCard({ caseData, onClose }: DecisionCardProps) {
    const queryClient = useQueryClient();
    const auth = useAuth();
    const userProfile = auth.user?.profile;
    const userId = userProfile?.preferred_username || userProfile?.sub || 'unknown';

    // Determine highest role for approval context
    const roles = ((userProfile as Record<string, unknown>)?.realm_access as { roles?: string[] })?.roles || [];
    const activeRole = roles.includes('bu_risk_owner') ? 'bu_risk_owner'
        : roles.includes('risk_lead') ? 'risk_lead'
            : 'viewer';

    // 1. First Mutation: Record Decision
    const recordDecisionMutation = useMutation({
        mutationFn: async ({ type, evidence }: { type: string, evidence: string[] }) => {
            const decisionResponse = await axios.post('/api/decisioning/decisions', {
                breach_case_id: caseData.id,
                decision_type: type,
                rationale: `Manual decision recorded via Portal by ${userId}.`,
                submitted_by: userId,
                evidence_urls: evidence
            });
            return decisionResponse.data;
        },
    });

    // 2. Second Mutation: Approve (Governance Gate)
    const approveMutation = useMutation({
        mutationFn: async (decisionId: string) => {
            return axios.post(`/api/decisioning/decisions/${decisionId}/approve`, {
                approver_user_id: userId,
                approver_role: activeRole,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['breaches'] });
            onClose();
        },
    });

    // 0. Check for existing decision
    const { data: existingDecisions } = useQuery({
        queryKey: ['decisions', caseData.id],
        queryFn: async () => {
            if (!auth.user?.access_token) return [];
            try {
                const res = await axios.get(`/api/decisioning/decisions?breach_case_id=${caseData.id}`, {
                    headers: {
                        Authorization: `Bearer ${auth.user.access_token}`
                    }
                });
                return res.data;
            } catch (error) {
                console.error("Failed to fetch decision status", error);
                return [];
            }
        },
        enabled: !!auth.user?.access_token,
    });

    // 0.1 Check for human risk assessments (Segregation of Duties)
    const { data: humanAssessments } = useQuery({
        queryKey: ['risk-assessments', caseData.id],
        queryFn: async () => {
            if (!auth.user?.access_token) return [];
            const res = await axios.get(`/api/decisioning/assessments?breach_case_id=${caseData.id}`, {
                headers: {
                    Authorization: `Bearer ${auth.user.access_token}`
                }
            });
            return res.data;
        },
        enabled: !!auth.user?.access_token,
    });

    const humanAssessment = humanAssessments?.[0]; // Get the first assessment for comparison

    const decision = existingDecisions?.[0]; // Assuming one active decision per breach for now
    const isApproved = decision?.status === 'approved';
    const isMitigated = decision?.decision_type === 'mitigate';

    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [evidenceList, setEvidenceList] = useState<string[]>([]);

    const addEvidence = () => {
        if (evidenceUrl) {
            setEvidenceList([...evidenceList, evidenceUrl]);
            setEvidenceUrl('');
        }
    };

    const handleAction = async (type: string) => {
        try {
            const decision = await recordDecisionMutation.mutateAsync({ type, evidence: evidenceList });
            // Small delay to ensure DB consistency before approval check
            await new Promise(resolve => setTimeout(resolve, 500));
            await approveMutation.mutateAsync(decision.id);
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            alert(err.response?.data?.message || 'Policy Violation: Approval denied by OPA.');
        }
    };

    if (isApproved) {
        return (
            <div className="space-y-6">
                {/* Summary Header */}
                <div className="rounded-lg bg-green-50 p-4 border border-green-200 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                            <Check className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-green-900">Decision Approved</h4>
                            <p className="text-xs text-green-700">
                                Action: {decision.decision_type === 'accept_risk' ? 'Risk Accepted' : isMitigated ? 'Mitigation' : 'Operation Stopped'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-green-600 block">Approved by</span>
                        <span className="text-sm font-medium text-green-900">
                            {decision.approvals?.[0]?.approver_user_id === '01fcdac1-3d09-447a-9909-805b721963f1' ? 'BU Risk Owner' : (decision.approvals?.[0]?.approver_role || 'Risk Owner')}
                        </span>
                    </div>
                </div>

                {/* Read-only Data View */}
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 opacity-75">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500 block">Site</span>
                            <span className="font-medium text-slate-900">{caseData.site_id}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Severity</span>
                            <span className={`font-bold ${caseData.severity === 'high' ? 'text-crm-danger' : 'text-crm-warning'}`}>
                                {caseData.severity.toUpperCase()}
                            </span>
                        </div>
                        {/* ... other fields ... */}
                        <div>
                            <span className="text-slate-500 block">Metric</span>
                            <span className="text-slate-900">{caseData.metric_name}</span>
                        </div>
                        <div>
                            <span className="text-slate-500 block">Value</span>
                            <span className="text-slate-900 font-mono">{caseData.observed_value}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={onClose} className="btn bg-slate-100 text-slate-600 hover:bg-slate-200">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-500 block">Site</span>
                        <span className="font-medium text-slate-900">{caseData.site_id}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">Severity</span>
                        <span className={`font-bold ${caseData.severity === 'high' ? 'text-crm-danger' : 'text-crm-warning'}`}>
                            {caseData.severity.toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">Metric</span>
                        <span className="text-slate-900">{caseData.metric_name}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">Value</span>
                        <span className="text-slate-900 font-mono">{caseData.observed_value}</span>
                    </div>
                </div>
            </div>

            {/* Assessment Comparison Section */}
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Shield className="mr-2 h-3.5 w-3.5" />
                    Risk Assessment Verification
                </h4>

                <div className="grid grid-cols-2 gap-3">
                    {/* Human Assessment Summary */}
                    <div className={`p-3 rounded-lg border ${humanAssessment ? 'bg-indigo-50/30 border-indigo-100' : 'bg-slate-50 border-slate-100 italic'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase flex items-center">
                                <User className="mr-1 h-3 w-3" /> Human
                            </span>
                            {humanAssessment && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${humanAssessment.risk_level === 'Critical' ? 'bg-red-100 text-red-700' :
                                        humanAssessment.risk_level === 'High' ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-100 text-blue-700'
                                    }`}>
                                    {humanAssessment.risk_level}
                                </span>
                            )}
                        </div>
                        {humanAssessment ? (
                            <div className="space-y-1">
                                <p className="text-xs font-semibold text-slate-800 line-clamp-1">{humanAssessment.title}</p>
                                <div className="flex text-[10px] text-slate-500 space-x-2">
                                    <span>Imp: {humanAssessment.impact_score}</span>
                                    <span>Lik: {humanAssessment.likelihood_score}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 text-slate-400 text-[10px] py-1">
                                <AlertTriangle className="h-3 w-3 text-amber-400" />
                                <span>No site assessment found</span>
                            </div>
                        )}
                    </div>

                    {/* AI Assessment Summary - (Note: AISuggestionCard is above, this is just a quick summary link) */}
                    <div className="p-3 rounded-lg border bg-green-50/30 border-green-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-green-600 uppercase flex items-center">
                                <Brain className="mr-1 h-3 w-3" /> Gemini AI
                            </span>
                            <span className="text-[10px] text-green-600 font-medium">Auto-Calculated</span>
                        </div>
                        <div className="flex items-center space-x-2 py-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] text-slate-500 italic">Score synchronized from AI service</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-crm-accent" />
                    Governance Actions
                </h4>

                {/* Evidence Section */}
                <div className="bg-slate-50 p-3 rounded border border-slate-200 mb-4">
                    <label className="block text-xs font-semibold text-slate-500 mb-2">EVIDENCE (Required for High Severity)</label>
                    <div className="flex space-x-2 mb-2">
                        <input
                            type="text"
                            className="flex-1 rounded-md border-slate-300 border p-2 text-sm text-slate-900 bg-white focus:border-crm-accent focus:ring-crm-accent"
                            placeholder="https://sharepoint..."
                            value={evidenceUrl}
                            onChange={(e) => setEvidenceUrl(e.target.value)}
                        />
                        <button type="button" onClick={addEvidence} className="btn btn-secondary text-xs">Add</button>
                    </div>
                    <ul className="space-y-1">
                        {evidenceList.map((url, i) => (
                            <li key={i} className="text-xs text-slate-600 flex items-center">
                                <Check className="h-3 w-3 mr-1 text-green-500" />
                                {url}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={() => handleAction('mitigate')}
                        disabled={recordDecisionMutation.isPending || approveMutation.isPending}
                        className="btn btn-primary flex flex-col items-center py-4 space-y-2"
                    >
                        <Check className="h-6 w-6" />
                        <span>Mitigation</span>
                    </button>
                    <button
                        onClick={() => handleAction('accept_risk')}
                        disabled={recordDecisionMutation.isPending || approveMutation.isPending}
                        className="btn border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 flex flex-col items-center py-4 space-y-2"
                    >
                        <Shield className="h-6 w-6" />
                        <span>Accept Risk</span>
                    </button>
                    <button
                        onClick={() => handleAction('stop')}
                        disabled={recordDecisionMutation.isPending || approveMutation.isPending}
                        className="btn border-red-200 bg-red-50 text-red-700 hover:bg-red-100 flex flex-col items-center py-4 space-y-2"
                    >
                        <X className="h-6 w-6" />
                        <span>Stop Operation</span>
                    </button>
                </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400">
                <User className="h-3 w-3" />
                <span>Gated by OPA Policy: SoD & BU Owner Required</span>
            </div>
        </div>
    );
}
