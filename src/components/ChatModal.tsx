import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { X, Loader2 } from 'lucide-react';
import * as friendsApi from '@/api/friends';
import type { UserResult, FriendMessage } from '@/api/friends';
import { useAuthStore } from '@/store/authStore';
import { useFriendNotifStore } from '@/store/friendNotifStore';
import { onSSE } from '@/services/sseConnection';

const API_URL = import.meta.env.VITE_API_URL || '';

export function formatRelativeTime(iso: string, t: any) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return t('friends.justNow');
    if (mins < 60) return t('friends.minsAgo', { count: mins });
    if (hours < 24) return t('friends.hoursAgo', { count: hours });
    if (days < 7) return t('friends.daysAgo', { count: days });
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

interface ChatModalProps {
    friend: UserResult;
    onClose: () => void;
    onSend: (msg: string) => Promise<void>;
}

export function ChatModal({
    friend,
    onClose,
    onSend,
}: ChatModalProps) {
    const { t } = useTranslation();
    const [history, setHistory] = useState<FriendMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const currentUser = useAuthStore(s => s.user);

    const SPECIAL_PAIR = [
        '7cf8c230-024e-44c8-8c3f-b5f59e86f438',
        '1c30001a-ba62-47f4-ad41-bbcdc137e221',
    ];
    const isSpecialChat =
        currentUser?.id && SPECIAL_PAIR.includes(currentUser.id) && SPECIAL_PAIR.includes(friend.id);

    const MOTIVATION_MESSAGES = [
        t('friends.motivateMsg1'),
        t('friends.motivateMsg2'),
        t('friends.motivateMsg3'),
        t('friends.motivateMsg4'),
        t('friends.motivateMsg5'),
        ...(isSpecialChat ? ['Te quiero ❤️'] : []),
    ];

    const removeUnreadMessagesForFriend = useFriendNotifStore(s => s.removeUnreadMessagesForFriend);

    const loadHistory = useCallback(async () => {
        try {
            const data = await friendsApi.getChatHistory(friend.id);
            setHistory(data);

            const unreadIds = data
                .filter(m => m.senderId === friend.id && !m.isRead)
                .map(m => m.id);

            if (unreadIds.length > 0) {
                await friendsApi.markMessagesAsRead(unreadIds);
                removeUnreadMessagesForFriend(friend.id);
            }
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    }, [friend.id, removeUnreadMessagesForFriend]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    useEffect(() => {
        const unsub = onSSE('new_message', (data: any) => {
            if (data.senderId !== friend.id) return;
            const msg: FriendMessage = {
                id: data.id,
                senderId: data.senderId,
                receiverId: currentUser?.id ?? '',
                message: data.message,
                isRead: true,
                createdAt: data.createdAt,
                sender: { id: data.senderId, name: data.senderName ?? friend.name },
            };
            setHistory(prev => {
                if (prev.find(x => x.id === msg.id)) return prev;
                return [...prev, msg];
            });
            friendsApi.markMessagesAsRead([data.id]).catch(() => { });
            removeUnreadMessagesForFriend(friend.id);
        });
        return unsub;
    }, [friend.id, friend.name, currentUser?.id, removeUnreadMessagesForFriend]);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [history]);

    const unreadMessages = useFriendNotifStore(s => s.unreadMessages);

    useEffect(() => {
        const fromThisFriend = unreadMessages.filter(m => m.senderId === friend.id);
        if (fromThisFriend.length > 0) {
            const ids = fromThisFriend.map(m => m.id);
            friendsApi.markMessagesAsRead(ids).catch(() => { });
            removeUnreadMessagesForFriend(friend.id);
            setHistory(prev => {
                const newHistory = [...prev];
                for (const m of fromThisFriend) {
                    if (!newHistory.find(x => x.id === m.id)) {
                        newHistory.push(m);
                    }
                }
                return newHistory;
            });
        }
    }, [unreadMessages, friend.id, removeUnreadMessagesForFriend]);

    async function handleSend(msg: string) {
        setSending(true);
        try {
            await onSend(msg);
            loadHistory();
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-surface-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in"
            onClick={() => !sending && onClose()}>
            <div className="bg-surface-800 rounded-3xl w-full max-w-md border border-surface-700 shadow-2xl flex flex-col h-[80vh] relative animate-scale-in"
                onClick={e => e.stopPropagation()}>

                <div className="p-4 border-b border-surface-700 font-bold text-white flex items-center gap-3">
                    <Link to={`/profile/${friend.id}`} className="friend-avatar w-10 h-10 text-[xs] rounded-full overflow-hidden" style={{ width: 40, height: 40, fontSize: '0.75rem' }}>
                        {friend.avatarUrl ? (
                            <img
                                src={friend.avatarUrl.startsWith('http') ? friend.avatarUrl : `${API_URL}${friend.avatarUrl}`}
                                className="w-full h-full object-cover"
                                alt={friend.name}
                            />
                        ) : (
                            friend.name.slice(0, 2).toUpperCase()
                        )}
                    </Link>
                    <Link to={`/profile/${friend.id}`} className="hover:text-primary-400 transition-colors text-white" style={{ textDecoration: 'none' }}>
                        {friend.name}
                    </Link>
                    <button onClick={onClose} disabled={sending} className="ml-auto w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-700 text-white/50 hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
                    {loading ? (
                        <div className="m-auto text-sm text-white/30 flex items-center gap-2">
                            <Loader2 size={16} className="spin" /> {t('friends.loadingHistory')}
                        </div>
                    ) : history.length === 0 ? (
                        <div className="m-auto text-sm text-white/40 text-center">
                            {t('friends.noMessages')}<br />
                            {t('friends.beFirstToMotivate')}
                        </div>
                    ) : (
                        history.map(msg => {
                            const isMine = msg.senderId === currentUser?.id;
                            return (
                                <div key={msg.id} className={`flex flex-col max-w-[80%] ${isMine ? 'self-end items-end' : 'self-start items-start'}`}>
                                    <div className={`px-4 py-2 rounded-2xl text-sm ${isMine
                                        ? 'bg-accent-amber text-surface-900 font-medium rounded-br-sm'
                                        : 'bg-surface-700 text-white/90 rounded-bl-sm'
                                        }`}>
                                        {msg.message}
                                    </div>
                                    <span className="text-[10px] text-white/30 mt-1 px-1">{formatRelativeTime(msg.createdAt, t)}</span>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-4 border-t border-surface-700">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-white/40 uppercase tracking-widest">{t('friends.quickReplies')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {MOTIVATION_MESSAGES.map((msg, i) => {
                            const isLastMessageMine = history.length > 0 && history[history.length - 1].senderId === currentUser?.id;
                            const disabled = sending || (isLastMessageMine && !isSpecialChat);
                            return (
                                <button
                                    key={i}
                                    disabled={disabled}
                                    onClick={() => handleSend(msg)}
                                    className="px-3 py-2 text-left bg-surface-700 hover:bg-surface-600 rounded-xl text-xs text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {msg}
                                </button>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}
