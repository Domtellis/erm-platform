import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertCircle, ShieldCheck, ClipboardList, Settings } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Monitoring', href: '/monitoring', icon: AlertCircle },
    { name: 'Decisioning', href: '/decisioning', icon: ShieldCheck },
    { name: 'Audit Logs', href: '/audit', icon: ClipboardList },
    { name: 'Reports', href: '/reports', icon: LayoutDashboard }, // using LayoutDashboard as placeholder or maybe ChartBar if available
];

export function Sidebar() {
    return (
        <div className="flex h-screen w-64 flex-col bg-crm-brand text-white">
            <div className="flex h-16 items-center px-6">
                <span className="text-xl font-bold tracking-tight text-white">
                    <span className="text-crm-accent">ERM</span> Platform
                </span>
            </div>

            <nav className="flex-1 space-y-1 px-4 py-4">
                {navigation.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) =>
                            cn(
                                'group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-crm-accent text-white'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            )
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-white/10 p-4">
                <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white">
                    <Settings className="mr-3 h-5 w-5" />
                    Settings
                </button>
            </div>
        </div>
    );
}
