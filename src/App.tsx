import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import DashboardPage from '@/pages/DashboardPage';
import HabitsPage from '@/pages/HabitsPage';
import TasksPage from '@/pages/TasksPage';
import ProgressPage from '@/pages/ProgressPage';
import StatsPage from '@/pages/StatsPage';
import AdminPage from '@/pages/AdminPage';
import DiaryPage from '@/pages/DiaryPage';
import SettingsPage from '@/pages/SettingsPage';
import FriendsPage from '@/pages/FriendsPage';
import ProfilePage from '@/pages/ProfilePage';
import GymPage from '@/pages/GymPage';
import SmokePage from '@/pages/smoke/SmokePage';
import SmokeOnboardingPage from '@/pages/smoke/SmokeOnboardingPage';
import SmokePanicPage from '@/pages/smoke/SmokePanicPage';
import LandingPage from '@/pages/LandingPage';
import PrivacyPolicy from '@/pages/legal/PrivacyPolicy';
import TermsOfService from '@/pages/legal/TermsOfService';
import SupportPage from '@/pages/legal/SupportPage';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { initPushNotifications } from '@/services/pushNotifications';
import { connectSSE, disconnectSSE } from '@/services/sseConnection';
import { useFriendNotifStore } from '@/store/friendNotifStore';
import { Analytics } from '@vercel/analytics/react';

// App root — initializes theme and defines all routes

function ScrollToTop() {
    const { pathname } = useLocation();

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

export default function App() {
    // Apply persisted theme on mount
    const theme = useUIStore((s) => s.theme);
    const isLoggedIn = useAuthStore((s) => !!s.accessToken);

    React.useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme]);

    const fetchPending = useFriendNotifStore((s) => s.fetchPending);

    // Initialize Web Push + SSE + pending friend requests as soon as user is authenticated
    React.useEffect(() => {
        if (isLoggedIn) {
            initPushNotifications().catch(() => { });
            connectSSE();
            fetchPending();
        } else {
            disconnectSSE();
        }
        return () => { disconnectSSE(); };
    }, [isLoggedIn, fetchPending]);

    // Update tab title with notification count
    const pendingCount = useFriendNotifStore((s) => s.pendingCount);
    const unreadCount = useFriendNotifStore((s) => s.unreadMessages.length);
    React.useEffect(() => {
        const total = pendingCount + unreadCount;
        document.title = total > 0 ? `Hábitos (${total})` : 'Hábitos';
    }, [pendingCount, unreadCount]);

    return (
        <BrowserRouter>
            <ScrollToTop />
            <Analytics />
            <Routes>
                {/* Public */}
                <Route path="/landing" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/privacidad" element={<PrivacyPolicy />} />
                <Route path="/terminos" element={<TermsOfService />} />
                <Route path="/soporte" element={<SupportPage />} />

                {/* Main conditional route */}
                <Route path="/" element={isLoggedIn ? <Layout /> : <LandingPage />}>
                    <Route index element={isLoggedIn ? <DashboardPage /> : <LandingPage />} />
                    <Route path="habits" element={<ProtectedRoute><HabitsPage /></ProtectedRoute>} />
                    <Route path="tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                    <Route path="progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
                    <Route path="stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
                    <Route path="diary" element={<ProtectedRoute><DiaryPage /></ProtectedRoute>} />
                    <Route path="settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                    <Route path="friends" element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
                    <Route path="gym" element={<ProtectedRoute><GymPage /></ProtectedRoute>} />
                    <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="profile/:userId" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                    <Route path="admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                    <Route path="smoke" element={<ProtectedRoute><SmokePage /></ProtectedRoute>} />
                    <Route path="smoke/onboarding" element={<ProtectedRoute><SmokeOnboardingPage /></ProtectedRoute>} />
                </Route>

                <Route path="/smoke/panic" element={<ProtectedRoute><SmokePanicPage /></ProtectedRoute>} />


                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
