import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ClipboardList, Database, Terminal } from 'lucide-react';
import { useAuth } from 'react-oidc-context';

interface AuditEvent {
    id: string;
    event_id: string;
    type: string;
    source: string;
    payload: any;
    occurred_at: string;
}

export function AuditPage() {
    const { user } = useAuth();

    const { data: logs, isLoading } = useQuery<AuditEvent[]>({
        queryKey: ['audit-logs'],
        queryFn: async () => {
            try {
                const response = await axios.get('http://localhost:4013/audit', {
                    headers: {
                        Authorization: `Bearer ${user?.access_token}`
                    }
                });
                return response.data;
            } catch (e) {
                console.error("Failed to fetch audit logs", e);
                return [];
            }
        },
        enabled: !!user?.access_token,
        refetchInterval: 5000,
    });

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 font-sans">Audit Trail</h1>
                <p className="mt-2 text-slate-500">Immutable record of all platform and governance events.</p>
            </div>

            <div className="card">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        <Terminal className="mr-2 h-4 w-4" />
                        Event Stream
                    </div>
                    <div className="flex items-center text-xs text-crm-muted">
                        <Database className="mr-1 h-3 w-3" />
                        Append-Only Store
                    </div>
                </div>

                <div className="divide-y divide-slate-100">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-400">Streaming logs...</div>
                    ) : logs?.length === 0 ? (
                        <div className="p-12 text-center">
                            <ClipboardList className="mx-auto h-12 w-12 text-slate-200" />
                            <p className="mt-4 text-slate-400">No events recorded in the audit store.</p>
                        </div>
                    ) : (
                        logs?.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start space-x-4">
                                <div className="mt-1">
                                    <span className={`h-2 w-2 rounded-full block ${log.type.includes('breach') ? 'bg-red-400' :
                                        log.type.includes('decision') ? 'bg-blue-400' : 'bg-slate-300'
                                        }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-slate-900 truncate">{log.type}</p>
                                        <span className="text-xs text-slate-400 font-mono">{new Date(log.occurred_at).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1 truncate">Source: {log.source}</p>
                                    <pre className="mt-2 text-[10px] bg-slate-900 text-slate-300 p-2 rounded-md overflow-x-auto font-mono">
                                        {JSON.stringify(log.payload, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
