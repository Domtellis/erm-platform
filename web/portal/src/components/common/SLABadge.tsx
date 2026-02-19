import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface SLABadgeProps {
    label: string;
    dueAt?: string | Date;
    completedAt?: string | Date;
}

export const SLABadge: React.FC<SLABadgeProps> = ({ label, dueAt, completedAt }) => {
    if (!dueAt || !completedAt) return null;

    const due = new Date(dueAt).getTime();
    const completed = new Date(completedAt).getTime();
    const met = completed <= due;

    return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${met
                ? 'bg-green-100 text-green-800 border-green-200'
                : 'bg-red-100 text-red-800 border-red-200'
            }`}>
            {met ? <CheckCircle className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
            <span className="font-semibold mr-1">{label}:</span>
            {met ? 'Met' : 'Missed'}
        </div>
    );
};
