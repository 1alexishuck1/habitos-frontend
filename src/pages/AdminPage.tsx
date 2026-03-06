import { useEffect, useState } from 'react';
import { ShieldCheck, Users, ListTodo, CheckCircle2, Activity, UserPlus } from 'lucide-react';
import { getAdminStats, AdminStats } from '@/api/admin';

function StatCard({ label, value, icon: Icon, color }: {
    label: string; value: string | number; icon: any; color: string;
}) {
    return (
        <div className="card flex items-center gap-3 border-surface-700/50 bg-surface-800/40 overflow-hidden">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0 shadow-lg shadow-black/20`}>
                <Icon size={18} className="text-white" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{label}</p>
                <p className="text-xl font-black text-white">{value}</p>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        getAdminStats()
            .then(data => setStats(data))
            .catch(err => {
                console.error(err);
                setError('No tienes permisos o hubo un error al cargar las estadísticas.');
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading && !stats) return (
        <div className="page-content flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-muted uppercase tracking-widest">Cargando admin...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="page-content flex items-center justify-center min-h-[60vh] text-center">
            <div className="card border-red-500/50 bg-red-500/10 max-w-sm">
                <ShieldCheck className="mx-auto mb-3 text-red-500" size={32} />
                <p className="text-sm font-bold text-white">{error}</p>
            </div>
        </div>
    );

    return (
        <div className="page-content animate-fade-in">
            <div className="mb-6 border-b border-surface-700/50 pb-4 flex items-center gap-3">
                <div className="bg-primary-500/20 p-2 rounded-xl text-primary-400">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white italic tracking-tight uppercase">Panel de Administración</h1>
                    <p className="text-[10px] font-bold text-soft uppercase tracking-widest">Estadísticas Globales</p>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <StatCard
                        label="Usuarios Registrados"
                        value={stats.totalUsers}
                        icon={Users}
                        color="bg-primary-500"
                    />
                    <StatCard
                        label="Usuarios Nuevos (7d)"
                        value={stats.newUsersLastWeek}
                        icon={UserPlus}
                        color="bg-accent-purple"
                    />
                    <StatCard
                        label="Hábitos Creados"
                        value={stats.totalHabits}
                        icon={Activity}
                        color="bg-accent-orange"
                    />
                    <StatCard
                        label="Hábitos Cumplidos"
                        value={stats.totalCompletedHabitSnapshots}
                        icon={Activity}
                        color="bg-accent-green"
                    />
                    <StatCard
                        label="Tareas Creadas"
                        value={stats.totalTasks}
                        icon={ListTodo}
                        color="bg-accent-blue"
                    />
                    <StatCard
                        label="Tareas Cumplidas"
                        value={stats.totalCompletedTasks}
                        icon={CheckCircle2}
                        color="bg-accent-green"
                    />
                </div>
            )}

            {stats?.latestUsers && (
                <div className="mt-10">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={18} className="text-muted" />
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Últimos 5 usuarios registrados</h2>
                    </div>
                    <div className="card bg-surface-800/40 border-surface-700/50 p-0 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-surface-700/50 bg-surface-700/20 text-[10px] font-black text-muted uppercase tracking-widest">
                                        <th className="px-5 py-3">Nombre</th>
                                        <th className="px-5 py-3">Email</th>
                                        <th className="px-5 py-3 text-right">Registrado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-surface-700/30">
                                    {stats.latestUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-surface-700/20 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-bold text-white">{user.name}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-xs text-soft">{user.email}</p>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <p className="text-[10px] font-medium text-muted">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </p>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
