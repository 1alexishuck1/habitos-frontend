import { ArrowLeft, Scale } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
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
                        <Scale size={16} className="text-primary-400" />
                        <span className="text-sm font-bold text-white uppercase tracking-widest">Términos</span>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 pt-12">
                <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Términos de Servicio</h1>
                <p className="text-sm text-surface-400 mb-12">Última actualización: Marzo 2026</p>

                <div className="space-y-8 text-base md:text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Aceptación de los Términos</h2>
                        <p>
                            Al acceder y utilizar <strong>Hábitos</strong> (en adelante, "la Aplicación"), aceptas y te sometes a estos Términos de Servicio. Si no estás de acuerdo con todos estos términos, tienes prohibido expresamente el uso de la Aplicación y debes dejar de utilizarla inmediatamente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Requisitos de la Cuenta</h2>
                        <p className="mb-3">Para crear una cuenta y disfrutar de las funciones de la Aplicación, aceptas que:</p>
                        <ul className="list-disc pl-6 space-y-2 text-surface-300">
                            <li>Eres mayor de 13 años.</li>
                            <li>Toda la información que proporciones será veraz, precisa y completa.</li>
                            <li>Mantendrás la seguridad y confidencialidad de tu contraseña.</li>
                            <li>Aceptas la responsabilidad de todas las actividades que ocurran bajo tu cuenta y contraseña.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. Conducta del Usuario</h2>
                        <p className="mb-3">La Aplicación cuenta con funciones sociales e interacción con otros usuarios mediante salas de chat, muros y solicitudes de amistad. Al utilizar nuestra plataforma, te comprometes a NO:</p>
                        <ul className="list-disc pl-6 space-y-2 text-surface-300">
                            <li>Acosar, amenazar, intimidar o promover la violencia contra otros.</li>
                            <li>Enviar contenido inapropiado, ilegal, difamatorio, obsceno o discriminatorio.</li>
                            <li>Utilizar herramientas de automatización ("bots") o secuencias de comandos para interactuar con la Aplicación, acumular rachas, o subir de nivel de manera fraudulenta.</li>
                            <li>Intentar eludir las medidas de seguridad de la Aplicación.</li>
                        </ul>
                        <p className="mt-4">
                            Nos reservamos el derecho de suspender o eliminar cuentas de forma inmediata y sin previo aviso en caso de violar estas reglas.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Exención de Responsabilidad Médica</h2>
                        <p className="p-4 bg-surface-800/50 border border-primary-500/20 rounded-xl">
                            <strong>Atención - Módulo "Libre de Humo":</strong> La información y las herramientas proporcionadas en <strong>Hábitos</strong> no sustituyen el asesoramiento, diagnóstico ni tratamiento médico profesional. La Aplicación es una herramienta motivacional de gamificación y no garantizamos resultados respecto al abandono de adicciones de salud. Siempre busca el consejo de tu médico o proveedor de salud calificado con respecto a cualquier afección médica.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Propiedad Intelectual</h2>
                        <p>
                            Todo el código, diseño gráfico, logos, textos, y la gamificación, funcionalidad y estructura de <strong>Hábitos</strong> están protegidos por las leyes de propiedad intelectual internacionales vigentes y nos pertenecen y/o a nuestras subsidiarias, entidades afiliadas, licenciantes o proveedores.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Modificaciones a la Aplicación y a los Términos</h2>
                        <p>
                            Nos reservamos el derecho de modificar o descontinuar temporal o permanentemente la Aplicación o cualquier servicio asociado con o sin previo aviso. Podemos revisar y actualizar estos Términos de vez en cuando a nuestra entera discreción. Todos los cambios entrarán en vigor tan pronto como se publiquen.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
