import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';

// Register page

export default function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await authApi.register(form);
            setTokens(data.accessToken, data.refreshToken);
            if (data.user) setUser(data.user);
            navigate('/', { replace: true });
        } catch (err: any) {
            setError(err.response?.data?.error ?? t('common.error'));
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
                <h2 className="text-base font-semibold text-white mb-4">{t('auth.register')}</h2>

                {error && (
                    <div className="mb-3 px-3 py-2 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-xs">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-xs text-muted mb-1">{t('auth.name')}</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Tu nombre"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>

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
                                placeholder="Mínimo 8 caracteres"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                minLength={8}
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
                        {loading ? t('common.loading') : t('auth.register')}
                    </button>
                </form>

                <p className="text-center text-xs text-muted mt-4">
                    {t('auth.hasAccount')}{' '}
                    <Link to="/login" className="text-primary-400 font-semibold hover:underline">
                        {t('auth.login')}
                    </Link>
                </p>
            </div>
        </div>
    );
}
