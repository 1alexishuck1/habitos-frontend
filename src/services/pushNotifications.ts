// ─── Web Push subscription service ───────────────────────────────────────────
// Call initPushNotifications() once after login.

import { useAuthStore } from '@/store/authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

function getAuthHeader(): HeadersInit {
    const token = useAuthStore.getState().accessToken;
    return token ? { Authorization: `Bearer ${token}` } : {};
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function getVapidPublicKey(): Promise<string> {
    const res = await fetch(`${API_URL}/push/vapid-public-key`);
    const data = await res.json();
    return data.publicKey as string;
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    const sub = subscription.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
    };

    await fetch(`${API_URL}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.keys }),
    });
}

/**
 * Registers the service worker, requests notification permission,
 * and subscribes the browser to Web Push. Idempotent — safe to call multiple times.
 *
 * iOS note: push only works when the app is added to the Home Screen (PWA).
 * In Safari browser it will early-exit — the IosInstallBanner guides the user.
 */
export async function initPushNotifications(): Promise<void> {
    // Not supported in this browser
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    // iOS Safari: push only works from a standalone PWA (added to Home Screen)
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
        ('standalone' in navigator && (navigator as any).standalone === true) ||
        window.matchMedia('(display-mode: standalone)').matches;

    if (isIos && !isStandalone) {
        console.info('[push] iOS detected in browser mode — push requires PWA install');
        return;
    }

    let registration: ServiceWorkerRegistration;
    try {
        registration = await navigator.serviceWorker.register('/sw.js');
    } catch (err) {
        console.warn('[push] SW registration failed:', err);
        return;
    }

    // Ask for permission (no-op if already granted / denied)
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    try {
        const vapidKey = await getVapidPublicKey();
        if (!vapidKey) {
            console.warn('[push] No VAPID public key from server');
            return;
        }

        const appServerKey = urlBase64ToUint8Array(vapidKey);

        // Check if already subscribed
        const existing = await registration.pushManager.getSubscription();
        if (existing) {
            // Verify the subscription uses the current VAPID key
            const existingKey = existing.options?.applicationServerKey;
            let needsRefresh = false;

            if (existingKey) {
                const existingArray = new Uint8Array(existingKey);
                if (existingArray.length !== appServerKey.length ||
                    existingArray.some((v, i) => v !== appServerKey[i])) {
                    needsRefresh = true;
                }
            }

            if (needsRefresh) {
                console.info('[push] VAPID key changed, re-subscribing...');
                await existing.unsubscribe();
            } else {
                // Re-send to server in case it was lost on a new device/browser
                await sendSubscriptionToServer(existing);
                return;
            }
        }

        // Create new subscription
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: appServerKey.buffer as ArrayBuffer,
        });

        await sendSubscriptionToServer(subscription);
        console.info('[push] subscribed successfully');
    } catch (err) {
        console.warn('[push] subscription failed:', err);
    }
}

/**
 * Unsubscribes from push notifications and notifies the server.
 */
export async function unsubscribePush(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;
    const reg = await navigator.serviceWorker.getRegistration('/sw.js');
    if (!reg) return;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    const endpoint = sub.endpoint;
    await sub.unsubscribe();

    await fetch(`${API_URL}/push/subscribe`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ endpoint }),
    });
}

/**
 * Check if push notifications are currently active (permission granted + subscription exists).
 */
export async function isPushSubscribed(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    if (Notification.permission !== 'granted') return false;

    try {
        const reg = await navigator.serviceWorker.getRegistration('/sw.js');
        if (!reg) return false;
        const sub = await reg.pushManager.getSubscription();
        return !!sub;
    } catch {
        return false;
    }
}
