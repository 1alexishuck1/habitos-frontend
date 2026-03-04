import { useTranslation } from 'react-i18next';
import { Globe, LogOut, User, Bell, BellOff, BellRing, Smartphone } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { useNavigate } from 'react-router-dom';
import i18n from '@/i18n';
import { useState, useEffect } from 'react';
import { initPushNotifications, unsubscribePush } from '@/services/pushNotifications';

// Settings page — language, profile, notifications, logout

function isIos(): boolean {
    // 'iphone|ipad|ipod' covers Safari; 'CriOS' = Chrome on iOS, 'FxiOS' = Firefox on iOS
    return /iphone|ipad|ipod|CriOS|FxiOS/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
    return (
        ('standalone' in navigator && (navigator as any).standalone === true) ||
        window.matchMedia('(display-mode: standalone)').matches
    );
}

function NotificationsSection() {
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [msg, setMsg] = useState('');

    const pushSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    const ios = isIos();
    const standalone = isInStandaloneMode();

    useEffect(() => {
        if (!pushSupported) { setPermission('unsupported'); return; }
        setPermission(Notification.permission);

        // Check for existing subscription
        navigator.serviceWorker.getRegistration('/sw.js').then(reg => {
            if (!reg) return;
            reg.pushManager.getSubscription().then(sub => setSubscribed(!!sub));
        });
    }, []);

    async function handleEnable() {
        setLoading(true);
        setMsg('');
        try {
            await initPushNotifications();
            const perm = Notification.permission;
            setPermission(perm);
            if (perm === 'granted') {
                setSubscribed(true);
                setMsg('✅ ¡Notificaciones activadas!');
            } else if (perm === 'denied') {
                setMsg('❌ Permiso denegado. Habilitalo desde Configuración del sistema.');
            } else {
                setMsg('Se requiere aceptar el permiso cuando aparezca.');
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleDisable() {
        setLoading(true);
        setMsg('');
        try {
            await unsubscribePush();
            setSubscribed(false);
            setMsg('🔕 Notificaciones desactivadas.');
        } finally {
            setLoading(false);
        }
    }

    // iOS in any browser (not installed as PWA) — show install guide
    // ⚠️ This MUST come before the pushSupported check because Chrome/Firefox
    // on iOS don't expose PushManager at all — that's exactly the problem.
    if (ios && !standalone) {
        return (
            <div className="card mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <Bell size={11} /> Notificaciones
                </p>
                <div className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/20"
                    style={{ background: 'rgba(245,158,11,0.07)' }}>
                    <Smartphone size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-white mb-1">Instalá la app en Safari</p>
                        <p className="text-xs text-white/60 leading-relaxed mb-2">
                            En iPhone, las notificaciones push solo funcionan desde Safari instalado como app.
                        </p>
                        <ol className="space-y-2">
                            <li className="text-xs text-white/75 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-primary-500/30 text-primary-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">1</span>
                                Abrí este sitio en <strong className="text-white">Safari</strong> (no Chrome)
                            </li>
                            <li className="text-xs text-white/75 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-primary-500/30 text-primary-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">2</span>
                                Tocá el ícono <strong className="text-white">Compartir □↑</strong> abajo de la pantalla
                            </li>
                            <li className="text-xs text-white/75 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-primary-500/30 text-primary-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">3</span>
                                Elegí <strong className="text-white">"Añadir a pantalla de inicio"</strong>
                            </li>
                            <li className="text-xs text-white/75 flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-primary-500/30 text-primary-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">4</span>
                                Abrí la app desde el ícono y aceptá las notificaciones
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        );
    }

    // Not supported at all
    if (permission === 'unsupported') {
        return (
            <div className="card mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <BellOff size={11} /> Notificaciones
                </p>
                <p className="text-sm text-white/50">Tu navegador no soporta notificaciones push.</p>
            </div>
        );
    }

    return (
        <div className="card mb-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Bell size={11} /> Notificaciones
            </p>

            {/* Status row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${permission === 'granted' && subscribed ? 'bg-emerald-400' :
                        permission === 'denied' ? 'bg-red-400' : 'bg-amber-400'
                        }`} />
                    <span className="text-sm text-white/80">
                        {permission === 'granted' && subscribed ? 'Activas' :
                            permission === 'granted' && !subscribed ? 'Permiso concedido, sin suscripción' :
                                permission === 'denied' ? 'Bloqueadas por el sistema' :
                                    'Sin configurar'}
                    </span>
                </div>
                {permission === 'granted' && subscribed && <BellRing size={16} className="text-emerald-400" />}
            </div>

            {/* Action button */}
            {permission === 'denied' ? (
                <p className="text-xs text-white/40 bg-surface-700/40 rounded-xl p-3 leading-relaxed">
                    Bloqueaste las notificaciones. Para reactivarlas, andá a{' '}
                    <strong className="text-white/60">
                        {ios ? 'Configuración → Hábitos → Notificaciones' : 'Configuración del navegador → Permisos del sitio'}
                    </strong>.
                </p>
            ) : subscribed ? (
                <button
                    onClick={handleDisable}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                               text-sm font-medium bg-surface-700/60 text-white/60
                               hover:bg-surface-700 hover:text-white/80 transition-all disabled:opacity-50"
                >
                    <BellOff size={15} />
                    {loading ? 'Desactivando...' : 'Desactivar notificaciones'}
                </button>
            ) : (
                <button
                    id="btn-enable-notifications"
                    onClick={handleEnable}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-sm"
                >
                    <Bell size={15} />
                    {loading ? 'Activando...' : 'Activar notificaciones'}
                </button>
            )}

            {msg && (
                <p className="text-xs text-center mt-3 text-white/60">{msg}</p>
            )}
        </div>
    );
}

export default function SettingsPage() {
    const { t } = useTranslation();
    const { user, logout, refreshToken } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { if (refreshToken) await authApi.logout(refreshToken); } catch { /* best effort */ }
        logout();
        navigate('/login', { replace: true });
    };

    const handleLang = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
    };

    return (
        <div className="page-content animate-fade-in">
            <h1 className="section-title text-xl mb-6">{t('settings.title')}</h1>

            {/* Profile */}
            <div className="card mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-primary-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-white text-sm">{user?.name}</p>
                        <p className="text-xs text-muted">{user?.email}</p>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <NotificationsSection />

            {/* Language */}
            <div className="card mb-4">
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                    <Globe size={11} className="inline mr-1.5" />{t('settings.language')}
                </p>
                <div className="flex gap-2">
                    {[{ code: 'es', label: 'Español' }, { code: 'en', label: 'English' }].map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleLang(lang.code)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${i18n.language === lang.code ? 'bg-primary-500 text-white' : 'bg-surface-700 text-soft'
                                }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Logout */}
            <button onClick={handleLogout} className="btn-danger w-full flex items-center justify-center gap-2 py-2.5 mt-2 text-sm">
                <LogOut size={15} /> {t('auth.logout')}
            </button>

            <p className="text-center text-xs text-muted mt-8">v1.0.0 · Hábitos App</p>
        </div>
    );
}
