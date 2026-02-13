import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

interface BreachFormValues {
    site_id: string;
    metric_name: string;
    observed_value: number;
    bu_id: string;
    category: string;
    severity: string;
}

export function BreachSubmissionForm({ onSuccess }: { onSuccess: () => void }) {
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<BreachFormValues>({
        defaultValues: {
            bu_id: 'BU-NORTH-01',
            category: 'safety',
            severity: 'medium',
            metric_name: 'sensor_pressure_psi'
        }
    });

    const mutation = useMutation({
        mutationFn: (newBreach: BreachFormValues) => {
            console.log('Submitting breach:', newBreach);
            return axios.post('http://localhost:4010/breaches/manual-submission', newBreach);
        },
        onSuccess: () => {
            console.log('Submission successful');
            queryClient.invalidateQueries({ queryKey: ['breaches'] });
            reset();
            onSuccess();
        },
        onError: (error: any) => {
            console.error('Submission failed:', error.response?.data || error.message);
            alert(`Error: ${error.response?.data?.message || 'Failed to connect to monitoring service'}`);
        }
    });

    return (
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Site ID</label>
                    <input
                        {...register('site_id', { required: 'Site ID is required' })}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-crm-accent focus:outline-none focus:ring-1 focus:ring-crm-accent"
                        placeholder="e.g. SITE-01"
                    />
                    {errors.site_id && <span className="text-xs text-crm-danger">{errors.site_id.message}</span>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Business Unit</label>
                    <input
                        {...register('bu_id', { required: 'BU ID is required' })}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-crm-accent focus:outline-none focus:ring-1 focus:ring-crm-accent bg-slate-50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Metric Name</label>
                    <select
                        {...register('metric_name', { required: 'Metric is required' })}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-crm-accent focus:outline-none focus:ring-1 focus:ring-crm-accent"
                    >
                        <option value="sensor_pressure_psi">Sensor Pressure (PSI)</option>
                        <option value="temp_celsius">Temperature (Celsius)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Severity</label>
                    <select
                        {...register('severity')}
                        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-crm-accent focus:outline-none focus:ring-1 focus:ring-crm-accent"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700">Observed Value</label>
                <input
                    type="number"
                    step="0.01"
                    {...register('observed_value', { required: true, valueAsNumber: true })}
                    className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-crm-accent focus:outline-none focus:ring-1 focus:ring-crm-accent"
                />
            </div>

            {/* Hidden category for event routing */}
            <input type="hidden" {...register('category')} />

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="btn btn-primary w-full"
                >
                    {mutation.isPending ? 'Submitting...' : 'Submit Breach Case'}
                </button>
            </div>
        </form>
    );
}
