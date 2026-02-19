import React, { useState, useEffect } from 'react';

interface SLACountdownProps {
    dueDate?: string;
    label: string;
}

export const SLACountdown: React.FC<SLACountdownProps> = ({ dueDate, label }) => {
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [status, setStatus] = useState<'normal' | 'warning' | 'overdue'>('normal');

    useEffect(() => {
        if (!dueDate) return;

        const calculateTimeLeft = () => {
            const now = new Date();
            const due = new Date(dueDate);
            const diff = due.getTime() - now.getTime();

            if (diff <= 0) {
                setStatus('overdue');
                setTimeLeft('Overdue');
                return;
            }

            // Warning if less than 1 hour (3600000 ms)
            if (diff < 3600000) {
                setStatus('warning');
            } else {
                setStatus('normal');
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / 1000 / 60) % 60);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h`);
            } else if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${minutes}m`);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [dueDate]);

    if (!dueDate) return null;

    let badgeClass = 'bg-gray-100 text-gray-800';
    if (status === 'overdue') badgeClass = 'bg-red-100 text-red-800 border border-red-200';
    if (status === 'warning') badgeClass = 'bg-amber-100 text-amber-800 border border-amber-200';
    if (status === 'normal') badgeClass = 'bg-green-100 text-green-800 border border-green-200';

    return (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
            <span className="mr-1 font-semibold">{label}:</span>
            {timeLeft}
        </div>
    );
};
