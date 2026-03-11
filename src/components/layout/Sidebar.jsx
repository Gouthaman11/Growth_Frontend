import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Code2,
    Target,
    FileText,
    Users,
    MessageSquare,
    Settings,
    Bell,
    BarChart3,
    LogOut,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    X,
    ClipboardCheck
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/student/coding-platforms', icon: Code2, label: 'Coding Platforms' },
    { to: '/student/academics', icon: GraduationCap, label: 'Academics' },
    { to: '/student/goals', icon: Target, label: 'Goals & Milestones' },
    { to: '/student/reports', icon: FileText, label: 'Reports' },
    { to: '/student/feedback', icon: MessageSquare, label: 'Feedback' },
    { to: '/student/resume', icon: ClipboardCheck, label: 'Resume ATS' },
]

const mentorLinks = [
    { to: '/mentor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/mentor/courses', icon: GraduationCap, label: 'Courses' },
]

const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'User Management' },
    { to: '/admin/integrations', icon: Settings, label: 'Integrations' },
    { to: '/admin/announcements', icon: Bell, label: 'Announcements' },
]

export default function Sidebar({ role = 'student', mobileOpen = false, onMobileClose, collapsed = false, onToggleCollapse }) {
    const location = useLocation()
    const navigate = useNavigate()
    const { currentUser, userData, logout } = useAuth()

    // Close mobile sidebar on route change
    useEffect(() => {
        if (mobileOpen && onMobileClose) {
            onMobileClose()
        }
    }, [location.pathname])

    const links = role === 'admin' ? adminLinks : role === 'mentor' ? mentorLinks : studentLinks

    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1)

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    // Get user initials
    const getUserInitials = () => {
        if (userData?.fullName) {
            const names = userData.fullName.split(' ')
            return names.length > 1
                ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`
                : names[0].charAt(0)
        }
        return currentUser?.email?.charAt(0).toUpperCase() || 'U'
    }

    return (
        <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
            {/* Mobile close button */}
            <button
                className="sidebar-close-mobile"
                onClick={onMobileClose}
                aria-label="Close menu"
            >
                <X size={24} />
            </button>

            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" fill="url(#sidebarLogoGradient)" />
                            <path d="M12 22 L18 28 L28 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 10 L20 18" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <circle cx="20" cy="8" r="2" fill="white" />
                            <defs>
                                <linearGradient id="sidebarLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#1a365d" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    {!collapsed && (
                        <span className="sidebar-logo-text">
                            EduGrow<span className="sidebar-logo-plus">+</span>
                        </span>
                    )}
                </div>
                <button className="sidebar-toggle" onClick={onToggleCollapse}>
                    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {!collapsed && (
                <div className="sidebar-role">
                    <span className="sidebar-role-label">{roleLabel} Portal</span>
                </div>
            )}

            <nav className="sidebar-nav">
                <ul className="sidebar-links">
                    {links.map((link) => (
                        <li key={link.to}>
                            <NavLink
                                to={link.to}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                title={collapsed ? link.label : undefined}
                            >
                                <link.icon size={20} />
                                {!collapsed && <span>{link.label}</span>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div
                    className="sidebar-user sidebar-user-clickable"
                    onClick={() => navigate('/profile')}
                    title={collapsed ? 'Profile' : undefined}
                >
                    <div className="sidebar-avatar">
                        <span>{getUserInitials()}</span>
                    </div>
                    {!collapsed && (
                        <div className="sidebar-user-info">
                            <span className="sidebar-user-name">
                                {userData?.fullName || 'User'}
                            </span>
                            <span className="sidebar-user-email">
                                {currentUser?.email || 'Not logged in'}
                            </span>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleLogout}
                    className="sidebar-link sidebar-logout"
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut size={20} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    )
}
