import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRiskTrends, getBurndown } from '../api/reports';
import { useAuth } from 'react-oidc-context';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download } from 'lucide-react';

export function ReportsPage() {
    const auth = useAuth();
    const [days, setDays] = useState(30);

    const { data: trends, isLoading } = useQuery({
        queryKey: ['risk-trends', days],
        queryFn: () => getRiskTrends(days, auth.user?.access_token),
    });

    const downloadCsv = () => {
        if (!trends) return;
        const headers = ['Date', 'Critical', 'High', 'Medium', 'Low'];
        const csvContent = [
            headers.join(','),
            ...trends.map(row => `${row.date},${row.critical},${row.high},${row.medium},${row.low}`)
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `risk_trends_${days}d.csv`;
        link.click();
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Risk Intelligence Reports</h1>
                    <p className="mt-2 text-slate-500">Historical analysis of breach severity and risk posture.</p>
                </div>
                <div className="flex space-x-4">
                    <select
                        value={days}
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="rounded-md border border-slate-300 bg-white text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    >
                        <option value={7}>Last 7 Days</option>
                        <option value={30}>Last 30 Days</option>
                        <option value={90}>Last 90 Days</option>
                    </select>
                    <button
                        onClick={downloadCsv}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="card p-6">
                <h3 className="text-lg font-medium text-slate-900 mb-6">Breach Severity Trends (Inflow)</h3>
                <div className="h-96 w-full">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center text-slate-400">Loading analysis...</div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" />
                                <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} name="High" />
                                <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} name="Medium" />
                                <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={2} name="Low" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <BurndownChart days={days} />
        </div>
    );
}

function BurndownChart({ days }: { days: number }) {
    const auth = useAuth();
    const { data: burndown, isLoading } = useQuery({
        queryKey: ['risk-burndown', days],
        queryFn: () => getBurndown(days, auth.user?.access_token),
    });

    return (
        <div className="card p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-6">Total Open Risks (Burndown)</h3>
            <div className="h-96 w-full">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center text-slate-400">Calculating risk balance...</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={burndown}>
                            <defs>
                                <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" />
                            <YAxis />
                            <CartesianGrid strokeDasharray="3 3" />
                            <Tooltip />
                            <Area type="monotone" dataKey="open" stroke="#8884d8" fillOpacity={1} fill="url(#colorOpen)" name="Open Breaches" />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
