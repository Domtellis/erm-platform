import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Gavel } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { DecisionReviewCard } from '../components/decisioning/DecisionReviewCard';
import { ClosureCard } from '../components/decisioning/ClosureCard';
import { SLABadge } from '../components/common/SLABadge';
import { SLACountdown } from '../components/common/SLACountdown';
import { getAiSuggestion } from '../api/ai';
import { AISuggestionCard } from '../components/ai/AISuggestionCard';

interface BreachCase {
    id: string;
    site_id: string;
    metric_name: string;
    observed_value: number;
    severity: string;
    status: string;
    metrics?: Record<string, unknown>;
    triage_due_at?: string;
    decision_due_at?: string;
    closure_due_at?: string;
    triage_completed_at?: string;
    decision_approved_at?: string;
    closed_at?: string;
}

export function DecisioningPage() {
    const auth = useAuth();
    const [selectedCase, setSelectedCase] = useState<BreachCase | null>(null);

    const { data: aiSuggestion, isLoading: isAiLoading } = useQuery({
        queryKey: ['ai-suggestion', selectedCase?.id],
        queryFn: () => getAiSuggestion(selectedCase!.id, auth.user?.access_token || ''),
        enabled: !!selectedCase && !!auth.user?.access_token,
    });

    const { data: cases, isLoading } = useQuery<BreachCase[]>({
        queryKey: ['breaches'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:4010/breaches');
            return response.data;
        },
    });

    const [activeTab, setActiveTab] = useState<'active' | 'closed'>('active');

    const activeCases = cases?.filter(c => ['open', 'triaged', 'decision_approved'].includes(c.status)) || [];
    const closedCases = cases?.filter(c => c.status === 'closed') || [];

    const displayedCases = activeTab === 'active' ? activeCases : closedCases;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Decisioning & Approvals</h1>
                    <p className="mt-2 text-slate-500">Review appetite breaches and record governance decisions.</p>
                </div>
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Active ({activeCases.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('closed')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'closed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Closed ({closedCases.length})
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400">Loading cases...</div>
                ) : displayedCases.length === 0 ? (
                    <div className="card border-dashed border-2 p-12 text-center">
                        <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-4 text-slate-500">
                            {activeTab === 'active' ? 'No pending breaches require decisioning.' : 'No closed cases found.'}
                        </p>
                    </div>
                ) : (
                    displayedCases.map((item) => (
                        <div key={item.id} className="card p-6 flex items-center justify-between group hover:border-crm-accent transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className={`rounded-lg p-3 ${item.status === 'closed' ? 'bg-slate-100 text-slate-500' :
                                    item.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                    }`}>
                                    <Gavel className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h3 className="text-sm font-semibold text-slate-900">{item.site_id} - {item.metric_name}</h3>
                                        {item.status === 'closed' && <span className="badge badge-outline">Closed</span>}
                                    </div>
                                    <p className="text-xs text-slate-400">Breach ID: {item.id.slice(0, 12)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8">
                                <div className="text-right">
                                    <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider">Observed</span>
                                    <span className="text-sm font-mono font-medium text-slate-900">{item.observed_value}</span>
                                </div>

                                <div className="flex flex-col items-end space-y-1 min-w-[120px]">
                                    {(() => {
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
                                        if (sla && sla.due) {
                                            return sla.completed ? (
                                                <SLABadge label={sla.label} dueAt={sla.due} completedAt={sla.completed} />
                                            ) : (
                                                <SLACountdown label={sla.label} dueDate={sla.due} />
                                            );
                                        }
                                        return null;
                                    })()}
                                </div>

                                {item.status !== 'closed' && (
                                    <button
                                        onClick={() => setSelectedCase(item)}
                                        className="btn btn-secondary flex items-center group-hover:bg-crm-accent group-hover:text-white group-hover:border-crm-accent transition-all"
                                    >
                                        {item.status === 'decision_approved' ? 'Close Case' : 'Review Case'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={!!selectedCase}
                onClose={() => setSelectedCase(null)}
                title={selectedCase?.status === 'decision_approved' ? "Close Breach Case" : "Record Governance Decision"}
            >
                {selectedCase && (
                    selectedCase.status === 'decision_approved' ? (
                        <ClosureCard
                            caseData={selectedCase}
                            onClose={() => setSelectedCase(null)}
                        />
                    ) : (
                        <div className="space-y-6">
                            {/* AI Suggestion Section */}
                            {aiSuggestion && (
                                <AISuggestionCard
                                    suggestion={aiSuggestion}
                                    breachCaseId={selectedCase.id}
                                />
                            )}
                            {isAiLoading && !aiSuggestion && (
                                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 animate-pulse flex items-center space-x-3">
                                    <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                    </div>
                                </div>
                            )}

                            <DecisionReviewCard
                                caseData={selectedCase}
                                onClose={() => setSelectedCase(null)}
                            />
                        </div>
                    )
                )}
            </Modal>
        </div>
    );
}
