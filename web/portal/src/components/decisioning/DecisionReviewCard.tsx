import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Check, X, Shield, User } from 'lucide-react';

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
    const roles = ((userProfile as any)?.realm_access?.roles || []) as string[];
    const activeRole = roles.includes('bu_risk_owner') ? 'bu_risk_owner'
        : roles.includes('risk_lead') ? 'risk_lead'
            : 'viewer';

    // 1. First Mutation: Record Decision
    const recordDecisionMutation = useMutation({
        mutationFn: async (decisionType: string) => {
            const decisionResponse = await axios.post('http://localhost:4011/decisions', {
                breach_case_id: caseData.id,
                decision_type: decisionType,
                rationale: `Manual decision recorded via Portal by ${userId}.`,
                submitted_by: userId,
            });
            return decisionResponse.data;
        },
    });

    // 2. Second Mutation: Approve (Governance Gate)
    const approveMutation = useMutation({
        mutationFn: async (decisionId: string) => {
            return axios.post(`http://localhost:4011/decisions/${decisionId}/approve`, {
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
    // 0. Check for existing decision
    const { data: existingDecisions } = useQuery({
        queryKey: ['decisions', caseData.id],
        queryFn: async () => {
            if (!auth.user?.access_token) return [];
            try {
                const res = await axios.get(`http://localhost:4011/decisions?breach_case_id=${caseData.id}`, {
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

    const decision = existingDecisions?.[0]; // Assuming one active decision per breach for now
    const isApproved = decision?.status === 'approved';
    const isMitigated = decision?.decision_type === 'mitigate';

    const handleAction = async (type: string) => {
        try {
            const decision = await recordDecisionMutation.mutateAsync(type);
            await approveMutation.mutateAsync(decision.id);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Policy Violation: Approval denied by OPA.');
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
                                Action: {isMitigated ? 'Mitigation' : 'Operation Stopped'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-green-600 block">Approved by</span>
                        <span className="text-sm font-medium text-green-900">{decision.approver_user_id}</span>
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

            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 flex items-center">
                    <Shield className="mr-2 h-4 w-4 text-crm-accent" />
                    Governance Actions
                </h4>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => handleAction('mitigate')}
                        disabled={recordDecisionMutation.isPending || approveMutation.isPending}
                        className="btn btn-primary flex flex-col items-center py-4 space-y-2"
                    >
                        <Check className="h-6 w-6" />
                        <span>Mitigation</span>
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
