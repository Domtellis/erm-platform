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

    // 0.2 Check for AI assessment suggestion
    const { data: aiAssessment } = useQuery({
        queryKey: ['ai-suggestion', caseData.id],
        queryFn: async () => {
            if (!auth.user?.access_token) return null;
            const res = await axios.get(`/api/ai/ai-suggestions/${caseData.id}`, {
                headers: {
                    Authorization: `Bearer ${auth.user.access_token}`
                }
            });
            return res.data;
        },
        enabled: !!auth.user?.access_token,
    });

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
                <div className="rounded-xl bg-green-50/50 p-5 border border-green-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 shadow-inner">
                            <Check className="h-7 w-7" />
                        </div>
                        <div>
                            <h4 className="text-base font-bold text-green-900">Decision Finalized</h4>
                            <p className="text-xs text-green-700 font-medium">
                                Action: {decision.decision_type === 'accept_risk' ? 'Risk Accepted' : isMitigated ? 'Mitigation' : 'Operation Stopped'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right bg-white/50 px-3 py-1.5 rounded-lg border border-green-100">
                        <span className="text-[10px] text-green-600 font-bold uppercase block tracking-wider">Approved by</span>
                        <span className="text-sm font-bold text-green-900">
                            {decision.approvals?.[0]?.approver_user_id === '01fcdac1-3d09-447a-9909-805b721963f1' ? 'BU Risk Owner' : (decision.approvals?.[0]?.approver_role || 'Risk Owner')}
                        </span>
                    </div>
                </div>

                {/* Read-only Data View */}
                <div className="rounded-xl bg-slate-50 p-5 border border-slate-200 opacity-80 shadow-sm">
                    <div className="grid grid-cols-2 gap-6 text-sm">
                        <div className="space-y-1">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Site</span>
                            <span className="font-semibold text-slate-900">{caseData.site_id}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Severity</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter ${caseData.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                {caseData.severity.toUpperCase()}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Metric</span>
                            <span className="text-slate-900 font-medium">{caseData.metric_name}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Observed Value</span>
                            <span className="text-slate-900 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-100">{caseData.observed_value}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button onClick={onClose} className="btn bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 px-8 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95">
                        Back to Inventory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
                <div className="grid grid-cols-2 gap-6 text-sm">
                    <div className="space-y-1">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Site</span>
                        <span className="font-bold text-slate-900">{caseData.site_id}</span>
                    </div>
                    <div className="space-y-1 text-right">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Baseline Severity</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black ${caseData.severity === 'high' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                            {caseData.severity.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Assessment Comparison Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center">
                        <Shield className="mr-2 h-4 w-4 text-crm-accent" />
                        Risk Assessment Comparison
                    </h4>
                    <span className="h-[1px] flex-1 bg-slate-100 ml-4" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Human Assessment Summary */}
                    <div className={`p-4 rounded-xl border relative overflow-hidden transition-all hover:shadow-md ${humanAssessment ? 'bg-indigo-50/20 border-indigo-100 shadow-sm' : 'bg-slate-50 border-slate-100 border-dashed'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-indigo-600 uppercase flex items-center bg-indigo-50 px-2 py-0.5 rounded">
                                <User className="mr-1.5 h-3 w-3" /> Human Assessor
                            </span>
                            {humanAssessment && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${humanAssessment.risk_level === 'Critical' ? 'bg-red-500 text-white shadow-sm shadow-red-200' :
                                    humanAssessment.risk_level === 'High' ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' :
                                        'bg-blue-500 text-white shadow-sm shadow-blue-200'
                                    }`}>
                                    {humanAssessment.risk_level}
                                </span>
                            )}
                        </div>
                        {humanAssessment ? (
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">{humanAssessment.title}</p>
                                <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
                                    <div className="flex items-center bg-white border border-slate-100 px-2 py-0.5 rounded">
                                        Impact: <span className="text-slate-900 ml-1">{humanAssessment.impact_score}</span>
                                    </div>
                                    <div className="flex items-center bg-white border border-slate-100 px-2 py-0.5 rounded">
                                        Likelihood: <span className="text-slate-900 ml-1">{humanAssessment.likelihood_score}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 space-y-2 text-slate-400">
                                <AlertTriangle className="h-5 w-5 text-amber-300" />
                                <span className="text-[10px] font-medium italic">Pending site evaluation...</span>
                            </div>
                        )}
                    </div>

                    {/* AI Assessment Summary */}
                    <div className={`p-4 rounded-xl border relative overflow-hidden transition-all hover:shadow-md ${aiAssessment ? 'bg-emerald-50/20 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100 animate-pulse'}`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center bg-emerald-50 px-2 py-0.5 rounded">
                                <Brain className="mr-1.5 h-3 w-3" /> Gemini 3.1 Pro
                            </span>
                            {aiAssessment && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${aiAssessment.risk_score >= 12 ? 'bg-red-500 text-white shadow-sm shadow-red-200' :
                                    aiAssessment.risk_score >= 8 ? 'bg-orange-500 text-white shadow-sm shadow-orange-200' :
                                        'bg-blue-500 text-white shadow-sm shadow-blue-200'
                                    }`}>
                                    {aiAssessment.risk_score >= 12 ? 'Critical' : aiAssessment.risk_score >= 8 ? 'High' : 'Medium'}
                                </span>
                            )}
                        </div>
                        {aiAssessment ? (
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-slate-600 line-clamp-3 italic leading-relaxed">
                                    "{aiAssessment.justification.substring(0, 100)}..."
                                </p>
                                <div className="flex items-center space-x-3 text-[11px] font-medium text-slate-500">
                                    <div className="flex items-center bg-white border border-slate-100 px-2 py-0.5 rounded">
                                        Impact: <span className="text-slate-900 ml-1">{aiAssessment.impact}</span>
                                    </div>
                                    <div className="flex items-center bg-white border border-slate-100 px-2 py-0.5 rounded">
                                        Likelihood: <span className="text-slate-900 ml-1">{aiAssessment.likelihood}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-4 space-y-2 text-slate-400">
                                <div className="h-6 w-6 rounded-full border-2 border-emerald-100 border-t-emerald-500 animate-spin" />
                                <span className="text-[10px] font-medium italic">Analyzing breach vectors...</span>
                            </div>
                        )}
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
