import { useEffect, useState, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import MobileMenu from './BottomNav';
import Sidebar from './Sidebar';
import IosInstallBanner from './IosInstallBanner';
import XPToast from './XPToast';
import { onSSE } from '@/services/sseConnection';
import { useFriendNotifStore } from '@/store/friendNotifStore';
import * as friendsApi from '@/api/friends';

// Shell layout — hamburger menu on mobile, sidebar on desktop

export default function Layout() {
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const setPendingCount = useFriendNotifStore((s) => s.setPendingCount);

    function showToast(msg: string) {
        setToast(msg);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }

    // ─── Listen to SSE events for toast notifications ──────────────────────
    useEffect(() => {
        const unsubRequest = onSSE('friend_request', () => {
            friendsApi.listPendingRequests()
                .then(data => setPendingCount(Array.isArray(data) ? data.length : 0))
                .catch(() => { });
            showToast('👥 ¡Tenés una nueva solicitud de amistad!');
        });

        const unsubMessage = onSSE('new_message', (data: any) => {
            showToast(`💬 ${data.senderName}: ${data.message}`);
        });

        return () => { unsubRequest(); unsubMessage(); };
    }, [setPendingCount]);

    return (
        <div className="min-h-screen bg-surface-900 flex relative">
            {/* Desktop sidebar */}
            <Sidebar />

            {/* Main content — pushed right on desktop, padded top on mobile for the header bar */}
            <main
                className="flex-1 lg:ml-56 lg:pt-0 overflow-x-hidden"
                style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top))' }}
            >
                <div className="max-w-2xl mx-auto lg:py-8 lg:px-8 overflow-hidden">
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

            {/* XP Animation */}
            <XPToast />
        </div>
    );
}
