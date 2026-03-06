import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Home, Flame, CheckSquare, BarChart2, Book,
    Settings, Users, Menu, X, LogOut, Dumbbell, Zap
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFriendNotifStore } from '@/store/friendNotifStore';

// Mobile hamburger menu — replaces the overcrowded bottom nav bar

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

export default function MobileMenu() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const pendingCount = useFriendNotifStore((s) => s.pendingCount);
    const unreadMessages = useFriendNotifStore((s) => s.unreadMessages);
    const totalNotifs = pendingCount + unreadMessages.length;

    // Close menu on route change
    useEffect(() => { setOpen(false); }, [location.pathname]);

    // Lock body scroll while open
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    function handleLogout() {
        logout();
        navigate('/login');
    }

    return (
        <>
            {/* ── Fixed top bar with hamburger button ── */}
            <header
                className="fixed top-0 left-0 right-0 z-50 bg-surface-800/95 backdrop-blur-md border-b border-surface-700/40 lg:hidden"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}
            >
                <div className="h-14 flex items-center justify-between px-4">
                    {/* Brand — links to home */}
                    <NavLink to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                        <div className="w-7 h-7 rounded-lg bg-primary-500/20 flex items-center justify-center">
                            <Flame size={14} className="text-primary-400" />
                        </div>
                        <span className="text-sm font-bold text-white">Hábitos</span>
                    </NavLink>

                    {/* Hamburger / Close toggle — with badge if pending requests */}
                    <button
                        id="mobile-menu-toggle"
                        onClick={() => setOpen(!open)}
                        className="relative w-9 h-9 flex items-center justify-center rounded-xl
                               text-white/60 hover:text-white hover:bg-surface-700/60
                               transition-all duration-150 active:scale-90"
                        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={open}
                    >
                        {open ? <X size={20} /> : <Menu size={20} />}
                        {!open && totalNotifs > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5
                                            bg-accent-red rounded-full flex items-center justify-center
                                            text-[9px] font-bold text-white leading-none">
                                {totalNotifs > 9 ? '9+' : totalNotifs}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* ── Backdrop ── */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Slide-in drawer ── */}
            <nav
                className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw]
                            bg-surface-800 border-l border-surface-700/50
                            flex flex-col pb-safe
                            transition-transform duration-300 ease-out lg:hidden
                            ${open ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}
                aria-label="Menú principal"
            >
                {/* Close button inside drawer */}
                <button
                    onClick={() => setOpen(false)}
                    className="absolute right-3 w-9 h-9 flex items-center justify-center
                               rounded-xl text-white/40 hover:text-white hover:bg-surface-700/60 transition-all"
                    style={{ top: 'calc(0.75rem + env(safe-area-inset-top))' }}
                >
                    <X size={18} />
                </button>

                {/* Brand inside drawer */}
                <div className="flex items-center gap-2.5 px-5 pb-6 border-b border-surface-700/40">
                    <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center">
                        <Flame size={16} className="text-primary-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white leading-none">Hábitos</p>
                        <p className="text-[10px] text-white/30">Tu día, tu ritmo</p>
                    </div>
                </div>

                {/* Nav links */}
                <div className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
                    {navItems.map(({ to, icon: Icon, tKey }) => {
                        const isFriends = to === '/friends';
                        const showBadge = isFriends && totalNotifs > 0;
                        return (
                            <NavLink key={to} to={to} end={to === '/'}>
                                {({ isActive }) => (
                                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150
                                        ${isActive
                                            ? 'bg-primary-500/15 text-primary-400'
                                            : 'text-white/60 hover:text-white hover:bg-surface-700/50'
                                        }`}>
                                        <div className="relative">
                                            <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
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
                                                {totalNotifs} nuev{totalNotifs !== 1 ? 'as' : 'a'}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </NavLink>
                        );
                    })}
                </div>

                {/* Logout at bottom */}
                <div className="px-3 pt-2 pb-6 border-t border-surface-700/40">
                    <button
                        id="mobile-logout-btn"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                   text-white/50 hover:text-accent-red hover:bg-accent-red/10
                                   transition-all duration-150 text-sm font-medium"
                    >
                        <LogOut size={18} strokeWidth={1.8} />
                        Cerrar sesión
                    </button>
                </div>
            </nav>
        </>
    );
}
