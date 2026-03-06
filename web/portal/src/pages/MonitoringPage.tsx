import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Clock, CheckCircle } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { BreachSubmissionForm } from '../components/monitoring/BreachSubmissionForm';
import { RiskAssessmentForm } from '../components/risk/RiskAssessmentForm';
import { RemediationList } from '../components/risk/RemediationList';
import { useAuth } from 'react-oidc-context';
import { getAssessments } from '../api/risk';
import { getBreaches, type BreachCase } from '../api/monitoring';
import { SLACountdown } from '../components/common/SLACountdown';
import { SLABadge } from '../components/common/SLABadge';
import { AISuggestionCard } from '../components/ai/AISuggestionCard';
import { getAiSuggestion } from '../api/ai';

export function MonitoringPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();

    const { data: cases, isLoading } = useQuery<BreachCase[]>({
        queryKey: ['breaches'],
        queryFn: () => getBreaches(user?.access_token || ''),
        refetchInterval: 5000,
    });

    const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

    // Fetch existing assessment for selected case
    const { data: assessments } = useQuery({
        queryKey: ['risk-assessments', selectedCaseId],
        queryFn: () => getAssessments(selectedCaseId!, user?.access_token || ''),
        enabled: !!selectedCaseId && !!user?.access_token
    });

    const { data: aiSuggestion, isLoading: isLoadingAi } = useQuery({
        queryKey: ['ai-suggestion', selectedCaseId],
        queryFn: () => getAiSuggestion(selectedCaseId!, user?.access_token || ''),
        enabled: !!selectedCaseId && !!user?.access_token,
        refetchInterval: (query) => query.state.data?.status === 'pending' ? 5000 : false,
    });

    const currentAssessment = assessments?.[0];

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Live Breach Dashboard</h1>
                    <p className="mt-2 text-slate-500">Real-time telemetry and appetite thresholds evaluation feed.</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-200">
                        <span className="relative flex h-2.5 w-2.5 mr-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        Kafka Telemetry Online
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center">
                        <Plus className="mr-2 h-5 w-5" />
                        Report Breach
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-4">Case ID</th>
                                <th className="px-6 py-4">Site</th>
                                <th className="px-6 py-4">Metric</th>
                                <th className="px-6 py-4">Value</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Created</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">Loading cases...</td></tr>
                            ) : cases?.length === 0 ? (
                                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">No breaches detected.</td></tr>
                            ) : (
                                cases?.map((item) => {
                                    const getSLA = () => {
                                        switch (item.status) {
                                            case 'open': return { label: 'Triage', due: item.triage_due_at, completed: null };
                                            case 'triaged': return { label: 'Triage', due: item.triage_due_at, completed: item.triage_completed_at };
                                            case 'decision_submitted': return { label: 'Decision', due: item.decision_due_at, completed: null };
                                            case 'decision_approved': return { label: 'Decision', due: item.decision_due_at, completed: item.decision_approved_at };
                                            case 'in_progress': return { label: 'Closure', due: item.closure_due_at, completed: null };
                                            case 'closed': return { label: 'Closure', due: item.closure_due_at, completed: item.closed_at };
                                            default: return null;
                                        }
                                    };
                                    const sla = getSLA();

                                    return (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-crm-brand">{item.id.slice(0, 8)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{item.site_id}</td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{item.metric_name}</td>
                                            <td className="px-6 py-4 text-sm font-mono text-slate-900">{item.observed_value}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.severity === 'high' || item.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                    item.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                                                        'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {item.severity.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-sm text-slate-600">
                                                        {item.status === 'open' ? <Clock className="mr-2 h-4 w-4 text-crm-warning" /> : <CheckCircle className="mr-2 h-4 w-4 text-crm-success" />}
                                                        {item.status}
                                                    </div>
                                                    {sla && sla.due && (
                                                        sla.completed ? (
                                                            <SLABadge label={sla.label} dueAt={sla.due} completedAt={sla.completed} />
                                                        ) : (
                                                            <SLACountdown label={sla.label} dueDate={sla.due} />
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-slate-400">
                                                {new Date(item.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedCaseId(item.id)}
                                                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                                                >
                                                    Assess Risk
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report Site Breach">
                <BreachSubmissionForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>

            <Modal isOpen={!!selectedCaseId} onClose={() => setSelectedCaseId(null)} title="Risk Assessment">
                {selectedCaseId && (
                    <div className="space-y-6">
                        {isLoadingAi ? (
                            <div className="flex items-center justify-center p-8 text-slate-400">
                                <Clock className="mr-2 h-5 w-5 animate-spin" />
                                Analysis by Gemini...
                            </div>
                        ) : aiSuggestion && (
                            <AISuggestionCard
                                suggestion={aiSuggestion}
                                breachCaseId={selectedCaseId}
                            />
                        )}

                        {!currentAssessment && (
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Manual Risk Assessment</h3>
                                <RiskAssessmentForm
                                    breachCaseId={selectedCaseId}
                                    onSuccess={() => {/* Refetch logic handled by query invalidation */ }}
                                />
                            </div>
                        )}
                    </div>
                )}

                {selectedCaseId && currentAssessment && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded border">
                            <h3 className="font-semibold text-lg">{currentAssessment.title}</h3>
                            <div className="flex gap-2 mt-2">
                                <span className={`px-2 py-1 rounded text-sm ${currentAssessment.risk_level === 'Critical' ? 'bg-red-600 text-white' :
                                    currentAssessment.risk_level === 'High' ? 'bg-orange-500 text-white' :
                                        'bg-blue-500 text-white'
                                    }`}>
                                    Level: {currentAssessment.risk_level}
                                </span>
                                <span className="text-sm text-gray-600 px-2 py-1">Impact: {currentAssessment.impact_score}</span>
                                <span className="text-sm text-gray-600 px-2 py-1">Likelihood: {currentAssessment.likelihood_score}</span>
                            </div>
                            <p className="text-sm mt-2 text-gray-700">{currentAssessment.summary}</p>
                        </div>

                        <RemediationList riskAssessmentId={currentAssessment.id} />
                    </div>
                )}
            </Modal>
        </div>
    );
}
