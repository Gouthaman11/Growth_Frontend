import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles }) {
    const { currentUser, userData, loading } = useAuth()

    // Show loading only on initial load
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: 'white'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '16px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}></div>
                    <p style={{ fontSize: '16px', fontWeight: 500 }}>Loading...</p>
                </div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!currentUser || !userData) {
        return <Navigate to="/auth/login" replace />
    }

    // Check role permissions
    if (allowedRoles && !allowedRoles.includes(userData.role)) {
        // Redirect to appropriate dashboard based on role
        if (userData.role === 'student') {
            return <Navigate to="/student/dashboard" replace />
        } else if (userData.role === 'mentor') {
            return <Navigate to="/mentor/dashboard" replace />
        } else if (userData.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />
        }
        return <Navigate to="/" replace />
    }

    return children
}
