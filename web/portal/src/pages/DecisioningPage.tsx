import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ShieldCheck, ArrowRight, Gavel } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { DecisionReviewCard } from '../components/decisioning/DecisionReviewCard';

interface BreachCase {
    id: string;
    site_id: string;
    metric_name: string;
    observed_value: number;
    severity: string;
    status: string;
}

export function DecisioningPage() {
    const [selectedCase, setSelectedCase] = useState<BreachCase | null>(null);

    const { data: cases, isLoading } = useQuery<BreachCase[]>({
        queryKey: ['breaches'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:4010/breaches');
            return response.data;
        },
    });

    const pendingCases = cases?.filter(c => c.status === 'open') || [];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Decisioning & Approvals</h1>
                <p className="mt-2 text-slate-500">Review appetite breaches and record governance decisions.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="text-center py-12 text-slate-400">Loading cases...</div>
                ) : pendingCases.length === 0 ? (
                    <div className="card border-dashed border-2 p-12 text-center">
                        <ShieldCheck className="mx-auto h-12 w-12 text-slate-300" />
                        <p className="mt-4 text-slate-500">No pending breaches require decisioning.</p>
                    </div>
                ) : (
                    pendingCases.map((item) => (
                        <div key={item.id} className="card p-6 flex items-center justify-between group hover:border-crm-accent transition-colors">
                            <div className="flex items-center space-x-4">
                                <div className={`rounded-lg p-3 ${item.severity === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                                    <Gavel className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900">{item.site_id} - {item.metric_name}</h3>
                                    <p className="text-xs text-slate-400">Breach ID: {item.id.slice(0, 12)}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-8">
                                <div className="text-right">
                                    <span className="block text-xs uppercase font-bold text-slate-400 tracking-wider">Observed</span>
                                    <span className="text-sm font-mono font-medium text-slate-900">{item.observed_value}</span>
                                </div>
                                <button
                                    onClick={() => setSelectedCase(item)}
                                    className="btn btn-secondary flex items-center group-hover:bg-crm-accent group-hover:text-white group-hover:border-crm-accent transition-all"
                                >
                                    Review Case
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal
                isOpen={!!selectedCase}
                onClose={() => setSelectedCase(null)}
                title="Record Governance Decision"
            >
                {selectedCase && (
                    <DecisionReviewCard
                        caseData={selectedCase}
                        onClose={() => setSelectedCase(null)}
                    />
                )}
            </Modal>
        </div>
    );
}
