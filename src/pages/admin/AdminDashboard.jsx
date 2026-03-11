import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import {
    Users,
    GraduationCap,
    UserCheck,
    Shield,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import './AdminDashboard.css'

const ROLE_COLORS = { student: '#3b82f6', mentor: '#10b981', admin: '#8b5cf6' }

export default function AdminDashboard() {
    const { userData } = useAuth()
    const navigate = useNavigate()
    const [allUsers, setAllUsers] = useState([])
    const [students, setStudents] = useState([])
    const [mentors, setMentors] = useState([])
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const users = await userAPI.getAllUsers()
            setAllUsers(users)
            setStudents(users.filter(u => u.role === 'student'))
            setMentors(users.filter(u => u.role === 'mentor'))
            setAdmins(users.filter(u => u.role === 'admin'))
        } catch (error) {
            console.error('Error loading admin data:', error)
        }
        setLoading(false)
    }

    const handleApproveMentor = async (user) => {
        try {
            await userAPI.approveMentor(user.id)
            loadData()
        } catch (error) {
            console.error('Error approving mentor:', error)
        }
    }

    const handleRejectMentor = async (user) => {
        if (!window.confirm(`Are you sure you want to reject ${user.fullName}'s mentor registration?`)) return
        try {
            await userAPI.rejectMentor(user.id)
            loadData()
        } catch (error) {
            console.error('Error rejecting mentor:', error)
        }
    }

    // Department-wise user count
    const getDepartmentData = () => {
        const deptMap = {}
        allUsers.forEach(u => {
            const dept = u.department?.toUpperCase() || 'OTHER'
            if (!deptMap[dept]) deptMap[dept] = { name: dept, count: 0 }
            deptMap[dept].count += 1
        })
        return Object.values(deptMap).sort((a, b) => b.count - a.count)
    }

    // Role distribution for pie chart
    const getRoleData = () => [
        { name: 'Students', value: students.length, color: ROLE_COLORS.student },
        { name: 'Mentors', value: mentors.length, color: ROLE_COLORS.mentor },
        { name: 'Admins', value: admins.length, color: ROLE_COLORS.admin },
    ]

    // Recent users
    const getRecentUsers = () => {
        return [...allUsers]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6)
    }

    const pendingMentors = mentors.filter(m => m.isApproved === false)
    const deptData = getDepartmentData()
    const roleData = getRoleData()
    const recentUsers = getRecentUsers()

    return (
        <DashboardLayout role="admin">
            <div className="admin-page">
                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1 className="admin-title">Admin Dashboard</h1>
                        <p className="admin-subtitle">Welcome back, {userData?.fullName || 'Admin'}</p>
                    </div>
                    <div className="admin-actions">
                        <Button variant="primary" icon={<Users size={18} />} onClick={() => navigate('/admin/users')}>
                            Manage Users
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="admin-stats-grid">
                    <StatCard
                        title="Total Users"
                        value={allUsers.length.toString()}
                        icon={<Users size={24} />}
                        iconColor="primary"
                    />
                    <StatCard
                        title="Students"
                        value={students.length.toString()}
                        icon={<GraduationCap size={24} />}
                        iconColor="secondary"
                    />
                    <StatCard
                        title="Mentors"
                        value={mentors.length.toString()}
                        icon={<UserCheck size={24} />}
                        iconColor="accent"
                    />
                    <StatCard
                        title="Pending Approvals"
                        value={pendingMentors.length.toString()}
                        icon={<Clock size={24} />}
                        iconColor="warning"
                    />
                </div>

                {/* Charts Row */}
                <div className="admin-charts-row">
                    {/* Department Bar Chart */}
                    <Card className="admin-chart-card">
                        <CardHeader>
                            <CardTitle><Users size={18} /> Users by Department</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {deptData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={deptData} barGap={8}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                                        />
                                        <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Users" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="no-data-msg">No department data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Role Distribution Pie */}
                    <Card className="admin-chart-card">
                        <CardHeader>
                            <CardTitle><Shield size={18} /> Users by Role</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="pie-chart-layout">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={roleData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {roleData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pie-legend">
                                    {roleData.map((item, idx) => (
                                        <div key={idx} className="legend-item">
                                            <span className="legend-dot" style={{ background: item.color }}></span>
                                            <span className="legend-label">{item.name}</span>
                                            <strong>{item.value}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Mentor Approvals */}
                {pendingMentors.length > 0 && (
                    <Card className="pending-mentors-card">
                        <CardHeader>
                            <CardTitle>
                                <Clock size={20} />
                                Pending Mentor Approvals ({pendingMentors.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="pending-mentors-list">
                                {pendingMentors.map(mentor => (
                                    <div key={mentor.id} className="pending-mentor-row">
                                        <div className="pending-mentor-info">
                                            <div className="user-avatar role-mentor">
                                                {mentor.fullName?.charAt(0) || 'M'}
                                            </div>
                                            <div>
                                                <span className="user-name">{mentor.fullName}</span>
                                                <span className="user-email">{mentor.email}</span>
                                                {mentor.department && <span className="user-meta">Dept: {mentor.department.toUpperCase()}</span>}
                                            </div>
                                        </div>
                                        <div className="pending-mentor-actions">
                                            <button className="approve-btn" onClick={() => handleApproveMentor(mentor)}>
                                                <CheckCircle size={18} /> Approve
                                            </button>
                                            <button className="reject-btn" onClick={() => handleRejectMentor(mentor)}>
                                                <XCircle size={18} /> Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Users */}
                <Card className="admin-recent-card">
                    <CardHeader>
                        <div className="card-header-row">
                            <CardTitle><Users size={18} /> Recent Registrations</CardTitle>
                            <Link to="/admin/users">
                                <Button variant="ghost" size="sm">View All <ChevronRight size={14} /></Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentUsers.length > 0 ? (
                            <div className="recent-users-list">
                                {recentUsers.map(user => (
                                    <div key={user.id} className="recent-user-row">
                                        <div className="recent-user-avatar" style={{ background: ROLE_COLORS[user.role] || '#3b82f6' }}>
                                            {user.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="recent-user-info">
                                            <span className="recent-user-name">{user.fullName}</span>
                                            <span className="recent-user-email">{user.email}</span>
                                        </div>
                                        <div className="recent-user-meta">
                                            {user.department && <span className="recent-user-dept">{user.department.toUpperCase()}</span>}
                                        </div>
                                        <Badge variant={user.role === 'mentor' ? 'secondary' : user.role === 'admin' ? 'accent' : 'primary'} size="sm">
                                            {user.role}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-data-msg">No users registered yet</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
