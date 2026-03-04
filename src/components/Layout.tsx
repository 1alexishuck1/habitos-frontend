import { useEffect, useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import MobileMenu from './BottomNav';
import Sidebar from './Sidebar';
import IosInstallBanner from './IosInstallBanner';
import { useAuthStore } from '@/store/authStore';
import { useFriendNotifStore } from '@/store/friendNotifStore';
import * as friendsApi from '@/api/friends';

// Shell layout — hamburger menu on mobile, sidebar on desktop

export default function Layout() {
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const addUnreadMessage = useFriendNotifStore((s) => s.addUnreadMessage);
    const setPendingCount = useFriendNotifStore((s) => s.setPendingCount);

    function showToast(msg: string) {
        setToast(msg);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }

    // ─── Global SSE Connection ──────────────────────────────────────────────
    useEffect(() => {
        const token = useAuthStore.getState().accessToken;
        if (!token) return;

        const es = new EventSource(`/friends/events?token=${encodeURIComponent(token)}`);

        es.addEventListener('friend_request', () => {
            friendsApi.listPendingRequests()
                .then(data => setPendingCount(Array.isArray(data) ? data.length : 0))
                .catch(() => { });
            showToast('\uD83D\uDC65 \u00A1Ten\u00E9s una nueva solicitud de amistad!');
        });

        es.addEventListener('new_message', (e: any) => {
            try {
                const data = JSON.parse(e.data);
                showToast(`💬 ${data.senderName}: ${data.message}`);
                addUnreadMessage(data);
            } catch (err) { /* ignore */ }
        });

        es.onerror = () => { /* reconnects automatically */ };

        return () => es.close();
    }, [addUnreadMessage, setPendingCount]);

    return (
        <div className="min-h-screen bg-surface-900 flex relative">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Main content — pushed right on desktop, padded top on mobile for the header bar */}
            <main
                className="flex-1 lg:ml-56 lg:pt-0"
                style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}
            >
                <div className="max-w-2xl mx-auto lg:py-8 lg:px-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile hamburger menu (top bar + drawer) */}
            <MobileMenu />

            {/* iOS install prompt — only shown in Safari (not standalone PWA) */}
            <IosInstallBanner />

            {/* Global Toast */}
            {toast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[200] px-4 py-2.5 rounded-2xl bg-surface-800 border border-surface-700 shadow-2xl animate-slide-up pointer-events-none">
                    <p className="text-sm font-semibold text-white text-center whitespace-pre-wrap">{toast}</p>
                </div>
            )}
        </div>
    );
}
