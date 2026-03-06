import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentAppetite, updateThresholdLimit } from '../api/appetite';
import type { Threshold, AppetiteStatement } from '../api/appetite';
import { Save, AlertTriangle, ShieldAlert } from 'lucide-react';

export function AppetiteSettingsPage() {
    const queryClient = useQueryClient();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);

    const { data: appetite, isLoading, error } = useQuery<AppetiteStatement>({
        queryKey: ['appetite-current', 'safety'],
        queryFn: () => getCurrentAppetite('safety'),
    });

    const mutation = useMutation({
        mutationFn: ({ id, limit }: { id: string; limit: number }) => updateThresholdLimit(id, limit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appetite-current'] });
            setEditingId(null);
        },
    });

    const handleEditClick = (threshold: Threshold) => {
        setEditingId(threshold.id);
        setEditValue(threshold.limit_value);
    };

    const handleSave = (id: string) => {
        mutation.mutate({ id, limit: editValue });
    };

    if (isLoading) return <div className="p-8">Loading Appetite limits...</div>;
    if (error || !appetite) return <div className="p-8 text-crm-danger">Failed to load thresholds. Ensure the backend is running.</div>;

    const zeroTolerance = appetite.thresholds.filter(t => t.limit_value === 0);
    const measurable = appetite.thresholds.filter(t => t.limit_value !== 0);

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Appetite Thresholds</h1>
                <p className="mt-2 text-slate-500">Manage the acceptable hazard limits across the 14 S-AIR safety metrics.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center">
                    <ShieldAlert className="h-5 w-5 text-red-600 mr-2" />
                    <h2 className="text-lg font-semibold text-red-900">Zero-Tolerance Metrics (Critical Breaches)</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {zeroTolerance.map(t => (
                        <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="w-1/3">
                                <h3 className="font-semibold text-slate-900 font-mono text-sm">{t.metric_name}</h3>
                            </div>
                            <div className="w-1/3 flex items-center text-slate-500 text-sm">
                                <span className="bg-slate-100 px-2 py-1 rounded font-mono text-xs mr-3">{t.operator}</span>
                                {editingId === t.id ? (
                                    <input
                                        type="number"
                                        className="w-24 px-2 py-1 border border-crm-brand rounded text-slate-900"
                                        value={editValue}
                                        onChange={(e) => setEditValue(Number(e.target.value))}
                                    />
                                ) : (
                                    <span className="font-bold text-slate-900 text-lg">{t.limit_value}</span>
                                )}
                            </div>
                            <div className="w-1/3 flex justify-end">
                                {editingId === t.id ? (
                                    <button
                                        onClick={() => handleSave(t.id)}
                                        disabled={mutation.isPending}
                                        className="flex items-center text-white bg-crm-brand px-3 py-1.5 rounded hover:bg-crm-accent transition-colors"
                                    >
                                        <Save className="h-4 w-4 mr-1.5" /> Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEditClick(t)}
                                        className="text-sm font-medium text-crm-accent hover:underline"
                                    >
                                        Edit Limit
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    <h2 className="text-lg font-semibold text-slate-900">Tiered Warning Metrics</h2>
                </div>
                <div className="divide-y divide-slate-100">
                    {measurable.map(t => (
                        <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="w-1/3">
                                <h3 className="font-semibold text-slate-900 font-mono text-sm">{t.metric_name}</h3>
                            </div>
                            <div className="w-1/3 flex items-center text-slate-500 text-sm">
                                <span className="bg-slate-100 px-2 py-1 rounded font-mono text-xs mr-3">{t.operator}</span>
                                {editingId === t.id ? (
                                    <input
                                        type="number"
                                        className="w-24 px-2 py-1 border border-crm-brand rounded text-slate-900"
                                        value={editValue}
                                        onChange={(e) => setEditValue(Number(e.target.value))}
                                    />
                                ) : (
                                    <span className="font-bold text-slate-900 text-lg">{t.limit_value}</span>
                                )}
                            </div>
                            <div className="w-1/3 flex justify-end">
                                {editingId === t.id ? (
                                    <button
                                        onClick={() => handleSave(t.id)}
                                        disabled={mutation.isPending}
                                        className="flex items-center text-white bg-crm-brand px-3 py-1.5 rounded hover:bg-crm-accent transition-colors"
                                    >
                                        <Save className="h-4 w-4 mr-1.5" /> Save
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleEditClick(t)}
                                        className="text-sm font-medium text-crm-accent hover:underline"
                                    >
                                        Edit Limit
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
