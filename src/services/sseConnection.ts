// ─── SSE Connection — real-time updates from backend ─────────────────────────
// Opens a single EventSource per session. Reconnects automatically on failure.

import { useAuthStore } from '@/store/authStore';
import { useFriendNotifStore } from '@/store/friendNotifStore';

const API_URL = import.meta.env.VITE_API_URL || '';

let eventSource: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

// Listeners that pages can register for specific events
type SSEListener = (data: any) => void;
const listeners = new Map<string, Set<SSEListener>>();

export function onSSE(event: string, fn: SSEListener) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event)!.add(fn);
    return () => { listeners.get(event)?.delete(fn); };
}

function dispatch(event: string, data: any) {
    listeners.get(event)?.forEach(fn => fn(data));
}

export function connectSSE() {
    // Don't connect if already open
    if (eventSource && eventSource.readyState !== EventSource.CLOSED) return;

    const token = useAuthStore.getState().accessToken;
    if (!token) return;

    // EventSource doesn't support custom headers, so we pass the token as a query param.
    // The backend auth middleware must support ?token= as fallback.
    const url = `${API_URL}/friends/events?token=${encodeURIComponent(token)}`;
    console.info('[sse] Connecting to', url.replace(token, '***'));
    eventSource = new EventSource(url, { withCredentials: true });

    eventSource.onopen = () => {
        console.info('[sse] Connected');
    };

    eventSource.addEventListener('friend_request', (e) => {
        try {
            const data = JSON.parse(e.data);
            console.info('[sse] friend_request event received', data);
            const store = useFriendNotifStore.getState();
            store.setPendingCount(store.pendingCount + 1);
            dispatch('friend_request', data);
        } catch { /* ignore parse errors */ }
    });

    eventSource.addEventListener('new_message', (e) => {
        try {
            const data = JSON.parse(e.data);
            console.info('[sse] new_message event received', data);
            const msg = {
                id: data.id,
                senderId: data.senderId,
                receiverId: '', // filled by context
                message: data.message,
                isRead: false,
                createdAt: data.createdAt,
                sender: { id: data.senderId, name: data.senderName ?? '' },
            };
            useFriendNotifStore.getState().addUnreadMessage(msg);
            dispatch('new_message', data);
        } catch { /* ignore parse errors */ }
    });

    eventSource.onerror = (err) => {
        console.warn('[sse] Connection error, will reconnect in 5s', err);
        eventSource?.close();
        eventSource = null;
        // Reconnect after 5 seconds
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
            const token = useAuthStore.getState().accessToken;
            if (token) connectSSE();
        }, 5000);
    };
}

export function disconnectSSE() {
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    if (eventSource) { eventSource.close(); eventSource = null; }
}
