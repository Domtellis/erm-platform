import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAssessment, type CreateRiskAssessmentDto } from '../../api/risk';
import { useAuth } from 'react-oidc-context';

interface Props {
    breachCaseId: string;
    onSuccess: () => void;
}

export const RiskAssessmentForm: React.FC<Props> = ({ breachCaseId, onSuccess }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [impact, setImpact] = useState(1);
    const [likelihood, setLikelihood] = useState(1);

    const mutation = useMutation({
        mutationFn: (data: CreateRiskAssessmentDto) => createAssessment(data, user?.access_token || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['risk-assessments', breachCaseId] });
            onSuccess();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            breach_case_id: breachCaseId,
            title,
            summary,
            impact_score: impact,
            likelihood_score: likelihood,
            submitted_by: user?.profile.sub || 'unknown'
        });
    };

    if (mutation.isPending) return <div>Submitting Assessment...</div>;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                    className="w-full border rounded p-2 text-slate-900"
                    placeholder="e.g. Critical Data Exposure"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Summary (Optional)</label>
                <textarea
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    className="w-full border rounded p-2 text-slate-900"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Impact (1-5)</label>
                    <input
                        type="number" min="1" max="5"
                        value={impact}
                        onChange={e => setImpact(parseInt(e.target.value))}
                        className="w-full border rounded p-2 text-slate-900"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Likelihood (1-5)</label>
                    <input
                        type="number" min="1" max="5"
                        value={likelihood}
                        onChange={e => setLikelihood(parseInt(e.target.value))}
                        className="w-full border rounded p-2 text-slate-900"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-2">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Submit Assessment
                </button>
            </div>
            {mutation.isError && <div className="text-red-500">Failed to submit assessment</div>}
        </form>
    );
};
