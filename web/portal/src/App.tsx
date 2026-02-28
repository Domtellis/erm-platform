import { Routes, Route } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Layout } from './components/layout/Layout';
import { MonitoringPage } from './pages/MonitoringPage';
import { DecisioningPage } from './pages/DecisioningPage';
import { AuditPage } from './pages/AuditPage';
import { ReportsPage } from './pages/ReportsPage';

import { getBreaches, getMetrics } from './api/monitoring';
import { getPendingCount } from './api/ai';
import type { BreachCase } from './api/monitoring';
import { useAuth } from 'react-oidc-context';

interface Decision {
  status: string;
  approvals: unknown[];
}

// ...

function Dashboard() {
  const { data: breachCases, isLoading: isLoadingBreaches } = useQuery<BreachCase[]>({
    queryKey: ['dashboard-breaches'],
    queryFn: () => getBreaches(),
    refetchInterval: 5000,
  });

  const { data: decisions, isLoading: isLoadingDecisions } = useQuery<Decision[]>({
    queryKey: ['dashboard-decisions'],
    queryFn: async () => {
      const response = await axios.get(`/api/decisioning/decisions`);
      return response.data;
    },
    refetchInterval: 5000,
  });

  const auth = useAuth();
  const { data: pendingFeedback, isLoading: isLoadingFeedback } = useQuery({
    queryKey: ['dashboard-pending-feedback'],
    queryFn: () => getPendingCount(auth.user?.access_token || ''),
    refetchInterval: 5000,
    enabled: !!auth.user?.access_token,
  });

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => getMetrics(),
    refetchInterval: 5000,
  });

  const activeBreaches = breachCases?.filter(b => b.status === 'open').length || 0;
  const pendingDecisions = decisions?.filter(d => d.status === 'pending' && d.approvals.length === 0).length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-500">Welcome to the ERM Platform Control Center.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-slate-500">Active Breaches</h3>
          <p className="mt-2 text-3xl font-bold text-crm-danger">
            {isLoadingBreaches ? '...' : activeBreaches}
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-slate-500">Pending Decisions</h3>
          <p className="mt-2 text-3xl font-bold text-crm-warning">
            {isLoadingDecisions ? '...' : pendingDecisions}
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-slate-500">Human Feedback Required</h3>
          <p className={`mt-2 text-3xl font-bold ${isLoadingFeedback ? '' : (pendingFeedback || 0) > 0 ? 'text-crm-accent' : 'text-slate-900'}`}>
            {isLoadingFeedback ? '...' : pendingFeedback}
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-slate-500">Appetite Compliance</h3>
          <p className={`mt-2 text-3xl font-bold ${isLoadingMetrics ? '' : (metrics?.appetite_compliance_score || 0) < 90 ? 'text-crm-danger' : 'text-crm-success'}`}>
            {isLoadingMetrics ? '...' : `${metrics?.appetite_compliance_score || 100}%`}
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="monitoring" element={<MonitoringPage />} />
        <Route path="decisioning" element={<DecisioningPage />} />
        <Route path="audit" element={<AuditPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
