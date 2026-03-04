import { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    saving?: boolean;
    icon?: ReactNode;
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Eliminar',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    saving = false,
    icon = <AlertTriangle size={24} className="text-accent-red" />
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-surface-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
            onClick={() => !saving && onCancel()}>
            <div className="bg-surface-800 rounded-3xl w-full max-w-sm border border-surface-700 shadow-2xl p-6 relative animate-scale-in"
                onClick={e => e.stopPropagation()}>
                <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center mb-4">
                    {icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <div className="text-sm text-white/50 mb-6 leading-relaxed">
                    {message}
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        disabled={saving}
                        className="flex-1 py-3 as-btn rounded-xl bg-surface-700 text-white text-sm font-semibold hover:bg-surface-600 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={saving}
                        className="flex-1 py-3 as-btn rounded-xl bg-accent-red text-white text-sm font-semibold hover:opacity-90 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Cargando...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
