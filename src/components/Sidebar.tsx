import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, LogOut, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFriendNotifStore } from '@/store/friendNotifStore';
import { NAV_CATEGORIES } from '@/constants/navigation';

export default function Sidebar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const pendingCount = useFriendNotifStore((s) => s.pendingCount);
    const unreadMessages = useFriendNotifStore((s) => s.unreadMessages);
    const totalNotifs = pendingCount + unreadMessages.length;

    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.id === '1c30001a-ba62-47f4-ad41-bbcdc137e221' && user?.email === 'huckalexis0@gmail.com';

    // State for collapsible categories
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const toggleCategory = (title: string) => {
        setCollapsed(prev => ({ ...prev, [title]: !prev[title] }));
    };

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 bg-surface-800 border-r border-surface-700/50 z-40 py-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5 px-6 mb-8 hover:opacity-80 transition-opacity cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center shadow-lg shadow-primary-500/5">
                    <Flame size={18} className="text-primary-400" />
                </div>
                <div>
                    <p className="text-sm font-black text-white leading-none uppercase tracking-tight italic">Hábitos</p>
                    <p className="text-[10px] text-white/30 font-medium">Tu día, tu ritmo</p>
                </div>
            </div>

            {/* Nav links categorized */}
            <nav className="flex flex-col gap-6 px-4 flex-1 overflow-y-auto scrollbar-hide">
                {NAV_CATEGORIES.map((category) => {
                    const isCollapsed = collapsed[category.title];
                    const visibleItems = category.items.filter(item => !item.adminOnly || isAdmin);

                    if (visibleItems.length === 0) return null;

                    return (
                        <div key={category.title} className="flex flex-col gap-1">
                            <button
                                onClick={() => toggleCategory(category.title)}
                                className="flex items-center justify-between px-3 mb-1 group"
                            >
                                <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] group-hover:text-white/60 transition-colors">
                                    {category.title}
                                </span>
                                {isCollapsed ? <ChevronRight size={10} className="text-muted" /> : <ChevronDown size={10} className="text-muted" />}
                            </button>

                            {!isCollapsed && (
                                <div className="flex flex-col gap-0.5 animate-fadeIn">
                                    {visibleItems.map(({ to, icon: Icon, tKey }) => {
                                        const isFriends = to === '/friends';
                                        const showBadge = isFriends && totalNotifs > 0;

                                        return (
                                            <NavLink key={to} to={to} end={to === '/'}>
                                                {({ isActive }) => (
                                                    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer relative group ${isActive
                                                        ? 'bg-primary-500/10 text-primary-400'
                                                        : 'text-white/40 hover:text-white hover:bg-surface-700/40'
                                                        }`}>
                                                        <div className="relative">
                                                            <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} className={isActive ? 'drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]' : ''} />
                                                            {showBadge && (
                                                                <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5
                                                                                bg-accent-red rounded-full flex items-center justify-center
                                                                                text-[8px] font-bold text-white shadow-lg shadow-accent-red/20">
                                                                    {totalNotifs > 9 ? '9+' : totalNotifs}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                                                            {tKey === 'Admin' ? 'Admin' : t(tKey)}
                                                        </span>

                                                        {isActive && (
                                                            <div className="ml-auto w-1 h-4 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]" />
                                                        )}
                                                    </div>
                                                )}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Logout footer */}
            <div className="px-4 mt-auto pt-4 border-t border-surface-700/40">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                               text-white/40 hover:text-accent-red hover:bg-accent-red/10
                               transition-all duration-200 text-sm font-bold group"
                >
                    <LogOut size={18} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" />
                    Cerrar sesión
                </button>
                <div className="flex items-center justify-between px-4 mt-2">
                    <p className="text-[9px] font-black text-white/10 uppercase tracking-widest tabular-nums">v1.2.0</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-green/20 animate-pulse" />
                </div>
            </div>
        </aside>
    );
}
