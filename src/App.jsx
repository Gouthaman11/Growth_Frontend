import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Landing
import LandingPage from './pages/landing/LandingPage'

// Auth
import RoleSelection from './pages/auth/RoleSelection'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import MentorRegister from './pages/auth/MentorRegister'

// Student
import StudentDashboard from './pages/student/StudentDashboard'
import CodingPlatforms from './pages/student/CodingPlatforms'
import Goals from './pages/student/Goals'
import Reports from './pages/student/Reports'
import Academics from './pages/student/Academics'
import Feedback from './pages/student/Feedback'
import Resume from './pages/student/Resume'

// Mentor
import MentorDashboard from './pages/mentor/MentorDashboard'
import StudentDetail from './pages/mentor/StudentDetail'
import MentorCourses from './pages/mentor/MentorCourses'


// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import IntegrationSettings from './pages/admin/IntegrationSettings'
import Announcements from './pages/admin/Announcements'

// Shared
import Profile from './pages/profile/Profile'

function AppRoutes() {
    const { currentUser, userData } = useAuth()

    // Root route handler - redirect based on auth status
    const RootRoute = () => {
        if (currentUser && userData) {
            if (userData.role === 'student') return <Navigate to="/student/dashboard" replace />
            if (userData.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />
            if (userData.role === 'admin') return <Navigate to="/admin/dashboard" replace />
        }
        return <LandingPage />
    }

    // Redirect logged-in users away from auth pages
    const AuthRoute = ({ children }) => {
        if (currentUser && userData) {
            if (userData.role === 'student') return <Navigate to="/student/dashboard" replace />
            if (userData.role === 'mentor') return <Navigate to="/mentor/dashboard" replace />
            if (userData.role === 'admin') return <Navigate to="/admin/dashboard" replace />
        }
        return children
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRoute />} />

            {/* Auth Routes */}
            <Route path="/auth/select-role" element={<AuthRoute><RoleSelection /></AuthRoute>} />
            <Route path="/auth/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/auth/register" element={<AuthRoute><Register /></AuthRoute>} />
            <Route path="/auth/mentor-register" element={<AuthRoute><MentorRegister /></AuthRoute>} />

            {/* Student Routes - Protected */}
            <Route path="/student/dashboard" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <StudentDashboard />
                </ProtectedRoute>
            } />
            <Route path="/student/coding-platforms" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <CodingPlatforms />
                </ProtectedRoute>
            } />
            <Route path="/student/goals" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <Goals />
                </ProtectedRoute>
            } />
            <Route path="/student/reports" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <Reports />
                </ProtectedRoute>
            } />
            <Route path="/student/academics" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <Academics />
                </ProtectedRoute>
            } />
            <Route path="/student/feedback" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <Feedback />
                </ProtectedRoute>
            } />
            <Route path="/student/resume" element={
                <ProtectedRoute allowedRoles={['student']}>
                    <Resume />
                </ProtectedRoute>
            } />

            {/* Mentor Routes - Protected */}
            <Route path="/mentor/dashboard" element={
                <ProtectedRoute allowedRoles={['mentor']}>
                    <MentorDashboard />
                </ProtectedRoute>
            } />
            <Route path="/mentor/student/:id" element={
                <ProtectedRoute allowedRoles={['mentor', 'admin']}>
                    <StudentDetail />
                </ProtectedRoute>
            } />
            <Route path="/mentor/courses" element={
                <ProtectedRoute allowedRoles={['mentor', 'admin']}>
                    <MentorCourses />
                </ProtectedRoute>
            } />


            {/* Admin Routes - Protected */}
            <Route path="/admin/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <UserManagement />
                </ProtectedRoute>
            } />
            <Route path="/admin/integrations" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <IntegrationSettings />
                </ProtectedRoute>
            } />
            <Route path="/admin/announcements" element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <Announcements />
                </ProtectedRoute>
            } />

            {/* Profile - All roles */}
            <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['student', 'mentor', 'admin']}>
                    <Profile />
                </ProtectedRoute>
            } />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default function App() {
    return <AppRoutes />
}
