import { create } from 'zustand';
import { listPendingRequests, getUnreadMessages, FriendMessage } from '@/api/friends';

interface FriendNotifState {
    pendingCount: number;
    setPendingCount: (n: number) => void;

    unreadMessages: FriendMessage[];
    setUnreadMessages: (msgs: FriendMessage[]) => void;
    addUnreadMessage: (msg: FriendMessage) => void;
    removeUnreadMessagesForFriend: (friendId: string) => void;

    fetchPending: () => Promise<void>;
}

export const useFriendNotifStore = create<FriendNotifState>((set) => ({
    pendingCount: 0,
    setPendingCount: (n) => set({ pendingCount: n }),

    unreadMessages: [],
    setUnreadMessages: (msgs) => set({ unreadMessages: msgs }),
    addUnreadMessage: (msg) => set((s) => {
        // Only add if not already present
        if (s.unreadMessages.some(m => m.id === msg.id)) return s;
        return { unreadMessages: [...s.unreadMessages, msg] };
    }),
    removeUnreadMessagesForFriend: (friendId) => set((s) => ({
        unreadMessages: s.unreadMessages.filter(m => m.senderId !== friendId)
    })),

    fetchPending: async () => {
        try {
            const [requests, messages] = await Promise.all([
                listPendingRequests(),
                getUnreadMessages()
            ]);
            set({
                pendingCount: requests.length,
                unreadMessages: messages
            });
        } catch {
            // silently ignore — user might not be logged in yet
        }
    },
}));
