import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Wallet,
    Menu,
    X,
    TrendingUp,
    User
} from 'lucide-react';
import { useStore } from '../store';
import { ROLE_LABELS } from '../types';

interface LayoutProps {
    children: React.ReactNode;
}

// Helper to get initials from name
function getInitials(name: string): string {
    return name
        .split(' ')
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// Color palette for members
const MEMBER_COLORS = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-emerald-500',
    'bg-amber-500',
];

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const members = useStore((state) => state.members);

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Aset', href: '/assets', icon: Wallet },
    ];

    const isActive = (href: string) => {
        if (href === '/') return location.pathname === '/';
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 glass-card rounded-none border-t-0 border-x-0">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg gradient-text">Asset Tracker</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`
        fixed top-0 left-0 z-30 h-full w-72 glass-card rounded-none border-y-0 border-l-0
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="flex flex-col h-full p-6">
                    {/* Logo */}
                    <div className="hidden lg:flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl gradient-text">Asset Tracker</h1>
                            <p className="text-xs text-gray-500">Family Finance</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1 mt-16 lg:mt-0">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${active
                                            ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/25'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Members */}
                    <div className="mt-8">
                        <div className="flex items-center gap-2 px-4 mb-3">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Anggota</span>
                        </div>
                        <div className="space-y-1">
                            {members.map((member, index) => {
                                const active = location.pathname === `/member/${member.id}`;
                                const colorClass = MEMBER_COLORS[index % MEMBER_COLORS.length];
                                return (
                                    <Link
                                        key={member.id}
                                        to={`/member/${member.id}`}
                                        onClick={() => setIsSidebarOpen(false)}
                                        className={`
                      flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                      ${active
                                                ? 'bg-primary-50 text-primary-700 font-medium'
                                                : 'text-gray-600 hover:bg-gray-50'
                                            }
                    `}
                                    >
                                        <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-white text-xs font-semibold`}>
                                            {getInitials(member.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{member.name}</p>
                                            <p className="text-xs text-gray-400">{ROLE_LABELS[member.role]}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-400 text-center">
                            Family Asset Tracker v1.0
                        </p>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:pl-72 pt-16 lg:pt-0 min-h-screen">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
