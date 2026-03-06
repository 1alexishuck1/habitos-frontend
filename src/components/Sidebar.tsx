import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Flame, CheckSquare, BarChart2, Book, Settings, Users, LogOut, Dumbbell, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFriendNotifStore } from '@/store/friendNotifStore';

// Desktop sidebar — visible on lg+ screens

const navItems = [
    { to: '/', icon: Home, tKey: 'nav.today' },
    { to: '/habits', icon: Flame, tKey: 'nav.habits' },
    { to: '/tasks', icon: CheckSquare, tKey: 'nav.tasks' },
    { to: '/progress', icon: Zap, tKey: 'nav.progress' },
    { to: '/stats', icon: BarChart2, tKey: 'nav.stats' },
    { to: '/diary', icon: Book, tKey: 'nav.diary' },
    { to: '/friends', icon: Users, tKey: 'nav.friends' },
    { to: '/gym', icon: Dumbbell, tKey: 'nav.gym' },
    { to: '/settings', icon: Settings, tKey: 'nav.settings' },
];

export default function Sidebar() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const pendingCount = useFriendNotifStore((s) => s.pendingCount);
    const unreadMessages = useFriendNotifStore((s) => s.unreadMessages);
    const totalNotifs = pendingCount + unreadMessages.length;

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-56 bg-surface-800 border-r border-surface-700/50 z-40 py-6">
            {/* Brand */}
            <div className="flex items-center gap-2.5 px-5 mb-8">
                <div className="w-8 h-8 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Flame size={16} className="text-primary-400" />
                </div>
                <div>
                    <p className="text-sm font-bold text-white leading-none">Hábitos</p>
                    <p className="text-[10px] text-white/30">Tu día, tu ritmo</p>
                </div>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1 px-3 flex-1">
                {navItems.map(({ to, icon: Icon, tKey }) => {
                    const isFriends = to === '/friends';
                    const showBadge = isFriends && totalNotifs > 0;
                    return (
                        <NavLink key={to} to={to} end={to === '/'}>
                            {({ isActive }) => (
                                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${isActive
                                    ? 'bg-primary-500/15 text-primary-400'
                                    : 'text-white/50 hover:text-white hover:bg-surface-700/60'
                                    }`}>
                                    <div className="relative">
                                        <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
                                        {showBadge && (
                                            <span className="absolute -top-1.5 -right-1.5 min-w-[14px] h-3.5 px-0.5
                                                            bg-accent-red rounded-full flex items-center justify-center
                                                            text-[8px] font-bold text-white leading-none">
                                                {totalNotifs > 9 ? '9+' : totalNotifs}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                                        {t(tKey)}
                                    </span>
                                    {isActive && !showBadge && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400" />
                                    )}
                                    {showBadge && (
                                        <span className="ml-auto text-[10px] font-bold text-accent-red">
                                            {totalNotifs > 9 ? '9+' : totalNotifs}
                                        </span>
                                    )}
                                </div>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout + version footer */}
            <div className="px-3 pt-3 border-t border-surface-700/40">
                <button
                    id="sidebar-logout-btn"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                               text-white/40 hover:text-accent-red hover:bg-accent-red/10
                               transition-all duration-150 text-sm font-medium mb-3"
                >
                    <LogOut size={17} strokeWidth={1.8} />
                    Cerrar sesión
                </button>
                <p className="text-[10px] text-white/20 px-2">v1.0.0</p>
            </div>
        </aside>
    );
}
