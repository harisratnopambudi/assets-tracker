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
        <div className="min-h-screen bg-gray-50/50">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex fixed top-0 left-0 z-30 h-full w-72 glass-card rounded-none border-y-0 border-l-0 flex-col transition-all duration-300">
                <div className="flex flex-col h-full p-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl gradient-text">Asset Tracker</h1>
                            <p className="text-xs text-gray-500">Family Finance</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
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
                        <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-400px)] pr-2 scrollbar-hide">
                            {members.map((member, index) => {
                                const active = location.pathname === `/member/${member.id}`;
                                const colorClass = MEMBER_COLORS[index % MEMBER_COLORS.length];
                                return (
                                    <Link
                                        key={member.id}
                                        to={`/member/${member.id}`}
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

            {/* Mobile Bottom Navigation */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
                <div className="flex items-center justify-around p-2">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`
                                    flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[64px]
                                    ${active ? 'text-primary-600' : 'text-gray-400 hover:bg-gray-50'}
                                `}
                            >
                                <div className={`p-1.5 rounded-full mb-1 ${active ? 'bg-primary-50' : ''}`}>
                                    <Icon className={`w-6 h-6 ${active ? 'text-primary-600' : 'text-gray-400'}`} />
                                </div>
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        );
                    })}

                    {/* Mobile Menu Member Button (Optional - or just list them?) */}
                    {/* For now, let's keep it simple and maybe add a distinct "Members" tab if needed, 
                        BUT user data shows members are accessed via sidebar. 
                        Let's standardise: Dashboard | Assets | ... Members? 
                        
                        Currently, there's no page for "All Members" list except the sidebar.
                        To make it robust, let's add a simple Dropdown or Drawer trigger for members in the bottom nav 
                        OR just list them in a "Members" page.
                        
                        Given time constraints, let's add a "Members" trigger that opens a simple bottom sheet/modal?
                        Actually, let's just make the Bottom Nav: Dashboard | Aset | Anggota (opens drawer)
                    */}
                    <button
                        onClick={() => {
                            // Temporary simple alert or separate logic? 
                            // Better: Re-use the drawer logic just for members?
                            // Let's implement a "Members" tab that effectively toggles a Members List Drawer.
                            const drawer = document.getElementById('mobile-members-drawer');
                            if (drawer) drawer.classList.remove('translate-y-full');
                        }}
                        className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 hover:bg-gray-50 min-w-[64px]"
                    >
                        <div className="p-1.5 rounded-full mb-1">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-medium">Anggota</span>
                    </button>

                    <Link
                        to="/profile" // Assuming profile/settings placeholder
                        className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 hover:bg-gray-50 min-w-[64px]"
                        onClick={(e) => e.preventDefault()} // Placeholder
                    >
                        <div className="p-1.5 rounded-full mb-1">
                            <User className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-medium">Akun</span>
                    </Link>
                </div>
            </div>

            {/* Mobile Members Drawer */}
            <div
                id="mobile-members-drawer"
                className="lg:hidden fixed inset-x-0 bottom-[calc(60px+env(safe-area-inset-bottom))] z-40 bg-white rounded-t-2xl shadow-xl transform translate-y-full transition-transform duration-300 border-t border-gray-100"
                style={{ maxHeight: '70vh' }}
            >
                {/* Drag Handle */}
                <div
                    className="flex justify-center pt-3 pb-1"
                    onClick={() => document.getElementById('mobile-members-drawer')?.classList.add('translate-y-full')}
                >
                    <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 px-2">Daftar Anggota</h3>
                    <div className="space-y-2">
                        {members.map((member, index) => {
                            const colorClass = MEMBER_COLORS[index % MEMBER_COLORS.length];
                            return (
                                <Link
                                    key={member.id}
                                    to={`/member/${member.id}`}
                                    onClick={() => document.getElementById('mobile-members-drawer')?.classList.add('translate-y-full')}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                                >
                                    <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center text-white font-semibold`}>
                                        {getInitials(member.name)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{member.name}</p>
                                        <p className="text-xs text-gray-500">{ROLE_LABELS[member.role]}</p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Backdrop for Drawer - simpler approach: Click outside to close (handled by invisible div) 
               Actually, for simplicity in this turn, I'll just use the handle to close or link click.
            */}

            {/* Main Content */}
            <main className="lg:pl-72 min-h-screen pb-24 lg:pb-8 pt-4 lg:pt-0">
                <div className="p-4 lg:p-8 max-w-7xl mx-auto animate-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
