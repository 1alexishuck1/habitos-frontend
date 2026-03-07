import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { User, Mail, Shield, Award, Users, CheckCircle2, Flame, Save, Loader2, Camera, UserPlus, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import { sendFriendRequest } from '@/api/friends';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function ProfilePage() {
    const { t } = useTranslation();
    const { userId } = useParams();
    const { user: currentUser, setUser } = useAuthStore();

    // Who are we viewing?
    const isMe = !userId || userId === currentUser?.id;

    const [viewUser, setViewUser] = useState<any>(null);
    const [friendshipStatus, setFriendshipStatus] = useState<'FRIENDS' | 'REQUEST_SENT' | 'REQUEST_RECEIVED' | 'NONE'>('NONE');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [stats, setStats] = useState({
        friendsCount: 0,
        habitsDoneCount: 0,
        tasksDoneCount: 0
    });

    // Split name into firstName and lastName
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);

    const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        setLoading(true);
        if (isMe) {
            setViewUser(currentUser);
            const parts = currentUser?.name.split(' ') || [];
            setFirstName(parts[0] || '');
            setLastName(parts.slice(1).join(' ') || '');

            authApi.getProfileStats()
                .then(res => setStats(res.data))
                .catch(() => { })
                .finally(() => setLoading(false));
        } else if (userId) {
            authApi.getPublicProfile(userId)
                .then(res => {
                    setViewUser(res.data);
                    setStats(res.data.stats);
                    setFriendshipStatus(res.data.friendshipStatus);
                })
                .catch(() => {
                    showToast('Usuario no encontrado', 'error');
                })
                .finally(() => setLoading(false));
        }
    }, [userId, isMe, currentUser]);

    const handleAddFriend = async () => {
        if (!userId) return;
        setSaving(true);
        try {
            await sendFriendRequest(userId);
            setFriendshipStatus('REQUEST_SENT');
            showToast('Solicitud enviada 🚀');
        } catch (error) {
            showToast('Error al enviar solicitud', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!firstName.trim()) {
            showToast('Nombre es requerido', 'error');
            return;
        }

        setSaving(true);
        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
            const { data } = await authApi.updateProfile({ name: fullName });
            setUser(data);
            setViewUser(data);
            showToast('Perfil actualizado correctamente');
        } catch (error) {
            showToast('Error al actualizar el perfil', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = () => {
        if (isMe) {
            fileInputRef.current?.click();
        } else if (viewUser?.avatarUrl) {
            setShowAvatarModal(true);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setSaving(true);
        try {
            const { data } = await authApi.uploadAvatar(formData);
            if (currentUser) {
                const updatedUser = { ...currentUser, avatarUrl: data.avatar_url };
                setUser(updatedUser);
                setViewUser(updatedUser);
            }
            showToast('¡Avatar actualizado! ✨');
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Error al subir imagen', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading && !viewUser) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-500" size={32} />
            </div>
        );
    }

    return (
        <div className="page-content animate-fade-in pb-20">
            {/* Hidden Input for Avatar */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/png, image/jpeg, image/jpg, image/webp"
            />

            {/* Header / Avatar Section */}
            <div className="relative mb-8 pt-10 px-4">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-600/20 to-transparent -z-10 rounded-3xl" />
                <div className="flex flex-col items-center">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <div className="w-24 h-24 rounded-full bg-surface-700 border-4 border-surface-800 flex items-center justify-center overflow-hidden shadow-2xl relative">
                            {viewUser?.avatarUrl ? (
                                <img
                                    src={viewUser.avatarUrl.startsWith('http')
                                        ? viewUser.avatarUrl
                                        : `${API_URL}${viewUser.avatarUrl}?t=${isMe ? Date.now() : '1'}`}
                                    alt={viewUser.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User size={48} className="text-white/20" />
                            )}
                            {isMe && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera size={24} className="text-white" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay" />
                        </div>
                        {isMe && (
                            <button className="absolute bottom-0 right-0 p-2 bg-primary-500 rounded-full text-white shadow-lg transform transition-transform hover:scale-110 active:scale-95">
                                <Camera size={16} />
                            </button>
                        )}
                    </div>

                    <h1 className="text-2xl font-black text-white mt-4">{viewUser?.name}</h1>
                    <p className="text-primary-400 font-bold text-xs uppercase tracking-widest mt-1">{t('habits.level', 'Nivel')} {viewUser?.level}</p>

                    {/* Friend button for others */}
                    {!isMe && (
                        <div className="mt-6">
                            {friendshipStatus === 'NONE' && (
                                <button
                                    onClick={handleAddFriend}
                                    disabled={saving}
                                    className="btn-primary px-8 py-2.5 flex items-center gap-2 rounded-2xl shadow-xl shadow-primary-500/20"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                                    AGREGAR AMIGO
                                </button>
                            )}
                            {friendshipStatus === 'REQUEST_SENT' && (
                                <button disabled className="px-8 py-2.5 flex items-center gap-2 rounded-2xl bg-surface-700 text-soft text-xs font-bold border border-surface-600">
                                    <Check size={16} /> SOLICITUD ENVIADA
                                </button>
                            )}
                            {friendshipStatus === 'FRIENDS' && (
                                <button disabled className="px-8 py-2.5 flex items-center gap-2 rounded-2xl bg-accent-green/10 text-accent-green text-xs font-bold border border-accent-green/20">
                                    <Users size={16} /> YA SON AMIGOS
                                </button>
                            )}
                            {friendshipStatus === 'REQUEST_RECEIVED' && (
                                <button disabled className="px-8 py-2.5 flex items-center gap-2 rounded-2xl bg-accent-amber/10 text-accent-amber text-xs font-bold border border-accent-amber/20">
                                    <UserPlus size={16} /> TE ENVIÓ SOLICITUD
                                </button>
                            )}
                        </div>
                    )}

                    {/* XP Progress Bar */}
                    <div className="w-full max-w-xs mt-6">
                        <div className="flex justify-between text-[10px] font-bold text-soft uppercase mb-1.5 px-1">
                            <span>EXP: {(viewUser?.experience ?? 0) % 100} / 100</span>
                            <span>{100 - ((viewUser?.experience ?? 0) % 100)} para nvl. {(viewUser?.level ?? 1) + 1}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-700/50 overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-gradient-to-r from-primary-600 via-primary-400 to-accent-amber transition-all duration-1000"
                                style={{ width: `${(viewUser?.experience ?? 0) % 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                <div className="card-stats bg-surface-800/40 border-surface-700/50 p-4 rounded-2xl flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center mb-2">
                        <Award size={18} />
                    </div>
                    <span className="text-lg font-black text-white">{viewUser?.level}</span>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Nivel</span>
                </div>
                <div className="card-stats bg-surface-800/40 border-surface-700/50 p-4 rounded-2xl flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-xl bg-accent-blue/10 text-accent-blue flex items-center justify-center mb-2">
                        <Users size={18} />
                    </div>
                    <span className="text-lg font-black text-white">{stats.friendsCount}</span>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Amigos</span>
                </div>
                <div className="card-stats bg-surface-800/40 border-surface-700/50 p-4 rounded-2xl flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-xl bg-accent-amber/10 text-accent-amber flex items-center justify-center mb-2">
                        <Flame size={18} />
                    </div>
                    <span className="text-lg font-black text-white">{stats.habitsDoneCount}</span>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Hábitos Completados</span>
                </div>
                <div className="card-stats bg-surface-800/40 border-surface-700/50 p-4 rounded-2xl flex flex-col items-center text-center">
                    <div className="w-8 h-8 rounded-xl bg-accent-green/10 text-accent-green flex items-center justify-center mb-2">
                        <CheckCircle2 size={18} />
                    </div>
                    <span className="text-lg font-black text-white">{stats.tasksDoneCount}</span>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Tareas Listas</span>
                </div>
            </div>

            {isMe && (
                <div className="space-y-6">
                    <div className="card border-surface-700/50 bg-surface-800/40 backdrop-blur-md p-6">
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <User size={16} className="text-primary-400" /> Información Personal
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">Nombre</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                                        <Shield size={16} />
                                    </span>
                                    <input
                                        type="text"
                                        className="input pl-10"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        placeholder="Tu nombre"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">Apellido</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                    placeholder="Tu apellido"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-2 ml-1">Email</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
                                        <Mail size={16} />
                                    </span>
                                    <input
                                        type="email"
                                        className="input pl-10 opacity-50 cursor-not-allowed"
                                        value={currentUser?.email}
                                        readOnly
                                        disabled
                                    />
                                </div>
                                <p className="text-[10px] text-muted mt-1.5 ml-1">El email no puede ser modificado por seguridad.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-primary w-full mt-8 py-3.5 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary-500/20"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                        </button>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/5">
                        <h3 className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mb-2 px-1">Zona de Peligro</h3>
                        <button className="w-full py-3 rounded-xl border border-red-500/20 text-red-500/60 text-xs font-bold hover:bg-red-500/10 transition-colors">
                            ELIMINAR MI CUENTA
                        </button>
                        <p className="text-[9px] text-red-500/40 text-center mt-2 px-4 italic leading-tight">
                            Esta acción es irreversible y borrará todos tus hábitos, tareas y racha.
                        </p>
                    </div>
                </div>
            )}

            {/* Avatar Preview Modal */}
            {showAvatarModal && viewUser?.avatarUrl && (
                <div
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setShowAvatarModal(false)}
                >
                    <button
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        onClick={() => setShowAvatarModal(false)}
                    >
                        <X size={24} />
                    </button>
                    <div className="max-w-full max-h-full" onClick={e => e.stopPropagation()}>
                        <img
                            src={viewUser.avatarUrl.startsWith('http') ? viewUser.avatarUrl : `${API_URL}${viewUser.avatarUrl}`}
                            alt={viewUser.name}
                            className="max-w-[95vw] max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
                        />
                        <div className="mt-4 text-center">
                            <h3 className="text-white font-bold text-lg">{viewUser.name}</h3>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-slide-up ${toast.type === 'success'
                    ? 'bg-gradient-to-r from-accent-green to-emerald-600 text-white'
                    : 'bg-gradient-to-r from-accent-red to-rose-600 text-white'
                    }`}>
                    {toast.msg}
                </div>
            )}
        </div>
    );
}
