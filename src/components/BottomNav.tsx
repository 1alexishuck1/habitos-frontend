import { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Flame, Menu, X, LogOut, ChevronDown, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useFriendNotifStore } from '@/store/friendNotifStore';
import { NAV_CATEGORIES } from '@/constants/navigation';

export default function MobileMenu() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((s) => s.logout);
    const pendingCount = useFriendNotifStore((s) => s.pendingCount);
    const unreadMessages = useFriendNotifStore((s) => s.unreadMessages);
    const totalNotifs = pendingCount + unreadMessages.length;

    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.id === '1c30001a-ba62-47f4-ad41-bbcdc137e221' && user?.email === 'huckalexis0@gmail.com';

    // Find which category the current path belongs to
    const initialExpandedCategory = useMemo(() => {
        const activeCategory = NAV_CATEGORIES.find(cat =>
            cat.items.some(item => {
                if (item.to === '/') return location.pathname === '/';
                return location.pathname.startsWith(item.to);
            })
        );
        return activeCategory ? activeCategory.title : 'PRINCIPAL';
    }, []);

    // State for collapsible categories - single string for accordion behavior
    const [expandedTitle, setexpandedTitle] = useState<string | null>(initialExpandedCategory);

    // Update expanded category when path changes (navigation)
    useEffect(() => {
        const activeCategory = NAV_CATEGORIES.find(cat =>
            cat.items.some(item => {
                if (item.to === '/') return location.pathname === '/';
                return location.pathname.startsWith(item.to);
            })
        );
        if (activeCategory) {
            setexpandedTitle(activeCategory.title);
        }
    }, [location.pathname]);

    const toggleCategory = (title: string) => {
        setexpandedTitle(prev => prev === title ? null : title);
    };

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
                    <NavLink to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                        <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center shadow-lg shadow-primary-500/5">
                            <Flame size={14} className="text-primary-400" />
                        </div>
                        <span className="text-sm font-black text-white uppercase tracking-tighter italic">Hábitos</span>
                    </NavLink>

                    <button
                        id="mobile-menu-toggle"
                        onClick={() => setOpen(!open)}
                        className="relative w-10 h-10 flex items-center justify-center rounded-xl
                               text-white/60 hover:text-white hover:bg-surface-700/60
                               transition-all duration-150 active:scale-90 shadow-lg shadow-black/10 shadow-surface-950/20"
                        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
                        aria-expanded={open}
                    >
                        {open ? <X size={22} className="text-accent-red" /> : <Menu size={22} />}
                        {!open && totalNotifs > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5
                                            bg-accent-red rounded-full flex items-center justify-center
                                            text-[9px] font-bold text-white leading-none shadow-lg shadow-accent-red/20">
                                {totalNotifs > 9 ? '9+' : totalNotifs}
                            </span>
                        )}
                    </button>
                </div>
            </header>

            {/* ── Backdrop ── */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden animate-fade-in"
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* ── Slide-in drawer ── */}
            <nav
                className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[85vw]
                            bg-surface-800 border-l border-surface-700/50
                            flex flex-col pb-safe shadow-2xl
                            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden
                            ${open ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}
                aria-label="Menú principal"
            >
                {/* Brand inside drawer */}
                <div className="flex items-center gap-3 px-6 pb-6 border-b border-surface-700/40">
                    <div className="w-10 h-10 rounded-2xl bg-primary-500/20 flex items-center justify-center shadow-lg shadow-primary-500/5">
                        <Flame size={18} className="text-primary-400" />
                    </div>
                    <div>
                        <p className="text-base font-black text-white italic tracking-tighter uppercase">Hábitos</p>
                        <p className="text-xs text-soft font-medium">v1.2.0 • Premium</p>
                    </div>
                </div>

                {/* Nav categories */}
                <div className="flex flex-col px-4 py-6 flex-1 overflow-y-auto scrollbar-hide gap-8">
                    {NAV_CATEGORIES.map((category) => {
                        const isOpen = expandedTitle === category.title;
                        const visibleItems = category.items.filter(item => !item.adminOnly || isAdmin);

                        if (visibleItems.length === 0) return null;

                        // Check if category has any active notification
                        const hasCategoryNotif = category.items.some(item => item.to === '/friends' && totalNotifs > 0);

                        return (
                            <div key={category.title} className="flex flex-col gap-2">
                                <button
                                    onClick={() => toggleCategory(category.title)}
                                    className="flex items-center justify-between px-3 group"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-muted uppercase tracking-[0.2em] group-active:text-white/60 transition-colors">
                                            {category.title}
                                        </span>
                                        {!isOpen && hasCategoryNotif && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-accent-red animate-pulse" />
                                        )}
                                    </div>
                                    {!isOpen ? <ChevronRight size={12} className="text-muted" /> : <ChevronDown size={12} className="text-muted" />}
                                </button>

                                {isOpen && (
                                    <div className="flex flex-col gap-1 mt-1 animate-slide-up">
                                        {visibleItems.map(({ to, icon: Icon, tKey }) => {
                                            const isFriends = to === '/friends';
                                            const showBadge = isFriends && totalNotifs > 0;

                                            return (
                                                <NavLink key={to} to={to} end={to === '/'}>
                                                    {({ isActive }) => (
                                                        <div className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 active:scale-95 cursor-pointer relative ${isActive
                                                            ? 'bg-primary-500/10 text-primary-400 border border-primary-500/10'
                                                            : 'text-white/50 hover:bg-surface-700/40'
                                                            }`}>
                                                            <div className="relative">
                                                                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]' : ''} />
                                                                {showBadge && (
                                                                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5
                                                                                    bg-accent-red rounded-full flex items-center justify-center
                                                                                    text-[9px] font-bold text-white shadow-lg shadow-accent-red/20 border-2 border-surface-800">
                                                                        {totalNotifs > 9 ? '9+' : totalNotifs}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <span className={`text-[14px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                                                                {tKey === 'Admin' ? 'Admin' : t(tKey)}
                                                            </span>
                                                            {isActive && (
                                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(236,72,153,0.6)]" />
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
                </div>

                {/* Logout footer */}
                <div className="px-5 pt-4 pb-8 border-t border-surface-700/40 bg-surface-800/50 backdrop-blur-md">
                    <button
                        onClick={handleLogout}
                        className="w-full h-14 bg-surface-700 hover:bg-surface-600 active:bg-accent-red/10 active:text-accent-red border border-surface-600 rounded-3xl flex items-center justify-center gap-3 transition-all active:scale-95 group font-bold text-white/60"
                    >
                        <LogOut size={20} className="group-active:text-accent-red transition-colors" />
                        Cerrar sesión
                    </button>
                    <p className="text-center text-[10px] text-muted/30 uppercase tracking-[0.3em] font-black mt-4">Hábitos © 2026</p>
                </div>
            </nav>
        </>
    );
}
