import { Home, Flame, CheckSquare, BarChart2, Book, Settings, Users, Dumbbell, Zap, ShieldCheck, Wind } from 'lucide-react';

export const NAV_CATEGORIES = [
    {
        title: 'PRINCIPAL',
        items: [
            { to: '/', icon: Home, tKey: 'nav.today', id: 'today' },
            { to: '/habits', icon: Flame, tKey: 'nav.habits', id: 'habits' },
            { to: '/tasks', icon: CheckSquare, tKey: 'nav.tasks', id: 'tasks' },
        ]
    },
    {
        title: 'SEGUIMIENTO',
        items: [
            { to: '/progress', icon: Zap, tKey: 'nav.progress', id: 'progress' },
            { to: '/stats', icon: BarChart2, tKey: 'nav.stats', id: 'stats' },
            { to: '/diary', icon: Book, tKey: 'nav.diary', id: 'diary' },
        ]
    },
    {
        title: 'DESAFÍOS',
        items: [
            { to: '/smoke', icon: Wind, tKey: 'nav.smoke', id: 'smoke' },
            { to: '/gym', icon: Dumbbell, tKey: 'nav.gym', id: 'gym' },
        ]
    },
    {
        title: 'SOCIAL',
        items: [
            { to: '/friends', icon: Users, tKey: 'nav.friends', id: 'friends' },
        ]
    },
    {
        title: 'AJUSTES',
        items: [
            { to: '/settings', icon: Settings, tKey: 'nav.settings', id: 'settings' },
            { to: '/admin', icon: ShieldCheck, tKey: 'Admin', id: 'admin', adminOnly: true },
        ]
    }
];
