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
            metric_name: 'wind_speed_knots'
        }
    });

    const mutation = useMutation({
        mutationFn: (newBreach: BreachFormValues) => {
            console.log('Submitting breach:', newBreach);
            return axios.post('/api/monitoring/breaches/manual-submission', newBreach);

        },
        onSuccess: () => {
            console.log('Submission successful');
            queryClient.invalidateQueries({ queryKey: ['breaches'] });
            reset();
            onSuccess();
        },
        onError: (error: unknown) => {
            const err = error as { response?: { data?: { message?: string } }, message?: string };
            console.error('Submission failed:', err.response?.data || err.message);
            alert(`Error: ${err.response?.data?.message || 'Failed to connect to monitoring service'}`);
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
                        <option value="ltifr">LTIFR (Lost Time Injury Rate)</option>
                        <option value="dropped_object_rate">Dropped Object Rate</option>
                        <option value="near_miss_reporting_rate">Near Miss Reporting Rate</option>
                        <option value="overload_alarm_frequency">Crane Overload Alarms</option>
                        <option value="wind_protocol_breach_count">Wind Protocol Breaches</option>
                        <option value="wah_incident_rate">Working at Height Incidents</option>
                        <option value="ptw_audit_pass_rate">PTW Audit Pass %</option>
                        <option value="traffic_separation_breach_rate">Traffic Separation Breaches</option>
                        <option value="safety_critical_maintenance_overdue_rate">Maintenance Overdue Rate</option>
                        <option value="contractor_incident_rate">Contractor Incident Rate</option>
                        <option value="capa_closure_rate">CAPA Closure %</option>
                        <option value="fatigue_rest_violation_rate">Fatigue Rest Violations</option>
                        <option value="cce_score">CCE Score (Control Effectiveness)</option>
                        <option value="high_risk_mitigation_rate">High Risk Mitigation Rate</option>
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
                        <option value="critical">Critical</option>
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
