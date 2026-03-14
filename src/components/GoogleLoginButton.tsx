import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/config/firebase';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import emailjs from '@emailjs/browser';

export default function GoogleLoginButton() {
    const navigate = useNavigate();
    const { setTokens, setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            const { data } = await authApi.googleAuth(idToken);

            // Send welcome email if the user was just created
            // We check if createdAt is within the last 30 seconds
            if (data.user && new Date(data.user.createdAt).getTime() > Date.now() - 30000) {
                try {
                    const htmlMessage = `
                    <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.2);">
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">Hábitos</h1>
                            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 500;">¡Bienvenido a la comunidad!</p>
                        </div>
                        <div style="padding: 40px 32px; background-color: #1e293b;">
                            <h2 style="color: #f8fafc; font-size: 20px; font-weight: 600; margin: 0 0 16px 0;">¡Hola ${data.user.name.split(' ')[0]}!</h2>
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
                            title: "¡Bienvenido a Hábitos!",
                            name: "Hábitos App",
                            email: data.user.email,
                            to_email: data.user.email,
                            message: htmlMessage
                        },
                        'ahgT31ZZZoM6eo06G'
                    );
                } catch (emailError) {
                    console.error('Error enviando correo de bienvenida via Google Auth:', emailError);
                }
            }

            setTokens(data.accessToken, data.refreshToken);
            setUser(data.user);
            navigate('/', { replace: true });
        } catch (err: any) {
            console.error('Google Auth Error:', err);
            setError('Error al conectar con Google. Intentá de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                        <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                        <path d="M3.964 10.706c-.18-.54-.282-1.117-.282-1.706s.102-1.166.282-1.706V4.962H.957C.347 6.177 0 7.554 0 9s.347 2.823.957 4.038l3.007-2.332z" fill="#FBBC05" />
                        <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.443 2.017.957 4.962l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335" />
                    </svg>
                )}
                {loading ? 'Cargando...' : 'Continuar con Google'}
            </button>
            {error && <p className="text-[10px] text-accent-red mt-2 text-center">{error}</p>}
        </div>
    );
}
