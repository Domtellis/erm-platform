import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';
import { useAuth } from 'react-oidc-context';

interface ClosureCardProps {
    caseData: {
        id: string;
        site_id: string;
        metric_name: string;
        observed_value: number;
    };
    onClose: () => void;
}

export function ClosureCard({ caseData, onClose }: ClosureCardProps) {
    const queryClient = useQueryClient();
    const auth = useAuth();

    const closeMutation = useMutation({
        mutationFn: async () => {
            await axios.post(`http://localhost:4010/breaches/${caseData.id}/close`, {}, {
                headers: { Authorization: `Bearer ${auth.user?.access_token}` }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['breaches'] });
            onClose();
        },
    });

    return (
        <div className="space-y-6">
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-900 flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Ready for Closure
                </h4>
                <p className="text-xs text-green-700 mt-1">
                    Decision has been approved. You can now close this case.
                </p>
            </div>

            <div className="flex justify-end space-x-3">
                <button onClick={onClose} className="btn bg-slate-100 text-slate-600 hover:bg-slate-200">
                    Cancel
                </button>
                <button
                    onClick={() => closeMutation.mutate()}
                    disabled={closeMutation.isPending}
                    className="btn btn-primary"
                >
                    {closeMutation.isPending ? 'Closing...' : 'Close Case'}
                </button>
            </div>
        </div>
    );
}
