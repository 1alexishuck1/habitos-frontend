import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import emailjs from '@emailjs/browser';
import GoogleLoginButton from '@/components/GoogleLoginButton';

// Register page

export default function RegisterPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();
    const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
            const { data } = await authApi.register({
                email: form.email,
                password: form.password,
                name: fullName
            });

            // Send welcome email
            try {
                const htmlMessage = `
                <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
                    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Hábitos</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">¡Bienvenido a la comunidad!</p>
                    </div>
                    <div style="padding: 40px 32px; background-color: #1e293b;">
                        <h2 style="color: #f8fafc; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">¡Hola ${form.firstName.trim()}!</h2>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                            Estamos muy emocionados de tenerte en <strong>Hábitos</strong>. Nuestra misión es ayudarte a construir tu mejor versión, día a día, a tu propio ritmo.
                        </p>
                        <p style="color: #94a3b8; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                            Ya podés empezar a crear tus primeros hábitos, completar tus tareas diarias y ver tu progreso junto a amigos.
                        </p>
                        <div style="text-align: center; margin-bottom: 32px;">
                            <a href="https://habitos-frontend-ashy.vercel.app" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 8px; font-size: 16px; letter-spacing: 0.025em; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">Ir a la aplicación</a>
                        </div>
                        <p style="color: #64748b; font-size: 14px; line-height: 1.5; margin: 0;">
                            Si tenés alguna duda o sugerencia, no dudes en contactarnos.<br/>
                            ¡Mucho éxito en tu camino!
                        </p>
                    </div>
                    <div style="background-color: #0f172a; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
                        <p style="color: #475569; font-size: 12px; margin: 0;">
                            © ${new Date().getFullYear()} Hábitos App. Todos los derechos reservados.<br/>
                            Tu día, tu ritmo.
                        </p>
                    </div>
                </div>
                `;

                await emailjs.send(
                    'service_caf0vou',
                    'template_74s9jcz',
                    {
                        title: "¡Bienvenido a Hábitos! 🔥",
                        name: "Hábitos App",
                        email: form.email,
                        message: htmlMessage
                    },
                    'ahgT31ZZZoM6eo06G'
                );
            } catch (emailError) {
                console.error('Error enviando correo de bienvenida:', emailError);
            }

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

                <div className="mb-5">
                    <GoogleLoginButton />
                    <div className="flex items-center gap-3 my-4">
                        <div className="h-px flex-1 bg-surface-700/50"></div>
                        <span className="text-[10px] text-muted font-medium uppercase tracking-wider px-1">O con email</span>
                        <div className="h-px flex-1 bg-surface-700/50"></div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs text-muted mb-1">Nombre</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Ej: Juan"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-muted mb-1">Apellido</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="Ej: Pérez"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                                required
                            />
                        </div>
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
