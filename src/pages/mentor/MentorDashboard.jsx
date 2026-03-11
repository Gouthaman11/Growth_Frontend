import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { groqAPI, userAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import {
    Users,
    AlertTriangle,
    TrendingUp,
    MessageSquare,
    Eye,
    RefreshCw,
    Search,
    Filter,
    GraduationCap,
    ChevronRight,
    TrendingDown,
    ArrowUp,
    ArrowDown,
    Activity,
    Sparkles,
    Target,
    Calendar,
    Zap,
    Award,
    BarChart3,
    Clock,
    BookOpen,
    FileText,
    Trophy
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import './MentorDashboard.css'

export default function MentorDashboard() {
    const { userData, getAllStudents } = useAuth()
    const navigate = useNavigate()
    const [allStudents, setAllStudents] = useState([])
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showAllDepartments, setShowAllDepartments] = useState(false)
    const [sortBy, setSortBy] = useState('growthScore')
    const [sortOrder, setSortOrder] = useState('desc')
    const [stats, setStats] = useState({
        totalStudents: 0,
        alerts: 0,
        avgGrowthScore: 0,
        feedbackGiven: 0,
        improving: 0,
        declining: 0
    })
    const [atsLeaderboard, setAtsLeaderboard] = useState([])
    const [atsLoading, setAtsLoading] = useState(false)
    const [rankingsMap, setRankingsMap] = useState({})

    const mentorDepartment = userData?.department?.toLowerCase()

    useEffect(() => {
        loadStudents()
    }, [])

    useEffect(() => {
        let filtered = allStudents

        if (!showAllDepartments && mentorDepartment) {
            filtered = allStudents.filter(s =>
                s.department?.toLowerCase() === mentorDepartment
            )
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(s =>
                s.fullName?.toLowerCase().includes(term) ||
                s.rollNumber?.toLowerCase().includes(term) ||
                s.email?.toLowerCase().includes(term)
            )
        }

        filtered = [...filtered].sort((a, b) => {
            let compareValue = 0
            switch (sortBy) {
                case 'growthScore':
                    compareValue = (b.growthScore || 0) - (a.growthScore || 0)
                    break
                case 'name':
                    compareValue = (a.fullName || '').localeCompare(b.fullName || '')
                    break
                case 'improvement':
                    compareValue = calculateTrend(b) - calculateTrend(a)
                    break
                case 'cgpa':
                    compareValue = (b.academics?.cgpa || 0) - (a.academics?.cgpa || 0)
                    break
                default:
                    compareValue = 0
            }
            return sortOrder === 'desc' ? compareValue : -compareValue
        })

        setStudents(filtered)

        const totalStudents = filtered.length
        const alerts = filtered.filter(s => (s.growthScore || 0) < 50 || (s.academics?.attendance || 100) < 75).length
        const avgGrowthScore = totalStudents > 0
            ? Math.round(filtered.reduce((sum, s) => sum + (s.growthScore || 0), 0) / totalStudents)
            : 0
        const improving = filtered.filter(s => calculateTrend(s) > 0).length
        const declining = filtered.filter(s => calculateTrend(s) < 0).length

        setStats({
            totalStudents,
            alerts,
            avgGrowthScore,
            feedbackGiven: Math.floor(totalStudents * 0.8),
            improving,
            declining
        })
    }, [allStudents, showAllDepartments, searchTerm, mentorDepartment, sortBy, sortOrder])

    const calculateTrend = (student) => {
        // Derive trend from actual data instead of random values
        const score = student.growthScore || 0
        const cgpa = student.academics?.cgpa || 0
        const attendance = student.academics?.attendance || 0
        // Positive if good score + good academics, negative if struggling
        if (score >= 70 && cgpa >= 7) return Math.round((score - 50) / 5)
        if (score >= 50) return Math.round((score - 55) / 5)
        return Math.round((score - 60) / 5)
    }

    const loadStudents = async () => {
        setLoading(true)
        try {
            const fetchedStudents = await getAllStudents()
            setAllStudents(fetchedStudents)
        } catch (error) {
            console.error('Error loading students:', error)
        }
        setLoading(false)
        // Load ATS leaderboard
        try {
            setAtsLoading(true)
            const lb = await groqAPI.getResumeLeaderboard()
            setAtsLeaderboard(lb.leaderboard || [])
        } catch (e) {
            console.log('ATS leaderboard not available:', e.message)
        } finally {
            setAtsLoading(false)
        }

        // Load growth rankings
        try {
            const rankData = await userAPI.getGrowthRankings()
            if (rankData?.rankings) {
                const map = {}
                rankData.rankings.forEach(r => {
                    map[r.id] = { rank: r.rank, breakdown: r.breakdown, courseStats: r.courseStats }
                })
                setRankingsMap(map)
            }
        } catch (e) {
            console.log('Rankings not available:', e.message)
        }
    }

    const getDepartmentData = () => {
        const depts = {}
        allStudents.forEach(student => {
            const dept = student.department?.toUpperCase() || 'OTHER'
            if (!depts[dept]) depts[dept] = { scores: [], count: 0 }
            depts[dept].scores.push(student.growthScore || 0)
            depts[dept].count++
        })
        return Object.entries(depts).map(([name, data]) => ({
            name,
            avgScore: data.scores.length > 0
                ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
                : 0,
            count: data.count
        }))
    }

    const getPerformanceDistribution = () => {
        const excellent = students.filter(s => (s.growthScore || 0) >= 80).length
        const good = students.filter(s => (s.growthScore || 0) >= 60 && (s.growthScore || 0) < 80).length
        const average = students.filter(s => (s.growthScore || 0) >= 40 && (s.growthScore || 0) < 60).length
        const atRisk = students.filter(s => (s.growthScore || 0) < 40).length
        return [
            { name: 'Excellent', value: excellent, color: '#10b981' },
            { name: 'Good', value: good, color: '#6366f1' },
            { name: 'Average', value: average, color: '#f59e0b' },
            { name: 'At Risk', value: atRisk, color: '#ef4444' }
        ].filter(d => d.value > 0)
    }

    const alertStudents = students
        .filter(s => (s.growthScore || 0) < 50 || (s.academics?.attendance || 100) < 75)
        .sort((a, b) => (a.growthScore || 0) - (b.growthScore || 0))
        .slice(0, 5)

    const topPerformers = [...students]
        .sort((a, b) => (b.growthScore || 0) - (a.growthScore || 0))
        .slice(0, 5)

    // Compute skill proficiency from real student data
    const getSkillProficiency = () => {
        if (students.length === 0) return []
        const withCoding = students.filter(s => s.codingProfiles?.leetcode || s.codingProfiles?.github)
        const withGoodGPA = students.filter(s => (s.academics?.cgpa || 0) >= 7)
        const withAttendance = students.filter(s => (s.academics?.attendance || 0) >= 75)
        const highScorers = students.filter(s => (s.growthScore || 0) >= 60)
        return [
            { skill: 'Coding Activity', proficient: withCoding.length, total: students.length },
            { skill: 'Academics (CGPA ≥ 7)', proficient: withGoodGPA.length, total: students.length },
            { skill: 'Attendance (≥ 75%)', proficient: withAttendance.length, total: students.length },
            { skill: 'Growth Score (≥ 60)', proficient: highScorers.length, total: students.length },
        ]
    }

    // Growth score distribution for chart — uses actual student scores
    const getScoreDistributionData = () => {
        const ranges = [
            { range: '0-20', min: 0, max: 20 },
            { range: '21-40', min: 21, max: 40 },
            { range: '41-60', min: 41, max: 60 },
            { range: '61-80', min: 61, max: 80 },
            { range: '81-100', min: 81, max: 100 },
        ]
        return ranges.map(r => ({
            range: r.range,
            count: students.filter(s => (s.growthScore || 0) >= r.min && (s.growthScore || 0) <= r.max).length
        }))
    }

    const getImprovementLeaders = () => {
        return [...students]
            .map(s => ({ ...s, trend: calculateTrend(s) }))
            .filter(s => s.trend > 0)
            .sort((a, b) => b.trend - a.trend)
            .slice(0, 5)
    }

    const handleViewStudent = (studentId) => {
        navigate(`/mentor/student/${studentId}`)
    }

    const TrendIndicator = ({ value }) => {
        if (!value || value === 0) return <span className="md-trend-neutral">—</span>
        return value > 0 ? (
            <span className="md-trend-up"><ArrowUp size={13} /> {value}</span>
        ) : (
            <span className="md-trend-down"><ArrowDown size={13} /> {Math.abs(value)}</span>
        )
    }

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981'
        if (score >= 60) return '#6366f1'
        if (score >= 40) return '#f59e0b'
        return '#ef4444'
    }

    if (loading) {
        return (
            <DashboardLayout role="mentor">
                <div className="md-loading">
                    <div className="md-loading-spinner">
                        <RefreshCw className="spin" size={28} />
                    </div>
                    <p>Loading dashboard...</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="mentor">
            <div className="md-page">

                {/* Header */}
                <div className="md-header">
                    <div className="md-header-left">
                        <h1 className="md-title">Mentor Dashboard</h1>
                        <p className="md-subtitle">
                            Welcome, <strong>{userData?.fullName || 'Mentor'}</strong>
                            {mentorDepartment && <span className="md-dept-tag">{mentorDepartment.toUpperCase()}</span>}
                        </p>
                    </div>
                    <div className="md-header-right">
                        <button className="md-btn md-btn-ghost" onClick={loadStudents}>
                            <RefreshCw size={15} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="md-kpis">
                    <div className="md-kpi">
                        <div className="md-kpi-icon md-kpi-blue"><Users size={20} /></div>
                        <div className="md-kpi-body">
                            <span className="md-kpi-val">{stats.totalStudents}</span>
                            <span className="md-kpi-lbl">Total Students</span>
                        </div>
                        <span className="md-kpi-sub">{showAllDepartments ? 'All depts' : mentorDepartment?.toUpperCase()}</span>
                    </div>
                    <div className="md-kpi">
                        <div className="md-kpi-icon md-kpi-red"><AlertTriangle size={20} /></div>
                        <div className="md-kpi-body">
                            <span className="md-kpi-val">{stats.alerts}</span>
                            <span className="md-kpi-lbl">Need Attention</span>
                        </div>
                        {stats.alerts > 0 ? (
                            <span className="md-kpi-alert">Action needed</span>
                        ) : (
                            <span className="md-kpi-ok">All good ✓</span>
                        )}
                    </div>
                    <div className="md-kpi">
                        <div className="md-kpi-icon md-kpi-indigo"><Target size={20} /></div>
                        <div className="md-kpi-body">
                            <span className="md-kpi-val">{stats.avgGrowthScore}</span>
                            <span className="md-kpi-lbl">Avg Growth Score</span>
                        </div>
                        <span className="md-kpi-sub">out of 100</span>
                    </div>
                    <div className="md-kpi">
                        <div className="md-kpi-icon md-kpi-green"><TrendingUp size={20} /></div>
                        <div className="md-kpi-body">
                            <span className="md-kpi-val">{stats.improving}</span>
                            <span className="md-kpi-lbl">Improving</span>
                        </div>
                        <span className="md-kpi-sub md-kpi-decline">{stats.declining} declining</span>
                    </div>
                </div>

                <div className="md-charts-row">
                    <div className="md-chart-card md-chart-wide">
                        <div className="md-chart-head">
                            <div>
                                <h3><Activity size={16} /> Score Distribution</h3>
                                <p>How students are distributed across growth score ranges</p>
                            </div>
                            <div className="md-chart-badges">
                                <span className="md-cbadge md-cbadge-green"><Sparkles size={12} /> {stats.improving} improving</span>
                                <span className="md-cbadge md-cbadge-red"><TrendingDown size={12} /> {stats.declining} declining</span>
                            </div>
                        </div>
                        <div className="md-chart-body">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={getScoreDistributionData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', fontSize: '0.82rem', padding: '10px 14px' }} formatter={(value) => [`${value} students`, 'Count']} />
                                    <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]} barSize={32}>
                                        {getScoreDistributionData().map((entry, index) => {
                                            const colors = ['#ef4444', '#f59e0b', '#f59e0b', '#6366f1', '#10b981']
                                            return <Cell key={`cell-${index}`} fill={colors[index]} />
                                        })}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="md-chart-card">
                        <div className="md-chart-head">
                            <div>
                                <h3><BarChart3 size={16} /> Distribution</h3>
                                <p>Performance category breakdown</p>
                            </div>
                        </div>
                        <div className="md-chart-body md-pie-wrap">
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={getPerformanceDistribution()} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                                        {getPerformanceDistribution().map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="md-pie-legend">
                                {getPerformanceDistribution().map((item, idx) => (
                                    <div key={idx} className="md-legend-row">
                                        <span className="md-legend-dot" style={{ background: item.color }}></span>
                                        <span className="md-legend-name">{item.name}</span>
                                        <span className="md-legend-val">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="md-filterbar">
                    <div className="md-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="md-filter-right">
                        <div className="md-sort">
                            <Filter size={14} />
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                <option value="growthScore">Score</option>
                                <option value="improvement">Improvement</option>
                                <option value="name">Name</option>
                                <option value="cgpa">CGPA</option>
                            </select>
                            <button className="md-sort-dir" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                                {sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                            </button>
                        </div>
                        <div className="md-tab-toggle">
                            <button className={`md-tab ${!showAllDepartments ? 'md-tab-active' : ''}`} onClick={() => setShowAllDepartments(false)}>
                                My Dept
                            </button>
                            <button className={`md-tab ${showAllDepartments ? 'md-tab-active' : ''}`} onClick={() => setShowAllDepartments(true)}>
                                All Depts
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3-column insights */}
                <div className="md-insights">
                    {/* Alert Students */}
                    <div className="md-insight-panel md-insight-alert">
                        <div className="md-insight-head">
                            <AlertTriangle size={15} />
                            <h4>Need Attention</h4>
                            <span className="md-insight-count md-count-red">{alertStudents.length}</span>
                        </div>
                        {alertStudents.length > 0 ? (
                            <div className="md-insight-list">
                                {alertStudents.map((student, idx) => (
                                    <div key={student.id || idx} className="md-insight-item md-item-alert" onClick={() => handleViewStudent(student.id)}>
                                        <div className="md-ins-avatar md-avatar-red">{student.fullName?.charAt(0) || 'S'}</div>
                                        <div className="md-ins-info">
                                            <span className="md-ins-name">{student.fullName || 'Unknown'}</span>
                                            <span className="md-ins-meta">{student.rollNumber} • {student.department?.toUpperCase()}</span>
                                        </div>
                                        <div className="md-ins-right">
                                            <span className="md-ins-score" style={{ color: '#ef4444' }}>{student.growthScore || 0}</span>
                                            <ChevronRight size={14} className="md-chevron" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="md-empty"><span>🎉</span><p>All students performing well!</p></div>
                        )}
                    </div>

                    {/* Top Performers */}
                    <div className="md-insight-panel md-insight-top">
                        <div className="md-insight-head">
                            <Award size={15} />
                            <h4>Top Performers</h4>
                            <span className="md-insight-count md-count-green">{topPerformers.length}</span>
                        </div>
                        <div className="md-insight-list">
                            {topPerformers.map((student, idx) => (
                                <div key={student.id || idx} className="md-insight-item" onClick={() => handleViewStudent(student.id)}>
                                    <span className="md-ins-rank">#{idx + 1}</span>
                                    <div className="md-ins-avatar md-avatar-green">{student.fullName?.charAt(0) || 'S'}</div>
                                    <div className="md-ins-info">
                                        <span className="md-ins-name">{student.fullName}</span>
                                        <span className="md-ins-meta">{student.department?.toUpperCase()}</span>
                                    </div>
                                    <span className="md-ins-score" style={{ color: '#10b981' }}>{student.growthScore || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Improvement Leaders */}
                    <div className="md-insight-panel md-insight-improve">
                        <div className="md-insight-head">
                            <Sparkles size={15} />
                            <h4>Most Improved</h4>
                            <span className="md-insight-count md-count-blue">{stats.improving}</span>
                        </div>
                        {getImprovementLeaders().length > 0 ? (
                            <div className="md-insight-list">
                                {getImprovementLeaders().map((student, idx) => (
                                    <div key={student.id || idx} className="md-insight-item" onClick={() => handleViewStudent(student.id)}>
                                        <div className="md-ins-avatar md-avatar-blue">{student.fullName?.charAt(0) || 'S'}</div>
                                        <div className="md-ins-info">
                                            <span className="md-ins-name">{student.fullName}</span>
                                            <span className="md-ins-meta">{student.department?.toUpperCase()}</span>
                                        </div>
                                        <span className="md-ins-badge-up">+{student.trend}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="md-empty"><span>📈</span><p>No improvement data yet</p></div>
                        )}
                    </div>
                </div>

                {/* Student Table */}
                <div className="md-table-card">
                    <div className="md-table-head">
                        <h3>All Students</h3>
                        <span className="md-table-count">{students.length} students</span>
                    </div>
                    <div className="md-table-wrap">
                        <div className="md-table">
                            <div className="md-thead">
                                <span>Rank</span>
                                <span>Student</span>
                                <span>Department</span>
                                <span>Year</span>
                                <span>Growth Score</span>
                                <span>Trend</span>
                                <span>CGPA</span>
                                <span>ATS Score</span>
                                <span>Courses</span>
                                <span>Status</span>
                                <span>Actions</span>
                            </div>
                            <div className="md-tbody">
                                {students.slice(0, 20).map((student, idx) => {
                                    const trend = calculateTrend(student)
                                    const score = student.growthScore || 0
                                    return (
                                        <div key={student.id || idx} className="md-trow">
                                            <span className="md-cell-rank">
                                                {rankingsMap[student.id]?.rank ? (
                                                    <span className={`md-rank-badge ${rankingsMap[student.id].rank <= 3 ? 'md-rank-top' : ''}`}>
                                                        #{rankingsMap[student.id].rank}
                                                    </span>
                                                ) : '—'}
                                            </span>
                                            <div className="md-cell-student">
                                                <div className="md-tbl-avatar">{student.fullName?.charAt(0) || 'S'}</div>
                                                <div>
                                                    <span className="md-tbl-name">{student.fullName || 'Unknown'}</span>
                                                    <span className="md-tbl-roll">{student.rollNumber || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <span className="md-cell-text">{student.department?.toUpperCase() || 'N/A'}</span>
                                            <span className="md-cell-text">{student.year || 'N/A'}</span>
                                            <div className="md-cell-score">
                                                <div className="md-score-bar-bg">
                                                    <div className="md-score-bar-fill" style={{ width: `${score}%`, background: getScoreColor(score) }}></div>
                                                </div>
                                                <span className="md-score-num" style={{ color: getScoreColor(score) }}>{score}</span>
                                            </div>
                                            <div className="md-cell-trend">
                                                <TrendIndicator value={trend} />
                                            </div>
                                            <span className="md-cell-text">{student.academics?.cgpa?.toFixed(1) || 'N/A'}</span>
                                            <span className="md-cell-text" style={{ color: student.resumeData?.atsScore != null ? (student.resumeData.atsScore >= 75 ? '#10b981' : student.resumeData.atsScore >= 50 ? '#f59e0b' : '#ef4444') : '#475569', fontWeight: student.resumeData?.atsScore != null ? '700' : '400' }}>
                                                {student.resumeData?.atsScore != null ? student.resumeData.atsScore + '/100' : '—'}
                                            </span>
                                            <span className="md-cell-text">
                                                {rankingsMap[student.id]?.courseStats ? (
                                                    <span style={{ color: '#6366f1', fontWeight: 600 }}>
                                                        {rankingsMap[student.id].courseStats.completed}/{rankingsMap[student.id].courseStats.total}
                                                    </span>
                                                ) : '—'}
                                            </span>
                                            <div className="md-cell-status">
                                                <span className={`md-status-dot ${score >= 70 ? 'md-status-green' : score >= 50 ? 'md-status-amber' : 'md-status-red'}`}></span>
                                                <span className="md-status-label">{score >= 70 ? 'Good' : score >= 50 ? 'Average' : 'At Risk'}</span>
                                            </div>
                                            <div className="md-cell-actions">
                                                <button className="md-btn-sm md-btn-view" onClick={() => handleViewStudent(student.id)}>
                                                    <Eye size={13} /> View
                                                </button>
                                                <Link to={`/mentor/feedback?student=${student.id}`}>
                                                    <button className="md-btn-sm md-btn-msg">
                                                        <MessageSquare size={13} />
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    {students.length === 0 && (
                        <div className="md-empty"><span>📚</span><p>No students found.</p></div>
                    )}
                </div>

                {/* Bottom Row: Dept Performance + Skill Gaps */}
                <div className="md-bottom-row">
                    <div className="md-chart-card">
                        <div className="md-chart-head">
                            <div>
                                <h3><GraduationCap size={16} /> Department Performance</h3>
                                <p>Average growth score by department</p>
                            </div>
                        </div>
                        <div className="md-chart-body">
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={getDepartmentData()} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                                    <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={11} width={50} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', fontSize: '0.82rem' }} formatter={(value) => [value, 'Avg Score']} />
                                    <Bar dataKey="avgScore" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="md-chart-card">
                        <div className="md-chart-head">
                            <div>
                                <h3><BookOpen size={16} /> Student Proficiency</h3>
                                <p>Real metrics from student data</p>
                            </div>
                        </div>
                        <div className="md-skills-list">
                            {getSkillProficiency().map((item, idx) => {
                                const pct = item.total > 0 ? Math.round((item.proficient / item.total) * 100) : 0
                                return (
                                    <div key={idx} className="md-skill-item">
                                        <div className="md-skill-header">
                                            <span className="md-skill-name">{item.skill}</span>
                                            <span className="md-skill-pct">{pct}%</span>
                                        </div>
                                        <div className="md-skill-track">
                                            <div className="md-skill-fill" style={{ width: `${pct}%` }}></div>
                                        </div>
                                        <span className="md-skill-count">{item.proficient} of {item.total} students</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Resume ATS Rankings */}
                <div className="md-ats-section">
                    {/* ATS Summary Stats */}
                    {atsLeaderboard.length > 0 && (
                        <div className="md-ats-summary">
                            <div className="md-ats-stat">
                                <div className="md-ats-stat-icon" style={{ background: '#eef2ff', color: '#6366f1' }}><FileText size={20} /></div>
                                <div className="md-ats-stat-body">
                                    <span className="md-ats-stat-val">{atsLeaderboard.length}</span>
                                    <span className="md-ats-stat-lbl">Resumes Analyzed</span>
                                </div>
                            </div>
                            <div className="md-ats-stat">
                                <div className="md-ats-stat-icon" style={{ background: '#ecfdf5', color: '#10b981' }}><TrendingUp size={20} /></div>
                                <div className="md-ats-stat-body">
                                    <span className="md-ats-stat-val">
                                        {Math.round(atsLeaderboard.reduce((s, x) => s + x.atsScore, 0) / atsLeaderboard.length)}
                                    </span>
                                    <span className="md-ats-stat-lbl">Average ATS Score</span>
                                </div>
                            </div>
                            <div className="md-ats-stat">
                                <div className="md-ats-stat-icon" style={{ background: '#fefce8', color: '#f59e0b' }}><Trophy size={20} /></div>
                                <div className="md-ats-stat-body">
                                    <span className="md-ats-stat-val">{atsLeaderboard[0]?.atsScore || 0}</span>
                                    <span className="md-ats-stat-lbl">Top Score</span>
                                </div>
                            </div>
                            <div className="md-ats-stat">
                                <div className="md-ats-stat-icon" style={{ background: '#fef2f2', color: '#ef4444' }}><AlertTriangle size={20} /></div>
                                <div className="md-ats-stat-body">
                                    <span className="md-ats-stat-val">{atsLeaderboard.filter(s => s.atsScore < 50).length}</span>
                                    <span className="md-ats-stat-lbl">Need Improvement</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="md-table-card">
                        <div className="md-table-head">
                            <h3><Trophy size={16} style={{ marginRight: '0.4rem', color: '#f59e0b', verticalAlign: 'middle' }} />Resume ATS Rankings</h3>
                            <span className="md-table-count">{atsLeaderboard.length} students analyzed</span>
                        </div>
                        {atsLoading ? (
                            <div className="md-empty"><span>⏳</span><p>Loading rankings...</p></div>
                        ) : atsLeaderboard.length === 0 ? (
                            <div className="md-empty"><span>📄</span><p>No students have analyzed their resume yet.</p></div>
                        ) : (
                            <div className="md-table-wrap">
                                <div className="md-table">
                                    <div className="md-thead md-thead-ats">
                                        <span>Rank</span>
                                        <span>Student</span>
                                        <span>Department</span>
                                        <span>ATS Score</span>
                                        <span>Formatting</span>
                                        <span>Content</span>
                                        <span>Keywords</span>
                                        <span>Status</span>
                                        <span>Actions</span>
                                    </div>
                                    <div className="md-tbody">
                                        {atsLeaderboard.slice(0, 20).map((s) => {
                                            const atsColor = s.atsScore >= 75 ? '#10b981' : s.atsScore >= 50 ? '#f59e0b' : '#ef4444'
                                            const atsLabel = s.atsScore >= 75 ? 'Excellent' : s.atsScore >= 50 ? 'Good' : s.atsScore >= 35 ? 'Average' : 'Needs Work'
                                            const rankEmoji = s.rank === 1 ? '🥇' : s.rank === 2 ? '🥈' : s.rank === 3 ? '🥉' : '#' + s.rank
                                            return (
                                                <div key={s.id} className="md-trow md-trow-ats" style={{ cursor: 'pointer' }} onClick={() => navigate('/mentor/student/' + s.id)}>
                                                    <span className="md-cell-text" style={{ fontWeight: '700', color: '#f59e0b', fontSize: '1rem' }}>{rankEmoji}</span>
                                                    <div className="md-cell-student">
                                                        <div className="md-tbl-avatar">{s.fullName?.charAt(0) || 'S'}</div>
                                                        <div>
                                                            <span className="md-tbl-name">{s.fullName}</span>
                                                            <span className="md-tbl-roll">{s.rollNumber || '—'}</span>
                                                        </div>
                                                    </div>
                                                    <span className="md-cell-text">{s.department?.toUpperCase() || '—'}</span>
                                                    <div className="md-cell-score">
                                                        <div className="md-score-bar-bg">
                                                            <div className="md-score-bar-fill" style={{ width: s.atsScore + '%', background: atsColor }}></div>
                                                        </div>
                                                        <span className="md-score-num" style={{ color: atsColor, fontWeight: 800 }}>{s.atsScore}</span>
                                                    </div>
                                                    <div className="md-cell-mini-score">
                                                        <div className="md-mini-bar-bg">
                                                            <div className="md-mini-bar-fill" style={{ width: `${s.formattingScore || 0}%`, background: '#6366f1' }}></div>
                                                        </div>
                                                        <span className="md-mini-val">{s.formattingScore != null ? s.formattingScore : '—'}</span>
                                                    </div>
                                                    <div className="md-cell-mini-score">
                                                        <div className="md-mini-bar-bg">
                                                            <div className="md-mini-bar-fill" style={{ width: `${s.contentScore || 0}%`, background: '#8b5cf6' }}></div>
                                                        </div>
                                                        <span className="md-mini-val">{s.contentScore != null ? s.contentScore : '—'}</span>
                                                    </div>
                                                    <div className="md-cell-keywords">
                                                        <span className="md-kw-found">{s.keywordsFound || 0} found</span>
                                                        {s.missingKeywords > 0 && <span className="md-kw-missing">{s.missingKeywords} missing</span>}
                                                    </div>
                                                    <div className="md-cell-status">
                                                        <span className={'md-status-dot ' + (s.atsScore >= 75 ? 'md-status-green' : s.atsScore >= 50 ? 'md-status-amber' : 'md-status-red')}></span>
                                                        <span className="md-status-label">{atsLabel}</span>
                                                    </div>
                                                    <div className="md-cell-actions">
                                                        <button className="md-btn-sm md-btn-view" onClick={(e) => { e.stopPropagation(); navigate('/mentor/student/' + s.id) }}>
                                                            <Eye size={13} /> Details
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </DashboardLayout>
    )
}
