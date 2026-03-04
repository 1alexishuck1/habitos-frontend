import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import HabitsPage from '@/pages/HabitsPage';
import TasksPage from '@/pages/TasksPage';
import StatsPage from '@/pages/StatsPage';
import DiaryPage from '@/pages/DiaryPage';
import SettingsPage from '@/pages/SettingsPage';
import FriendsPage from '@/pages/FriendsPage';
import GymPage from '@/pages/GymPage';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { initPushNotifications } from '@/services/pushNotifications';
import { useFriendNotifStore } from '@/store/friendNotifStore';

// App root — initializes theme and defines all routes

export default function App() {
    // Apply persisted theme on mount
    const theme = useUIStore((s) => s.theme);
    const isLoggedIn = useAuthStore((s) => !!s.accessToken);

    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const fetchPending = useFriendNotifStore((s) => s.fetchPending);

    // Initialize Web Push + pending friend requests as soon as user is authenticated
    React.useEffect(() => {
        if (isLoggedIn) {
            initPushNotifications().catch(() => { });
            fetchPending();
        }
    }, [isLoggedIn, fetchPending]);

    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected — wrapped in shell layout */}
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<DashboardPage />} />
                    <Route path="habits" element={<HabitsPage />} />
                    <Route path="tasks" element={<TasksPage />} />
                    <Route path="stats" element={<StatsPage />} />
                    <Route path="diary" element={<DiaryPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="friends" element={<FriendsPage />} />
                    <Route path="gym" element={<GymPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
