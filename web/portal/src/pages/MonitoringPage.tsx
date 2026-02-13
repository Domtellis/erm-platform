import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Clock, CheckCircle } from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { BreachSubmissionForm } from '../components/monitoring/BreachSubmissionForm';

interface BreachCase {
    id: string;
    site_id: string;
    metric_name: string;
    observed_value: number;
    severity: string;
    status: string;
    created_at: string;
}

export function MonitoringPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: cases, isLoading } = useQuery<BreachCase[]>({
        queryKey: ['breaches'],
        queryFn: async () => {
            const response = await axios.get('http://localhost:4010/breaches');
            return response.data;
        },
        refetchInterval: 5000,
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Monitoring & Breaches</h1>
                    <p className="mt-2 text-slate-500">Live feed of appetite breaches across all sites.</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center">
                    <Plus className="mr-2 h-5 w-5" />
                    Report Breach
                </button>
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {isLoading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">Loading cases...</td></tr>
                            ) : cases?.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No breaches detected.</td></tr>
                            ) : (
                                cases?.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-crm-brand">{item.id.slice(0, 8)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.site_id}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{item.metric_name}</td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-900">{item.observed_value}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.severity === 'high' ? 'bg-red-100 text-red-800' :
                                                item.severity === 'medium' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                {item.severity.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-slate-600">
                                                {item.status === 'open' ? <Clock className="mr-2 h-4 w-4 text-crm-warning" /> : <CheckCircle className="mr-2 h-4 w-4 text-crm-success" />}
                                                {item.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-slate-400">
                                            {new Date(item.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report Site Breach">
                <BreachSubmissionForm onSuccess={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
}
