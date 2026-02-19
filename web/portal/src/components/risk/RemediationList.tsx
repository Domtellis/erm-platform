import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRemediations, createRemediation, type CreateRemediationDto } from '../../api/remediation';
import { useAuth } from 'react-oidc-context';

interface Props {
    riskAssessmentId: string;
}

export const RemediationList: React.FC<Props> = ({ riskAssessmentId }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [dueDate, setDueDate] = useState('');

    const { data: plans, isLoading } = useQuery({
        queryKey: ['remediations', riskAssessmentId],
        queryFn: () => getRemediations(riskAssessmentId, user?.access_token || ''),
        enabled: !!riskAssessmentId
    });

    const mutation = useMutation({
        mutationFn: (data: CreateRemediationDto) => createRemediation(data, user?.access_token || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['remediations', riskAssessmentId] });
            setIsAdding(false);
            setTitle('');
            setDescription('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            risk_assessment_id: riskAssessmentId,
            title,
            description,
            assigned_to: assignedTo,
            due_date: new Date(dueDate).toISOString()
        });
    };

    if (isLoading) return <div>Loading plans...</div>;

    return (
        <div className="mt-4 border-t pt-4">
            <h4 className="text-md font-semibold mb-2">Remediation Plans</h4>

            {plans?.length === 0 && <p className="text-gray-500 text-sm">No remediation plans yet.</p>}

            <ul className="space-y-2 mb-4">
                {plans?.map(plan => (
                    <li key={plan.id} className="border p-3 rounded bg-gray-50 flex justify-between items-center">
                        <div>
                            <p className="font-medium text-slate-900">{plan.title}</p>
                            <p className="text-sm text-gray-600">{plan.description}</p>
                            <p className="text-xs text-gray-500">Assigned: {plan.assigned_to} | Due: {new Date(plan.due_date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${plan.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {plan.status}
                        </span>
                    </li>
                ))}
            </ul>

            {!isAdding ? (
                <button
                    onClick={() => setIsAdding(true)}
                    className="text-sm text-blue-600 hover:underline"
                >
                    + Add Remediation Plan
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="bg-gray-50 p-3 rounded border space-y-3">
                    <input
                        className="w-full border rounded p-1 text-sm text-slate-900"
                        placeholder="Title"
                        value={title} onChange={e => setTitle(e.target.value)} required
                    />
                    <input
                        className="w-full border rounded p-1 text-sm text-slate-900"
                        placeholder="Description"
                        value={description} onChange={e => setDescription(e.target.value)} required
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            className="w-full border rounded p-1 text-sm text-slate-900"
                            placeholder="Assign To (User ID)"
                            value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required
                        />
                        <input
                            type="date"
                            className="w-full border rounded p-1 text-sm text-slate-900"
                            value={dueDate} onChange={e => setDueDate(e.target.value)} required
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="text-gray-600 text-sm">Cancel</button>
                        <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded text-sm">Save Plan</button>
                    </div>
                </form>
            )}
        </div>
    );
};
