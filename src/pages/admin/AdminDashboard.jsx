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
    TrendingUp,
    AlertTriangle,
    Settings,
    Bell,
    Download,
    UserCheck,
    Eye,
    ChevronRight,
    Activity,
    Shield,
    BarChart3,
    BookOpen
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
    Cell,
    AreaChart,
    Area
} from 'recharts'
import './AdminDashboard.css'

export default function AdminDashboard() {
    const { userData } = useAuth()
    const navigate = useNavigate()
    const [allUsers, setAllUsers] = useState([])
    const [students, setStudents] = useState([])
    const [mentors, setMentors] = useState([])
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
        } catch (error) {
            console.error('Error loading admin data:', error)
        }
        setLoading(false)
    }

    // Compute department distribution
    const getDepartmentData = () => {
        const deptMap = {}
        students.forEach(s => {
            const dept = s.department?.toUpperCase() || 'OTHER'
            if (!deptMap[dept]) deptMap[dept] = { name: dept, students: 0, totalScore: 0 }
            deptMap[dept].students += 1
            deptMap[dept].totalScore += (s.growthScore || 0)
        })
        return Object.values(deptMap).map(d => ({
            ...d,
            avgScore: d.students > 0 ? Math.round(d.totalScore / d.students) : 0
        })).sort((a, b) => b.students - a.students)
    }

    // Performance distribution
    const getPerformanceDistribution = () => {
        let excellent = 0, good = 0, average = 0, needsAttention = 0
        students.forEach(s => {
            const score = s.growthScore || 0
            if (score >= 80) excellent++
            else if (score >= 60) good++
            else if (score >= 40) average++
            else needsAttention++
        })
        const total = students.length || 1
        return [
            { name: 'Excellent (80+)', value: Math.round((excellent / total) * 100), count: excellent, color: '#10b981' },
            { name: 'Good (60-79)', value: Math.round((good / total) * 100), count: good, color: '#3b82f6' },
            { name: 'Average (40-59)', value: Math.round((average / total) * 100), count: average, color: '#f59e0b' },
            { name: 'Needs Attention (<40)', value: Math.round((needsAttention / total) * 100), count: needsAttention, color: '#ef4444' },
        ]
    }

    // Alerts
    const getAlerts = () => {
        const alerts = []
        const lowAttendance = students.filter(s => (s.academics?.attendance || 100) < 75)
        if (lowAttendance.length > 0) {
            alerts.push({ type: 'warning', message: `${lowAttendance.length} students below 75% attendance`, icon: AlertTriangle })
        }
        const lowScore = students.filter(s => (s.growthScore || 0) < 30)
        if (lowScore.length > 0) {
            alerts.push({ type: 'error', message: `${lowScore.length} students with growth score below 30`, icon: AlertTriangle })
        }
        const noProfiles = students.filter(s => !s.codingProfiles?.github && !s.codingProfiles?.leetcode)
        if (noProfiles.length > 0) {
            alerts.push({ type: 'info', message: `${noProfiles.length} students haven't linked coding profiles`, icon: Bell })
        }
        const highPerformers = students.filter(s => (s.growthScore || 0) >= 85)
        if (highPerformers.length > 0) {
            alerts.push({ type: 'success', message: `${highPerformers.length} students scoring 85+ growth score`, icon: TrendingUp })
        }
        return alerts
    }

    // Recent users
    const getRecentUsers = () => {
        return [...allUsers]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 6)
    }

    // Stats
    const avgGrowthScore = students.length > 0
        ? Math.round(students.reduce((sum, s) => sum + (s.growthScore || 0), 0) / students.length)
        : 0
    const alertCount = students.filter(s => (s.growthScore || 0) < 40 || (s.academics?.attendance || 100) < 75).length

    // Top departments by score
    const deptData = getDepartmentData()
    const perfData = getPerformanceDistribution()
    const alerts = getAlerts()
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
                        <Button variant="outline" icon={<Download size={18} />} onClick={() => navigate('/admin/users')}>
                            Manage Users
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="admin-stats-grid">
                    <StatCard
                        title="Total Students"
                        value={students.length.toString()}
                        icon={<GraduationCap size={24} />}
                        iconColor="primary"
                    />
                    <StatCard
                        title="Total Mentors"
                        value={mentors.length.toString()}
                        icon={<UserCheck size={24} />}
                        iconColor="secondary"
                    />
                    <StatCard
                        title="Avg Growth Score"
                        value={avgGrowthScore.toString()}
                        icon={<TrendingUp size={24} />}
                        iconColor="accent"
                    />
                    <StatCard
                        title="Alerts"
                        value={alertCount.toString()}
                        change="Need review"
                        changeType="negative"
                        icon={<AlertTriangle size={24} />}
                        iconColor="warning"
                    />
                </div>

                {/* Charts Row */}
                <div className="admin-charts-row">
                    {/* Department Bar Chart */}
                    <Card className="admin-chart-card">
                        <CardHeader>
                            <CardTitle><BarChart3 size={18} /> Department Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {deptData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <BarChart data={deptData} barGap={8}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                                        <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                                            formatter={(value, name) => [value, name === 'avgScore' ? 'Avg Score' : 'Students']}
                                        />
                                        <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} name="Students" />
                                        <Bar dataKey="avgScore" fill="#10b981" radius={[6, 6, 0, 0]} name="Avg Score" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="no-data-msg">No department data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performance Pie */}
                    <Card className="admin-chart-card">
                        <CardHeader>
                            <CardTitle><Activity size={18} /> Student Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="pie-chart-layout">
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={perfData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {perfData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(val) => `${val}%`} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pie-legend">
                                    {perfData.map((item, idx) => (
                                        <div key={idx} className="legend-item">
                                            <span className="legend-dot" style={{ background: item.color }}></span>
                                            <span className="legend-label">{item.name}</span>
                                            <strong>{item.count}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Row */}
                <div className="admin-bottom-row">
                    {/* Alerts */}
                    <Card className="admin-alerts-card">
                        <CardHeader>
                            <CardTitle><Bell size={18} /> System Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {alerts.length > 0 ? (
                                <div className="alerts-list">
                                    {alerts.map((alert, idx) => (
                                        <div key={idx} className={`alert-item alert-${alert.type}`}>
                                            <div className="alert-icon-wrap">
                                                <alert.icon size={16} />
                                            </div>
                                            <p>{alert.message}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="no-data-msg">No alerts — everything looks good!</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Users */}
                    <Card className="admin-recent-card">
                        <CardHeader>
                            <div className="card-header-row">
                                <CardTitle><Users size={18} /> Recent Users</CardTitle>
                                <Link to="/admin/users">
                                    <Button variant="ghost" size="sm">View All <ChevronRight size={14} /></Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="recent-users-list">
                                {recentUsers.map(user => (
                                    <div key={user.id} className="recent-user-row">
                                        <div className="recent-user-avatar">
                                            {user.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <div className="recent-user-info">
                                            <span className="recent-user-name">{user.fullName}</span>
                                            <span className="recent-user-email">{user.email}</span>
                                        </div>
                                        <Badge variant={user.role === 'mentor' ? 'secondary' : user.role === 'admin' ? 'accent' : 'primary'} size="sm">
                                            {user.role}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="admin-quick-actions">
                    <Card className="quick-action-card" hover onClick={() => navigate('/admin/users')}>
                        <div className="qa-icon qa-icon-users"><Users size={22} /></div>
                        <span>Manage Users</span>
                    </Card>
                    <Card className="quick-action-card" hover onClick={() => navigate('/admin/integrations')}>
                        <div className="qa-icon qa-icon-settings"><Settings size={22} /></div>
                        <span>Integrations</span>
                    </Card>
                    <Card className="quick-action-card" hover onClick={() => navigate('/admin/announcements')}>
                        <div className="qa-icon qa-icon-announce"><Bell size={22} /></div>
                        <span>Announcements</span>
                    </Card>
                    <Card className="quick-action-card" hover onClick={() => navigate('/admin/users')}>
                        <div className="qa-icon qa-icon-reports"><BarChart3 size={22} /></div>
                        <span>View Reports</span>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
