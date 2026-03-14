import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { authApi } from '@/api/auth';
import emailjs from '@emailjs/browser';

// Forgot Password page

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);

    // Step 1: Email
    const [email, setEmail] = useState('');

    // Step 2: Code and new password
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState<string | React.ReactNode>('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendCode = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);
        try {
            const { data } = await authApi.forgotPassword(email);

            // Si hay un código, procedemos a enviar el email
            if (data.code) {
                await emailjs.send(
                    'service_caf0vou',
                    'template_74s9jcz',
                    {
                        title: "Código de recuperación",
                        name: "Hábitos App",
                        email: email,
                        message: `Tu código de recuperación es: ${data.code}`
                    },
                    'ahgT31ZZZoM6eo06G'
                );
            }

            setSuccessMsg('Se ha enviado un código a tu correo. Revisá tu bandeja de entrada o spam.');
            setTimeout(() => {
                setStep(2);
                setSuccessMsg('');
            }, 3000);
        } catch (err: any) {
            const backendError = err.response?.data?.error;
            if (err.response?.status === 404 || (backendError && backendError.includes('no se encuentra registrado'))) {
                setError(
                    <span>
                        El correo no se encuentra registrado.{' '}
                        <Link to="/register" className="font-bold underline hover:text-white transition-colors">
                            Registrate acá.
                        </Link>
                    </span>
                );
            } else {
                setError(backendError ?? 'Error al solicitar el cambio de contraseña');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres.');
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword({ code, newPassword });
            setSuccessMsg('¡Contraseña actualizada exitosamente! Redirigiendo al inicio de sesión...');
            setTimeout(() => {
                navigate('/login', { replace: true });
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error ?? 'No se pudo actualizar la contraseña. Verificá el código.');
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
                    <p className="text-[10px] text-white/30 mt-0.5">Recuperar cuenta</p>
                </div>
            </div>

            <div className="w-full max-w-sm card animate-slide-up">
                <div className="relative mb-4 flex items-center justify-center">
                    <Link to="/login" className="absolute left-0 text-white/40 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                    </Link>

                    <h2 className="text-base font-semibold text-white text-center">
                        {step === 1 ? 'Olvidé mi contraseña' : 'Nueva contraseña'}
                    </h2>
                </div>

                {error && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-accent-red/10 border border-accent-red/30 text-accent-red text-xs text-center">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs text-center">
                        {successMsg}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                        <p className="text-xs text-muted text-center px-2">
                            Ingresá tu correo electrónico y te enviaremos un código de seguridad de 6 dígitos para crear una nueva contraseña.
                        </p>

                        <div>
                            <label className="block text-xs text-muted mb-1">{t('auth.email')}</label>
                            <input
                                type="email"
                                className="input"
                                placeholder="hola@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <button type="submit" className="btn-primary w-full mt-2" disabled={loading || !email}>
                            {loading ? t('common.loading') : 'Enviar código'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <p className="text-xs text-muted text-center px-2">
                            Ingresá el código que recibiste en <strong>{email}</strong> y elegí una nueva contraseña.
                        </p>

                        <div>
                            <label className="block text-xs text-muted mb-1">Código de seguridad</label>
                            <input
                                type="text"
                                className="input tracking-[0.3em] font-mono text-center text-lg placeholder:tracking-normal placeholder:font-sans placeholder:text-sm"
                                placeholder="123456"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-muted mb-1">Nueva contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input pr-9"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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

                        <div>
                            <label className="block text-xs text-muted mb-1">Confirmar contraseña</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input pr-9"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={8}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full mt-2" disabled={loading || !code || !newPassword || !confirmPassword}>
                            {loading ? t('common.loading') : 'Cambiar contraseña'}
                        </button>

                        <div className="text-center mt-2">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="text-[10px] text-muted hover:text-white transition-colors uppercase tracking-wider font-medium"
                            >
                                Ingresar otro correo
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
