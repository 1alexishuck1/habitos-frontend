// ─── Service Worker — Web Push handler ───────────────────────────────────────
// Served at /sw.js so its scope covers the full app.

self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload;
    try {
        payload = event.data.json();
    } catch {
        payload = { title: 'Hábitos', body: event.data.text() };
    }

    const { title = 'Hábitos', body = '', icon, tag, url } = payload;

    event.waitUntil(
        self.registration.showNotification(title, {
            body,
            icon: icon ?? '/favicon.png',
            badge: '/favicon.png',
            tag: tag ?? 'habitos-default',
            data: { url: url ?? '/' },
            // vibrate: only works on supported Android browsers
            vibrate: [100, 50, 100],
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const url = event.notification.data?.url ?? '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Focus existing tab if open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            // Open new tab
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
