import api from './client';

export interface UserResult {
    id: string;
    name: string;
}

export interface FriendRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    sender: UserResult;
}

export interface FriendStats {
    maxStreak: number;
    tasksDone7d: number;
    habitsCompleted7d: number;
}

export interface ActivityItem {
    id: string;
    type: 'habit' | 'task';
    name: string;
    category?: string;
    habitType?: string;
    value?: number;
    timestamp: string;
}

export interface FriendEntry {
    friendshipId: string;
    since: string;
    friend: UserResult;
    stats: FriendStats;
}

export const searchUsers = (q: string) =>
    api.get<UserResult[]>('/friends/search', { params: { q } }).then(r => r.data);

export const sendFriendRequest = (receiverId: string) =>
    api.post('/friends/request', { receiverId }).then(r => r.data);

export const listPendingRequests = () =>
    api.get<FriendRequest[]>('/friends/requests').then(r => r.data);

export const respondToRequest = (requestId: string, accept: boolean) =>
    api.patch(`/friends/requests/${requestId}`, { accept }).then(r => r.data);

export const listFriends = () =>
    api.get<FriendEntry[]>('/friends').then(r => r.data);

export const getFriendActivity = (friendId: string) =>
    api.get<ActivityItem[]>(`/friends/${friendId}/activity`).then(r => r.data);

export const removeFriend = (friendId: string) =>
    api.delete(`/friends/${friendId}`).then(r => r.data);

export interface FriendMessage {
    id: string;
    senderId: string;
    receiverId: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    sender: UserResult;
}

export const sendMessage = (friendId: string, message: string) =>
    api.post<FriendMessage>(`/friends/${friendId}/messages`, { message }).then(r => r.data);

export const getChatHistory = (friendId: string) =>
    api.get<FriendMessage[]>(`/friends/${friendId}/messages`).then(r => r.data);

export const getUnreadMessages = () =>
    api.get<FriendMessage[]>('/friends/messages/unread').then(r => r.data);

export const markMessagesAsRead = (ids: string[]) =>
    api.patch('/friends/messages/read', { ids }).then(r => r.data);
