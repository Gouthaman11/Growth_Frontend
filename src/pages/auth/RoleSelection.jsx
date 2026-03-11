import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Users, ArrowRight } from 'lucide-react'
import './Auth.css'

export default function RoleSelection() {
    const navigate = useNavigate()

    const roles = [
        {
            id: 'student',
            title: 'Student',
            description: 'Track your growth, coding progress, and career readiness',
            icon: GraduationCap,
            color: 'primary',
            path: '/auth/register'
        },
        {
            id: 'mentor',
            title: 'Mentor',
            description: 'Guide students, provide feedback, and monitor progress',
            icon: Users,
            color: 'secondary',
            path: '/auth/mentor-register'
        }
    ]

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-gradient"></div>
                <div className="auth-pattern"></div>
            </div>

            <div className="auth-container">
                <Link to="/" className="auth-logo">
                    <div className="auth-logo-icon">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" fill="url(#authLogoGradient)" />
                            <path d="M12 22 L18 28 L28 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 10 L20 18" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <circle cx="20" cy="8" r="2" fill="white" />
                            <defs>
                                <linearGradient id="authLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#1a365d" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="auth-logo-text">EduGrow<span className="auth-logo-plus">+</span></span>
                </Link>

                <div className="auth-content role-selection">
                    <div className="auth-header">
                        <h1 className="auth-title">Welcome to EduGrow+</h1>
                        <p className="auth-subtitle">Select your role to get started</p>
                    </div>

                    <div className="role-cards">
                        {roles.map((role) => (
                            <button
                                key={role.id}
                                className={`role-card-btn role-card-${role.color}`}
                                onClick={() => navigate(role.path)}
                            >
                                <div className={`role-card-icon role-card-icon-${role.color}`}>
                                    <role.icon size={32} />
                                </div>
                                <h3 className="role-card-title">{role.title}</h3>
                                <p className="role-card-description">{role.description}</p>
                                <span className="role-card-arrow">
                                    <ArrowRight size={20} />
                                </span>
                            </button>
                        ))}
                    </div>

                    <p className="auth-footer-text">
                        Already have an account?{' '}
                        <Link to="/auth/login" className="auth-link">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
