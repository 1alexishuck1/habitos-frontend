import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
    Users, UserPlus, Bell, Search, Check, X,
    Flame, CheckSquare, Trophy, Clock, UserCheck, ChevronDown, ChevronUp, Loader2, UserMinus, Zap,
    MessageCircle
} from 'lucide-react';
import * as friendsApi from '@/api/friends';
import type { FriendEntry, FriendRequest, UserResult, ActivityItem } from '@/api/friends';
import { useFriendNotifStore } from '@/store/friendNotifStore';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { habitApi } from '@/api/habits';
import { ChatModal, formatRelativeTime } from '@/components/ChatModal';

const API_URL = import.meta.env.VITE_API_URL || '';

// ─── Types ────────────────────────────────────────────────────────────────────

type Panel = 'friends' | 'search' | 'requests';

// ─── Helper: format date ──────────────────────────────────────────────────────

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
}


// ─── Activity item row ────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: ActivityItem }) {
    const { t } = useTranslation();
    const isHabit = item.type === 'habit';
    return (
        <div className="activity-row">
            <div className={`activity-icon ${isHabit ? 'activity-icon-habit' : 'activity-icon-task'}`}>
                {isHabit ? <Flame size={12} /> : <CheckSquare size={12} />}
            </div>
            <div className="activity-content">
                <span className="activity-name">{item.name}</span>
                {isHabit && item.habitType === 'COUNTER' && item.value != null && (
                    <span className="activity-badge">×{item.value}</span>
                )}
            </div>
            <span className="activity-time">{formatRelativeTime(item.timestamp, t)}</span>
        </div>
    );
}

// ─── Friend card ─────────────────────────────────────────────────────────────

function FriendCard({ entry, onRemove, onMotivate, onCopyHabit }: {
    entry: FriendEntry;
    onRemove: (id: string) => void;
    onMotivate: (f: FriendEntry, prefilledMsg?: string) => void;
    onCopyHabit: (habit: friendsApi.FriendHabitToday) => void;
}) {
    const { t } = useTranslation();
    const { friend, stats, since } = entry;
    const initials = friend.name.slice(0, 2).toUpperCase();
    const [expanded, setExpanded] = useState(false);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [friendHabits, setFriendHabits] = useState<friendsApi.FriendHabitToday[]>([]);
    const [actLoading, setActLoading] = useState(false);
    const [actLoaded, setActLoaded] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(false);
    const [removing, setRemoving] = useState(false);

    const unreadCount = useFriendNotifStore(s => s.unreadMessages.filter(m => m.senderId === friend.id).length);

    async function toggleExpand() {
        const next = !expanded;
        setExpanded(next);
        if (next && !actLoaded) {
            setActLoading(true);
            try {
                const [actData, habitsData] = await Promise.all([
                    friendsApi.getFriendActivity(friend.id),
                    friendsApi.getFriendTodayHabits(friend.id),
                ]);
                setActivity(Array.isArray(actData) ? actData : []);
                setFriendHabits(Array.isArray(habitsData) ? habitsData : []);
                setActLoaded(true);
            } catch {
                setActivity([]);
                setFriendHabits([]);
            } finally {
                setActLoading(false);
            }
        }
    }

    return (
        <div className="friend-card">
            {/* Top row: avatar + info + chevron */}
            <div className="friend-card-top" onClick={toggleExpand}>
                <Link to={`/profile/${friend.id}`} className="friend-avatar overflow-hidden" onClick={e => e.stopPropagation()}>
                    {friend.avatarUrl ? (
                        <img
                            src={friend.avatarUrl.startsWith('http') ? friend.avatarUrl : `${API_URL}${friend.avatarUrl}`}
                            className="w-full h-full object-cover"
                            alt={friend.name}
                        />
                    ) : (
                        initials
                    )}
                </Link>
                <div className="friend-info">
                    <Link to={`/profile/${friend.id}`} className="friend-name hover:text-primary-400 transition-colors" onClick={e => e.stopPropagation()}>
                        {friend.name}
                    </Link>
                    <p className="friend-since">
                        <UserCheck size={12} /> Amigos desde {formatDate(since)}
                    </p>
                    <div className="friend-stats">
                        <span className="stat-chip stat-fire">
                            <Flame size={13} /> {stats.maxStreak} {t('friends.maxStreak')}
                        </span>
                        <span className="stat-chip stat-check">
                            <CheckSquare size={13} /> {stats.tasksDone7d} {t('friends.tasksWeek')}
                        </span>
                        <span className="stat-chip stat-trophy">
                            <Trophy size={13} /> {stats.habitsCompleted7d} {t('friends.habitsWeek')}
                        </span>
                    </div>
                </div>
                <button
                    className="btn-motivate relative flex items-center justify-center w-10 h-10 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 rounded-xl transition-all border border-primary-500/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        onMotivate(entry);
                    }}
                    title={t('friends.sendMotivation')}
                >
                    <div className="relative">
                        <MessageCircle size={18} />
                        <div className="absolute -top-1 -right-1 bg-surface-800 rounded-full p-0.5">
                            <Zap size={9} className="fill-current text-accent-amber" />
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent-red flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-2 ring-surface-800">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
                <div className="chevron-btn">
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>

            {/* Expanded: habits today + activity + remove */}
            {expanded && (
                <div className="activity-feed">
                    {actLoading && (
                        <div className="activity-loading">
                            <Loader2 size={16} className="spin" /> {t('friends.loadingActivity')}
                        </div>
                    )}

                    {/* Friend's habits today */}
                    {!actLoading && friendHabits.length > 0 && (
                        <div className="mb-4">
                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-2 px-1">
                                Hábitos de hoy
                            </p>
                            <div className="space-y-1.5">
                                {friendHabits.map(h => (
                                    <div key={h.id} className={`flex items-center gap-2 p-2 rounded-xl transition-all ${h.todayCompleted ? 'bg-accent-green/10' : 'bg-surface-700/30'}`}>
                                        <span className="text-sm">
                                            {h.todayCompleted ? '✅' : '⭕'}
                                        </span>
                                        <span className={`flex-1 text-xs font-medium truncate ${h.todayCompleted ? 'text-soft line-through' : 'text-white'}`}>
                                            {h.name}
                                        </span>
                                        {h.currentStreak > 0 && (
                                            <span className="text-[10px] text-accent-amber font-bold">🔥{h.currentStreak}</span>
                                        )}
                                        {!h.todayCompleted && (
                                            <button
                                                className="text-[10px] font-bold text-primary-400 hover:text-primary-300 px-1.5 py-0.5 rounded-lg bg-primary-500/10 hover:bg-primary-500/20 transition-all"
                                                onClick={() => onMotivate(entry, `¡Dale con "${h.name}"! Vos podés 💪`)}
                                                title="Motivar"
                                            >
                                                ⚡
                                            </button>
                                        )}
                                        <button
                                            className="text-[10px] font-bold text-soft hover:text-white px-1.5 py-0.5 rounded-lg bg-surface-600/40 hover:bg-surface-600 transition-all"
                                            onClick={() => onCopyHabit(h)}
                                            title="Copiar hábito"
                                        >
                                            📋
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {!actLoading && activity.length === 0 && friendHabits.length === 0 && (
                        <p className="activity-empty">{t('friends.noActivity')}</p>
                    )}

                    {/* Activity history */}
                    {!actLoading && activity.length > 0 && (
                        <div>
                            <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2 px-1">
                                Actividad de hoy
                            </p>
                            {activity.map(item => (
                                <ActivityRow key={item.id} item={item} />
                            ))}
                        </div>
                    )}

                    {/* Remove friend */}
                    <div className="remove-friend-row">
                        {confirmRemove ? (
                            <>
                                <span className="remove-confirm-text">{t('friends.areYouSure')}</span>
                                <button
                                    className="btn-remove-friend btn-remove-confirm"
                                    disabled={removing}
                                    onClick={async () => {
                                        setRemoving(true);
                                        try {
                                            await friendsApi.removeFriend(friend.id);
                                            onRemove(entry.friendshipId);
                                        } catch {
                                            setRemoving(false);
                                            setConfirmRemove(false);
                                        }
                                    }}
                                >
                                    {removing ? <Loader2 size={13} className="spin" /> : <UserMinus size={13} />}
                                    {removing ? t('friends.removing') : t('friends.yesRemove')}
                                </button>
                                <button
                                    className="btn-remove-cancel"
                                    onClick={() => setConfirmRemove(false)}
                                    disabled={removing}
                                >
                                    {t('common.cancel')}
                                </button>
                            </>
                        ) : (
                            <button
                                className="btn-remove-friend"
                                onClick={() => setConfirmRemove(true)}
                            >
                                <UserMinus size={13} /> {t('friends.removeFriend')}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Pending request card ─────────────────────────────────────────────────────

function RequestCard({
    request,
    onAccept,
    onReject,
    loading,
}: {
    request: FriendRequest;
    onAccept: () => void;
    onReject: () => void;
    loading: boolean;
}) {
    const initials = request.sender.name.slice(0, 2).toUpperCase();
    return (
        <div className="request-card">
            <Link to={`/profile/${request.sender.id}`} className="friend-avatar request-avatar overflow-hidden">
                {request.sender.avatarUrl ? (
                    <img
                        src={request.sender.avatarUrl.startsWith('http') ? request.sender.avatarUrl : `${API_URL}${request.sender.avatarUrl}`}
                        className="w-full h-full object-cover"
                        alt={request.sender.name}
                    />
                ) : (
                    initials
                )}
            </Link>
            <div className="request-info">
                <Link to={`/profile/${request.sender.id}`} className="friend-name hover:text-primary-400 transition-colors">
                    {request.sender.name}
                </Link>
                <span className="friend-since">
                    <Clock size={12} /> {formatDate(request.createdAt)}
                </span>
            </div>
            <div className="request-actions">
                <button
                    className="btn-accept"
                    onClick={onAccept}
                    disabled={loading}
                    id={`accept-${request.id}`}
                >
                    <Check size={16} />
                </button>
                <button
                    className="btn-reject"
                    onClick={onReject}
                    disabled={loading}
                    id={`reject-${request.id}`}
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

// ─── Search result row ────────────────────────────────────────────────────────

function SearchResult({
    user,
    onSend,
    requestSent,
}: {
    user: UserResult;
    onSend: () => void;
    requestSent: boolean;
}) {
    const { t } = useTranslation();
    const initials = user.name.slice(0, 2).toUpperCase();
    return (
        <div className="search-result">
            <Link to={`/profile/${user.id}`} className="friend-avatar search-avatar overflow-hidden">
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${API_URL}${user.avatarUrl}`}
                        className="w-full h-full object-cover"
                        alt={user.name}
                    />
                ) : (
                    initials
                )}
            </Link>
            <Link to={`/profile/${user.id}`} className="search-name hover:text-primary-400 transition-colors">
                {user.name}
            </Link>
            <button
                className={`btn-send-request ${requestSent ? 'btn-sent' : ''}`}
                onClick={onSend}
                disabled={requestSent}
                id={`send-req-${user.id}`}
            >
                {requestSent ? (
                    <><Check size={14} /> {t('friends.requestSent')}</>
                ) : (
                    <><UserPlus size={14} /> {t('friends.sendRequest')}</>
                )}
            </button>
        </div>
    );
}

// ─── Chat / Motivation modal ────────────────────────────────────────────────────


// ─── Main page ────────────────────────────────────────────────────────────────

export default function FriendsPage() {
    const { t } = useTranslation();
    const [panel, setPanel] = useState<Panel>('friends');
    const setPendingCount = useFriendNotifStore((s) => s.setPendingCount);

    // Friends list
    const [friends, setFriends] = useState<FriendEntry[]>([]);
    const [friendsLoading, setFriendsLoading] = useState(true);

    // Pending requests
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [respondingId, setRespondingId] = useState<string | null>(null);

    // Search
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [sentIds, setSentIds] = useState<Set<string>>(new Set());

    // Toast notification
    const [toast, setToast] = useState<string | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Motivations
    const [motivateEntry, setMotivateEntry] = useState<FriendEntry | null>(null);
    const motivateEntryRef = useRef<FriendEntry | null>(null);
    useEffect(() => { motivateEntryRef.current = motivateEntry; }, [motivateEntry]);

    function showToast(msg: string) {
        setToast(msg);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(null), 4000);
    }

    const unreadMessages = useFriendNotifStore((s) => s.unreadMessages);

    // Load friends
    const loadFriends = useCallback(async () => {
        setFriendsLoading(true);
        try {
            const data = await friendsApi.listFriends();
            setFriends(Array.isArray(data) ? data : []);
        } catch {
            setFriends([]);
        } finally {
            setFriendsLoading(false);
        }
    }, []);

    // Load pending requests — also syncs global badge
    const loadRequests = useCallback(async () => {
        setRequestsLoading(true);
        try {
            const data = await friendsApi.listPendingRequests();
            const list = Array.isArray(data) ? data : [];
            setRequests(list);
            setPendingCount(list.length); // keep nav badge in sync
        } catch {
            setRequests([]);
        } finally {
            setRequestsLoading(false);
        }
    }, [setPendingCount]);

    useEffect(() => {
        loadFriends();
        loadRequests();
    }, [loadFriends, loadRequests]);

    const sortedFriends = useMemo(() => {
        if (!Array.isArray(friends)) return [];
        return [...friends].sort((a, b) => {
            const aHasUnread = unreadMessages.some(m => m.senderId === a.friend.id);
            const bHasUnread = unreadMessages.some(m => m.senderId === b.friend.id);
            if (aHasUnread && !bHasUnread) return -1;
            if (!aHasUnread && bHasUnread) return 1;
            return 0;
        });
    }, [friends, unreadMessages]);
    // ─── Component auto-updates ──────────────────────────────────────────────
    const globalPendingCount = useFriendNotifStore((s) => s.pendingCount);
    useEffect(() => {
        loadRequests();
    }, [globalPendingCount, loadRequests]);

    // Search debounce
    useEffect(() => {
        if (searchQuery.length < 2) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const data = await friendsApi.searchUsers(searchQuery);
                setSearchResults(Array.isArray(data) ? data : []);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    function handleMotivate(entry: FriendEntry, prefilledMsg?: string) {
        setMotivateEntry(entry);
        if (prefilledMsg) {
            // Send it directly to the friend
            friendsApi.sendMessage(entry.friend.id, prefilledMsg).then(() => {
                showToast(t('friends.messageSent', 'Mensaje enviado'));
            }).catch(() => {
                showToast(t('friends.errorSend', 'Error al enviar'));
            });
        }
    }

    async function handleSendMotivation(msg: string) {
        if (!motivateEntry) return;
        try {
            await friendsApi.sendMessage(motivateEntry.friend.id, msg);
            // We do NOT close the modal, so they can keep seeing the chat!
            showToast(t('friends.messageSent'));
        } catch {
            showToast(t('friends.errorSend'));
        }
    }

    async function handleCopyHabit(habit: friendsApi.FriendHabitToday) {
        try {
            await habitApi.create({
                name: habit.name,
                type: habit.type,
                category: habit.category,
                frequencyType: habit.frequencyType,
                frequencyDays: habit.frequencyDays,
                templateId: habit.templateId,
            });
            showToast(`¡Hábito "${habit.name}" agregado a tu lista!`);
        } catch {
            showToast('Error al copiar el hábito');
        }
    }

    async function handleSendRequest(userId: string) {
        try {
            await friendsApi.sendFriendRequest(userId);
            setSentIds(prev => new Set(prev).add(userId));
        } catch {
            // already sent or other business error — still mark as sent to avoid spam
            setSentIds(prev => new Set(prev).add(userId));
        }
    }

    async function handleRespond(requestId: string, accept: boolean) {
        setRespondingId(requestId);
        try {
            await friendsApi.respondToRequest(requestId, accept);
            setRequests(prev => {
                const next = prev.filter(r => r.id !== requestId);
                setPendingCount(next.length); // update global badge
                return next;
            });
            if (accept) loadFriends();
        } finally {
            setRespondingId(null);
        }
    }

    const pendingCount = requests.length;

    function handleRemoveFriend(friendshipId: string) {
        setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
    }

    return (
        <>
            {toast && (
                <div className="friend-toast" role="status" aria-live="polite">
                    {toast}
                </div>
            )}
            <style>{`
                .friends-page {
                    max-width: 680px;
                    margin: 0 auto;
                    padding: 1rem 1rem calc(2rem + env(safe-area-inset-bottom, 0px));
                }

                /* Toast notification */
                .friend-toast {
                    position: fixed;
                    top: calc(4.5rem + env(safe-area-inset-top, 0px));
                    left: 50%;
                    transform: translateX(-50%);
                    z-index: 9999;
                    background: linear-gradient(135deg, rgba(99,102,241,0.95) 0%, rgba(139,92,246,0.95) 100%);
                    color: #fff;
                    padding: 0.7rem 1.25rem;
                    border-radius: 12px;
                    font-size: 0.88rem;
                    font-weight: 600;
                    box-shadow: 0 8px 32px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.3);
                    animation: toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both;
                    white-space: nowrap;
                }
                @keyframes toastIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

                /* Header */
                .friends-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 1.75rem;
                }
                .friends-title-block h1 {
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: -0.5px;
                    margin: 0 0 2px;
                }
                .friends-title-block p {
                    font-size: 0.82rem;
                    color: rgba(255,255,255,0.4);
                    margin: 0;
                }
                .header-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                .icon-btn {
                    position: relative;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    padding: 0.45rem 0.7rem;
                    cursor: pointer;
                    color: rgba(255,255,255,0.55);
                    display: flex;
                    align-items: center;
                    gap: 0.35rem;
                    font-size: 0.82rem;
                    font-family: inherit;
                    transition: all 0.15s;
                }
                .icon-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .icon-btn.active {
                    background: rgba(99,102,241,0.15);
                    border-color: rgba(99,102,241,0.4);
                    color: #818cf8;
                }
                .badge {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    background: #f43f5e;
                    color: #fff;
                    font-size: 0.65rem;
                    font-weight: 700;
                    border-radius: 999px;
                    min-width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 3px;
                }

                /* Tab strip */
                .tab-strip {
                    display: flex;
                    gap: 0.25rem;
                    background: rgba(255,255,255,0.04);
                    border-radius: 12px;
                    padding: 3px;
                    margin-bottom: 1.5rem;
                }
                .tab-btn {
                    flex: 1;
                    padding: 0.5rem;
                    border: none;
                    border-radius: 9px;
                    background: transparent;
                    cursor: pointer;
                    font-family: inherit;
                    font-size: 0.82rem;
                    font-weight: 500;
                    color: rgba(255,255,255,0.4);
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .tab-btn.active {
                    background: rgba(99,102,241,0.2);
                    color: #818cf8;
                    font-weight: 600;
                }

                /* Search box */
                .search-box {
                    position: relative;
                    margin-bottom: 1.25rem;
                }
                .search-box svg {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255,255,255,0.3);
                }
                .search-input {
                    width: 100%;
                    padding: 0.65rem 0.75rem 0.65rem 2.5rem;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    color: #fff;
                    font-family: inherit;
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.15s;
                    box-sizing: border-box;
                }
                .search-input::placeholder { color: rgba(255,255,255,0.25); }
                .search-input:focus { border-color: rgba(99,102,241,0.5); }

                /* Search result */
                .search-result {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.8rem 1rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    margin-bottom: 0.5rem;
                }
                .search-name {
                    flex: 1;
                    color: #fff;
                    font-size: 0.9rem;
                    font-weight: 500;
                    text-decoration: none;
                }
                .btn-send-request {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.35rem 0.75rem;
                    border-radius: 8px;
                    border: none;
                    font-family: inherit;
                    font-size: 0.78rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                    background: rgba(99,102,241,0.2);
                    color: #818cf8;
                }
                .btn-send-request:hover:not(:disabled) {
                    background: rgba(99,102,241,0.35);
                }
                .btn-send-request.btn-sent,
                .btn-send-request:disabled {
                    background: rgba(255,255,255,0.06);
                    color: rgba(255,255,255,0.3);
                    cursor: default;
                }

                /* Friend card */
                .friend-card {
                    background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%);
                    border: 1px solid rgba(255,255,255,0.07);
                    border-radius: 16px;
                    margin-bottom: 0.75rem;
                    overflow: hidden;
                    transition: border-color 0.15s;
                }
                .friend-card:hover { border-color: rgba(99,102,241,0.3); }

                .friend-card-top {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    padding: 1rem 1.1rem;
                    cursor: pointer;
                    user-select: none;
                }

                .chevron-btn {
                    margin-left: 0.5rem;
                    flex-shrink: 0;
                    color: rgba(255,255,255,0.3);
                    padding-top: 2px;
                    transition: color 0.15s;
                }
                .friend-card-top:hover .chevron-btn { color: rgba(255,255,255,0.6); }

                .btn-motivate {
                    margin-left: auto;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(251,191,36,0.1);
                    color: #fbbf24;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .btn-motivate:hover {
                    background: rgba(251,191,36,0.2);
                    transform: scale(1.05);
                }
                .btn-motivate:active {
                    transform: scale(0.95);
                }

                /* Activity feed */
                .activity-feed {
                    border-top: 1px solid rgba(255,255,255,0.06);
                    padding: 0.5rem 0.75rem 0.75rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0;
                }
                .activity-row {
                    display: flex;
                    align-items: center;
                    gap: 0.65rem;
                    padding: 0.45rem 0.35rem;
                    border-radius: 8px;
                    transition: background 0.1s;
                }
                .activity-row:hover { background: rgba(255,255,255,0.03); }
                .activity-icon {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .activity-icon-habit { background: rgba(249,115,22,0.15); color: #fb923c; }
                .activity-icon-task  { background: rgba(16,185,129,0.15);  color: #34d399; }
                .activity-content {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    min-width: 0;
                }
                .activity-name {
                    font-size: 0.82rem;
                    color: rgba(255,255,255,0.8);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .activity-badge {
                    font-size: 0.7rem;
                    font-weight: 700;
                    color: #fb923c;
                    background: rgba(249,115,22,0.12);
                    padding: 1px 5px;
                    border-radius: 4px;
                    flex-shrink: 0;
                }
                .activity-time {
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.25);
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .activity-loading {
                    display: flex;
                    align-items: center;
                    gap: 0.4rem;
                    padding: 0.75rem 0.35rem;
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.3);
                }
                .activity-empty {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.2);
                    padding: 0.5rem 0.35rem;
                    margin: 0;
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }

                /* Remove friend */
                .remove-friend-row {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.5rem;
                    padding-top: 0.5rem;
                    border-top: 1px solid rgba(255,255,255,0.05);
                }
                .remove-confirm-text {
                    font-size: 0.78rem;
                    color: rgba(255,255,255,0.4);
                    flex: 1;
                }
                .btn-remove-friend {
                    display: flex;
                    align-items: center;
                    gap: 0.3rem;
                    padding: 0.3rem 0.7rem;
                    border: none;
                    border-radius: 7px;
                    font-family: inherit;
                    font-size: 0.75rem;
                    font-weight: 600;
                    cursor: pointer;
                    background: rgba(244,63,94,0.1);
                    color: rgba(244,63,94,0.6);
                    transition: all 0.15s;
                }
                .btn-remove-friend:hover { background: rgba(244,63,94,0.2); color: #f43f5e; }
                .btn-remove-confirm {
                    background: rgba(244,63,94,0.2);
                    color: #f43f5e;
                }
                .btn-remove-confirm:hover:not(:disabled) { background: rgba(244,63,94,0.35); }
                .btn-remove-confirm:disabled { opacity: 0.5; cursor: wait; }
                .btn-remove-cancel {
                    padding: 0.3rem 0.6rem;
                    border: none;
                    border-radius: 7px;
                    font-family: inherit;
                    font-size: 0.75rem;
                    font-weight: 500;
                    cursor: pointer;
                    background: rgba(255,255,255,0.06);
                    color: rgba(255,255,255,0.4);
                }
                .btn-remove-cancel:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.1); }


                .friend-avatar {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: #fff;
                    flex-shrink: 0;
                    text-decoration: none;
                }
                .request-avatar { background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); }
                .search-avatar  { background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%); }

                .friend-info { flex: 1; min-width: 0; }
                .friend-name {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: #fff;
                    margin: 0 0 2px;
                    text-decoration: none;
                }
                .friend-since {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    color: rgba(255,255,255,0.35);
                    margin-bottom: 0.6rem;
                }

                /* Stat chips */
                .friend-stats {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.35rem;
                }
                .stat-chip {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.72rem;
                    font-weight: 600;
                    padding: 3px 8px;
                    border-radius: 6px;
                }
                .stat-fire   { background: rgba(249,115,22,0.15); color: #fb923c; }
                .stat-check  { background: rgba(16,185,129,0.15); color: #34d399; }
                .stat-trophy { background: rgba(234,179,8,0.15);  color: #facc15; }

                /* Request card */
                .request-card {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.85rem 1rem;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px;
                    margin-bottom: 0.5rem;
                }
                .request-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .request-actions {
                    display: flex;
                    gap: 0.4rem;
                }
                .btn-accept, .btn-reject {
                    width: 34px;
                    height: 34px;
                    border: none;
                    border-radius: 9px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                }
                .btn-accept {
                    background: rgba(16,185,129,0.15);
                    color: #34d399;
                }
                .btn-accept:hover:not(:disabled) { background: rgba(16,185,129,0.3); }
                .btn-reject {
                    background: rgba(244,63,94,0.1);
                    color: #f43f5e;
                }
                .btn-reject:hover:not(:disabled) { background: rgba(244,63,94,0.25); }
                .btn-accept:disabled, .btn-reject:disabled { opacity: 0.4; cursor: wait; }

                /* Empty state */
                .empty-state {
                    text-align: center;
                    padding: 3rem 1rem;
                    color: rgba(255,255,255,0.25);
                }
                .empty-state svg { margin-bottom: 1rem; opacity: 0.3; }
                .empty-state p { font-size: 0.9rem; }

                /* Spinner */
                .spinner {
                    display: flex;
                    justify-content: center;
                    padding: 2rem;
                    color: rgba(255,255,255,0.25);
                    font-size: 0.85rem;
                }

                /* Search hint */
                .search-hint {
                    text-align: center;
                    padding: 2rem;
                    color: rgba(255,255,255,0.22);
                    font-size: 0.83rem;
                }
            `}</style>

            <div className="friends-page">
                {/* Header */}
                <div className="friends-header">
                    <div className="friends-title-block">
                        <h1>{t('friends.title')} ({Array.isArray(friends) ? friends.length : 0})</h1>
                        <p>{t('friends.subtitle')}</p>
                    </div>
                    <div className="header-actions">
                        <button
                            id="btn-add-friend"
                            className={`icon-btn ${panel === 'search' ? 'active' : ''}`}
                            onClick={() => setPanel(panel === 'search' ? 'friends' : 'search')}
                        >
                            <UserPlus size={16} /> {t('friends.add')}
                        </button>
                        <button
                            id="btn-pending-requests"
                            className={`icon-btn ${panel === 'requests' ? 'active' : ''}`}
                            onClick={() => setPanel(panel === 'requests' ? 'friends' : 'requests')}
                        >
                            <Bell size={16} />
                            {pendingCount > 0 && (
                                <span className="badge">{pendingCount}</span>
                            )}
                        </button>
                    </div>
                </div>


                {/* ── Search panel ── */}
                {panel === 'search' && (
                    <div>
                        <div className="search-box">
                            <Search size={16} />
                            <input
                                id="search-friends-input"
                                className="search-input"
                                placeholder={t('friends.search')}
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                        </div>

                        {searchQuery.length < 2 && (
                            <div className="search-hint">
                                {t('friends.searchHint')}
                            </div>
                        )}

                        {searchLoading && <div className="spinner">{t('common.loading')}</div>}

                        {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                            <div className="empty-state">
                                <Users size={40} />
                                <p>{t('common.noData')}</p>
                            </div>
                        )}

                        {searchResults.map(user => (
                            <SearchResult
                                key={user.id}
                                user={user}
                                onSend={() => handleSendRequest(user.id)}
                                requestSent={sentIds.has(user.id)}
                            />
                        ))}
                    </div>
                )}

                {/* ── Pending requests panel ── */}
                {panel === 'requests' && (
                    <div>
                        {requestsLoading && <div className="spinner">{t('friends.loadingRequests')}</div>}

                        {!requestsLoading && requests.length === 0 && (
                            <div className="empty-state">
                                <Bell size={40} />
                                <p>{t('friends.pendingEmpty')}</p>
                            </div>
                        )}

                        {requests.map(req => (
                            <RequestCard
                                key={req.id}
                                request={req}
                                onAccept={() => handleRespond(req.id, true)}
                                onReject={() => handleRespond(req.id, false)}
                                loading={respondingId === req.id}
                            />
                        ))}
                    </div>
                )}

                {/* ── Friends list panel ── */}
                {panel === 'friends' && (
                    <div>
                        {friendsLoading && <div className="spinner">{t('friends.loadingFriends')}</div>}

                        {!friendsLoading && (!Array.isArray(friends) || friends.length === 0) && (
                            <div className="empty-state">
                                <Users size={48} />
                                <p>{t('friends.empty')}<br />
                                    <span style={{ color: '#818cf8' }}>{t('friends.emptySub')}</span>
                                </p>
                            </div>
                        )}

                        {sortedFriends.map(f => (
                            <FriendCard
                                key={f.friendshipId}
                                entry={f}
                                onRemove={handleRemoveFriend}
                                onMotivate={handleMotivate}
                                onCopyHabit={handleCopyHabit}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Motivation Modal / Chat */}
            {motivateEntry && (
                <ChatModal
                    friend={motivateEntry.friend}
                    onClose={() => setMotivateEntry(null)}
                    onSend={handleSendMotivation}
                />
            )}

            {/* Toast overlay */}
            {toast && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] px-4 py-2.5 rounded-2xl bg-surface-800 border border-surface-700 shadow-2xl animate-slide-up">
                    <p className="text-sm font-semibold text-white">{toast}</p>
                </div>
            )}
        </>
    );
}
