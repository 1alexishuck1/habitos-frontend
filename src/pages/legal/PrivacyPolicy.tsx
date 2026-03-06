import { ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
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
                        <Shield size={16} className="text-primary-400" />
                        <span className="text-sm font-bold text-white uppercase tracking-widest">Legal</span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Política de Privacidad</h1>
                <p className="text-sm text-surface-400 mb-12">Última actualización: Marzo 2026</p>

                <div className="space-y-8 text-base md:text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Introducción</h2>
                        <p>
                            En <strong>Hábitos</strong> (en adelante, "la Aplicación", "nosotros", "nuestro" o "nuestra"), respetamos tu privacidad y estamos comprometidos con la protección de tus datos personales. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información cuando utilizas nuestra aplicación móvil o sitio web.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Información que Recopilamos</h2>
                        <p className="mb-3">Podemos recopilar información sobre ti de diversas formas. La información que recopilamos a través de la Aplicación depende del contenido y los materiales que utilices, e incluye:</p>
                        <ul className="list-disc pl-6 space-y-2 text-surface-300">
                            <li><strong>Datos de Registro:</strong> Cuando creas una cuenta, te solicitamos tu dirección de correo electrónico, nombre de usuario y contraseña (cifrada).</li>
                            <li><strong>Datos de Actividad:</strong> Recopilamos datos sobre tus hábitos, tareas y objetivos para poder ofrecerte las funcionalidades principales de gamificación y seguimiento.</li>
                            <li><strong>Datos de Salud y Sensibles (Módulo "Libre de Humo"):</strong> Si utilizas módulos específicos de bienestar, como el contador de días sin fumar y ahorros, recogemos los parámetros que ingresas voluntariamente. Estos datos se procesan estrictamente para mostrarte tu progreso personal.</li>
                            <li><strong>Datos Sociales:</strong> Información de tus amigos dentro de la plataforma, historial de chat y notificaciones generadas dentro de nuestro ecosistema.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Uso de la Información</h2>
                        <p className="mb-3">Tener información precisa nos permite brindarte una experiencia fluida, eficiente y personalizada. Principalmente, utilizamos la información recopilada para:</p>
                        <ul className="list-disc pl-6 space-y-2 text-surface-300">
                            <li>Crear y administrar tu cuenta de usuario.</li>
                            <li>Habilitar la comunicación entre usuarios (ej. chat y notificaciones).</li>
                            <li>Calcular tus puntos de experiencia, niveles y estadísticas de progreso.</li>
                            <li>Implementar y gestionar el sistema de notificaciones push.</li>
                            <li>Prevenir transacciones fraudulentas y monitorear contra robos para proteger la Aplicación.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Compartir Información</h2>
                        <p>
                            <strong>No vendemos, alquilamos ni comercializamos tus datos personales.</strong> Solo compartimos datos en los siguientes casos:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-surface-300 mt-3">
                            <li><strong>Interacciones con otros usuarios:</strong> Si interactúas con otros usuarios en la aplicación (agregando amigos), ellos podrán ver tu nombre de usuario, nivel actual, y rachas visibles que hayas configurado. El contenido de tus chats está protegido.</li>
                            <li><strong>Requisitos Legales:</strong> Si creemos que la divulgación de información sobre ti es necesaria para responder a un proceso legal o para investigar o remediar posibles violaciones, compartiremos la información permitida por la ley aplicable.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Seguridad de los Datos</h2>
                        <p>
                            Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger tu información personal (como el uso de JSON Web Tokens (JWT) para la autenticación y cifrado bcrypt para contraseñas). Sin embargo, ninguna medida de seguridad es completamente impenetrable, por lo que no podemos garantizar la seguridad absoluta de los datos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Tus Derechos</h2>
                        <p>
                            Puedes revisar o cambiar la información en tu cuenta en cualquier momento solicitándolo o directamente desde la configuración de la app. Si decides cancelar tu cuenta, desactivaremos tu perfil y eliminaremos o anonimizaremos tu información de nuestras bases de datos activas.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
