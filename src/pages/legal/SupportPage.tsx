import { ArrowLeft, MessageCircleQuestion, Mail, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupportPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-surface-950 text-soft font-sans selection:bg-primary-500/30 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-sm font-medium hover:text-white transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Volver al inicio
                    </button>
                    <div className="flex items-center gap-2">
                        <MessageCircleQuestion size={16} className="text-primary-400" />
                        <span className="text-sm font-bold text-white uppercase tracking-widest">Ayuda</span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-12">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-500/10 mb-6 relative">
                        <div className="absolute inset-0 bg-primary-500/20 blur-[30px] rounded-full" />
                        <MessageCircleQuestion size={40} className="text-primary-400 relative z-10" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Centro de Soporte</h1>
                    <p className="text-lg text-surface-400">¿Necesitás ayuda? Estamos acá para acompañarte.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {/* Contact Email */}
                    <div className="bg-surface-800/40 border border-surface-700/50 p-8 rounded-3xl hover:border-primary-500/30 transition-colors">
                        <Mail size={32} className="text-primary-400 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Escribinos directamente</h2>
                        <p className="text-surface-400 mb-6 leading-relaxed">Respondemos correos de lunes a viernes en menos de 24 horas hábiles.</p>
                        <a
                            href="mailto:soporte@habitos.app"
                            className="inline-flex items-center font-bold text-primary-400 hover:text-primary-300 transition-colors gap-2"
                        >
                            soporte@habitos.app <ArrowLeft size={16} className="rotate-180" />
                        </a>
                    </div>

                    {/* Feature Request */}
                    <div className="bg-surface-800/40 border border-surface-700/50 p-8 rounded-3xl hover:border-accent-amber/30 transition-colors">
                        <Zap size={32} className="text-accent-amber mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Pedir nueva función</h2>
                        <p className="text-surface-400 mb-6 leading-relaxed">¿Querés proponer un premio nuevo o una mejora en la gamificación?</p>
                        <a
                            href="mailto:feedback@habitos.app"
                            className="inline-flex items-center font-bold text-accent-amber hover:text-accent-amber/80 transition-colors gap-2"
                        >
                            Dejar feedback <ArrowLeft size={16} className="rotate-180" />
                        </a>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="space-y-6">
                    <h2 className="text-3xl font-black text-white mb-8 border-b border-surface-800 pb-4 flex items-center gap-3">
                        Preguntas Frecuentes
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-surface-800 flex items-center justify-center text-xs text-primary-400">P</span>
                                ¿Cómo reinicio mi cuenta si quiero empezar de cero a propósito?
                            </h3>
                            <p className="text-surface-400 pl-8 leading-relaxed">
                                Por el momento, la forma más rápida es ir a "Ajustes", eliminar tu cuenta (que borra todos tus datos permanentemente) y crearte otra usando el mismo o un nuevo correo electrónico.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-surface-800 flex items-center justify-center text-xs text-primary-400">P</span>
                                ¿Mis amigos pueden ver si marco como fallado un hábito?
                            </h3>
                            <p className="text-surface-400 pl-8 leading-relaxed">
                                No explícitamente. Ellos verán tu resumen diario con los hábitos que NO hayas completado bajo el título de "Hábitos pendientes" si aún es de día, y verán tu avatar en la plataforma motivándote. Pero no se notifica explícitamente tu "falla". El objetivo es alentar el progreso.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-surface-800 flex items-center justify-center text-xs text-primary-400">P</span>
                                ¿Qué pasa con los datos de "Libre de Humo"?
                            </h3>
                            <p className="text-surface-400 pl-8 leading-relaxed">
                                Los datos de dinero ahorrado y cigarrillos son únicamente privados y locales de tu usuario. Ningún otro amigo en el módulo social puede ver tu información del módulo específico de dejar de fumar a menos que saques una captura y se la mandes por chat.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
