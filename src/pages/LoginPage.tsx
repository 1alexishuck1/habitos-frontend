import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

// Login page

/** Map raw backend error strings to friendly user messages */
function friendlyLoginError(raw: string): string {
    const lower = raw.toLowerCase();
    if (lower.includes('credenciales') || lower.includes('invalid') || lower.includes('password') || lower.includes('unauthorized'))
        return 'El email o la contraseña son incorrectos. Revisá tus datos e intentá de nuevo.';
    if (lower.includes('no encontrado') || lower.includes('not found') || lower.includes('usuario'))
        return 'No encontramos una cuenta con ese email. ¿Querés registrarte?';
    if (lower.includes('rate') || lower.includes('limit') || lower.includes('demasiado'))
        return 'Demasiados intentos. Esperá un momento antes de volver a intentar.';
    if (lower.includes('network') || lower.includes('conexión') || lower.includes('server'))
        return 'No pudimos conectarnos con el servidor. Revisá tu conexión a internet.';
    return raw; // fallback: show as-is
}

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await authApi.login(form);
            setTokens(data.accessToken, data.refreshToken);
            setUser(data.user);
            navigate('/', { replace: true });
        } catch (err: any) {
            const raw = err.response?.data?.error ?? err.message ?? t('common.error');
            setError(friendlyLoginError(raw));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-surface-900 animate-fade-in">
            {/* Brand */}
            <div className="flex items-center gap-2.5 mb-8">
                <div className="w-9 h-9 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <Flame size={20} className="text-primary-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white leading-none">Hábitos</h1>
                    <p className="text-[10px] text-white/30 mt-0.5">Tu día, tu ritmo</p>
                </div>
            </div>

            <div className="w-full max-w-sm card animate-slide-up">
                <h2 className="text-base font-semibold text-white mb-4">{t('auth.login')}</h2>

                {error && (
                    <div className="mb-4 px-3.5 py-3 rounded-xl bg-accent-red/10 border border-accent-red/20 flex items-start gap-2.5 animate-fade-in">
                        <AlertCircle size={16} className="text-accent-red flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-accent-red leading-relaxed">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs text-muted mb-1">{t('auth.email')}</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="hola@ejemplo.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-muted mb-1">{t('auth.password')}</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input pr-9"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                            >
                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
                        {loading ? t('common.loading') : t('auth.login')}
                    </button>
                </form>

                <p className="text-center text-xs text-muted mt-4">
                    {t('auth.noAccount')}{' '}
                    <Link to="/register" className="text-primary-400 font-semibold hover:underline">
                        {t('auth.register')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
