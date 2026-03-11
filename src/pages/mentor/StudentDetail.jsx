import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { userAPI, codingDataAPI, progressAPI, academicsAPI, groqAPI, courseAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import Button from '../../components/ui/Button'
import {
    ArrowLeft,
    Github,
    Linkedin,
    Code2,
    GraduationCap,
    Target,
    MessageSquare,
    TrendingUp,
    RefreshCw,
    ExternalLink,
    Award,
    Trophy,
    Activity,
    BookOpen,
    User,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Hash,
    Star,
    Zap,
    BarChart3,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Flame,
    FileText,
    Shield,
    Download
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar
} from 'recharts'
import FeedbackModal from '../../components/mentor/FeedbackModal'
import './StudentDetail.css'

export default function StudentDetail() {
    const { id } = useParams()
    const [student, setStudent] = useState(null)
    const [platformData, setPlatformData] = useState(null)
    const [academicData, setAcademicData] = useState(null)
    const [progressHistory, setProgressHistory] = useState([])
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [showFeedbackModal, setShowFeedbackModal] = useState(false)
    const [courseData, setCourseData] = useState([])
    const [growthBreakdown, setGrowthBreakdown] = useState(null)
    const [rankInfo, setRankInfo] = useState(null)

    useEffect(() => {
        if (id) loadStudent()
    }, [id])

    const loadStudent = async () => {
        setLoading(true)
        try {
            const data = await userAPI.getUser(id)
            if (data) {
                setStudent(data)
                try {
                    const codingData = await codingDataAPI.get(id)
                    if (codingData) {
                        setPlatformData({
                            github: codingData.github,
                            leetcode: codingData.leetcode,
                            hackerrank: codingData.hackerrank
                        })
                    }
                } catch (e) { console.log('Coding data not available') }

                try {
                    const acadRes = await academicsAPI.getData(id)
                    if (acadRes?.data) setAcademicData(acadRes.data)
                } catch (e) { console.log('Academic data not available') }

                try {
                    const history = await progressAPI.getHistory(id, 30)
                    setProgressHistory(history || [])
                } catch (e) { console.log('Progress history not available') }

                try {
                    const courses = await courseAPI.getStudentCourses(id)
                    setCourseData(courses || [])
                } catch (e) { console.log('Course data not available') }

                try {
                    const bd = await userAPI.getGrowthBreakdown(id)
                    if (bd) {
                        setGrowthBreakdown(bd.breakdown)
                        setRankInfo({ rank: bd.rank, deptRank: bd.deptRank, totalStudents: bd.totalStudents, deptTotal: bd.deptTotal })
                    }
                } catch (e) { console.log('Growth breakdown not available') }
            }
        } catch (error) {
            console.error('Error loading student:', error)
        }
        setLoading(false)
    }

    const syncPlatformData = async () => {
        if (!id) return
        setSyncing(true)
        try {
            const syncResult = await codingDataAPI.syncAll(id)
            setPlatformData({
                github: syncResult.github,
                leetcode: syncResult.leetcode,
                hackerrank: syncResult.hackerrank
            })
            const data = await userAPI.getUser(id)
            if (data) setStudent(data)
        } catch (error) {
            console.error('Error syncing:', error)
        }
        setSyncing(false)
    }

    const growthScore = student?.growthScore || 0
    const cgpa = academicData?.cgpa || student?.academics?.cgpa || 0
    const sgpa = academicData?.sgpa || student?.academics?.sgpa || 0
    const attendance = academicData?.attendance || student?.academics?.attendance || 0
    const totalProblems = platformData?.leetcode?.totalSolved || 0
    const repos = platformData?.github?.publicRepos || 0
    const commits = platformData?.github?.contributions || platformData?.github?.totalCommits || 0
    const followers = platformData?.github?.followers || 0
    const stars = platformData?.github?.totalStars || 0
    const hrBadges = platformData?.hackerrank?.badges || 0
    const hrSolved = platformData?.hackerrank?.solvedChallenges || 0

    const getGrowthData = () => {
        if (progressHistory.length > 0) {
            return progressHistory.slice(-7).map(h => ({
                date: new Date(h.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: h.growthScore || 0
            }))
        }
        return [
            { date: 'Sep', score: Math.max(0, growthScore - 30) },
            { date: 'Oct', score: Math.max(0, growthScore - 22) },
            { date: 'Nov', score: Math.max(0, growthScore - 15) },
            { date: 'Dec', score: Math.max(0, growthScore - 8) },
            { date: 'Jan', score: Math.max(0, growthScore - 3) },
            { date: 'Feb', score: growthScore },
        ]
    }

    const getLeetCodeBreakdown = () => {
        const lc = platformData?.leetcode || {}
        return [
            { name: 'Easy', value: lc.easySolved || 0, color: '#10b981' },
            { name: 'Medium', value: lc.mediumSolved || 0, color: '#f59e0b' },
            { name: 'Hard', value: lc.hardSolved || 0, color: '#ef4444' }
        ].filter(d => d.value > 0)
    }

    const getSkillsData = () => {
        return [
            { skill: 'DSA', value: Math.min(100, Math.round(totalProblems / 2.5)), fullMark: 100 },
            { skill: 'Projects', value: Math.min(100, repos * 8), fullMark: 100 },
            { skill: 'Git Skills', value: Math.min(100, commits * 2 + repos * 4), fullMark: 100 },
            { skill: 'Certifications', value: Math.min(100, hrBadges * 10), fullMark: 100 },
            { skill: 'Academics', value: Math.min(100, cgpa * 10), fullMark: 100 },
        ]
    }

    const getCodingActivityData = () => [
        { name: 'LeetCode', value: totalProblems, color: '#f59e0b' },
        { name: 'GitHub', value: repos, color: '#1e293b' },
        { name: 'HackerRank', value: hrSolved, color: '#10b981' },
    ]

    const getScoreLevel = (score) => {
        if (score >= 80) return { label: 'Excellent', color: '#10b981', bg: '#ecfdf5' }
        if (score >= 60) return { label: 'Good', color: '#3b82f6', bg: '#eff6ff' }
        if (score >= 40) return { label: 'Average', color: '#f59e0b', bg: '#fffbeb' }
        return { label: 'Needs Improvement', color: '#ef4444', bg: '#fef2f2' }
    }

    const scoreLevel = getScoreLevel(growthScore)

    if (loading) {
        return (
            <DashboardLayout role="mentor">
                <div className="sd-loading">
                    <div className="sd-loading-spinner">
                        <RefreshCw className="spin" size={28} />
                    </div>
                    <p>Loading student profile...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!student) {
        return (
            <DashboardLayout role="mentor">
                <div className="sd-not-found">
                    <User size={48} />
                    <h2>Student Not Found</h2>
                    <p>The student you're looking for doesn't exist or has been removed.</p>
                    <Link to="/mentor/dashboard">
                        <Button variant="primary">Back to Dashboard</Button>
                    </Link>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="mentor">
            <div className="sd-page">

                {/* Top Bar */}
                <div className="sd-topbar">
                    <Link to="/mentor/dashboard" className="sd-back">
                        <ArrowLeft size={16} />
                        <span>Dashboard</span>
                    </Link>
                    <div className="sd-topbar-actions">
                        <button className="sd-btn sd-btn-outline" onClick={syncPlatformData} disabled={syncing}>
                            <RefreshCw size={15} className={syncing ? 'spin' : ''} />
                            {syncing ? 'Syncing...' : 'Sync Data'}
                        </button>
                        <button className="sd-btn sd-btn-primary" onClick={() => setShowFeedbackModal(true)}>
                            <MessageSquare size={15} />
                            Give Feedback
                        </button>
                    </div>
                </div>

                {/* Hero Profile */}
                <div className="sd-hero">
                    <div className="sd-hero-bg"></div>
                    <div className="sd-hero-content">
                        <div className="sd-hero-left">
                            <div className="sd-avatar">
                                <span>{student.fullName?.charAt(0) || 'S'}</span>
                            </div>
                            <div className="sd-hero-info">
                                <h1 className="sd-name">{student.fullName || 'Unknown Student'}</h1>
                                <p className="sd-subtitle">
                                    {student.rollNumber || 'N/A'} &bull; {student.department?.toUpperCase() || 'N/A'} &bull; Year {student.year || 'N/A'}
                                </p>
                                <p className="sd-email">{student.email}</p>
                            </div>
                        </div>
                        <div className="sd-hero-right">
                            <div className="sd-score-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" className="sd-ring-bg" />
                                    <circle cx="50" cy="50" r="42" className="sd-ring-fill"
                                        style={{
                                            strokeDasharray: `${growthScore * 2.64} 264`,
                                            stroke: scoreLevel.color
                                        }}
                                    />
                                </svg>
                                <div className="sd-score-inner">
                                    <span className="sd-score-value">{growthScore}</span>
                                    <span className="sd-score-label">Growth</span>
                                </div>
                            </div>
                            <div className="sd-hero-links">
                                {student.codingProfiles?.github && (
                                    <a href={`https://github.com/${student.codingProfiles.github}`} target="_blank" rel="noopener noreferrer" className="sd-social-link" title="GitHub">
                                        <Github size={18} />
                                    </a>
                                )}
                                {student.codingProfiles?.leetcode && (
                                    <a href={`https://leetcode.com/u/${student.codingProfiles.leetcode}`} target="_blank" rel="noopener noreferrer" className="sd-social-link" title="LeetCode">
                                        <Code2 size={18} />
                                    </a>
                                )}
                                {student.codingProfiles?.hackerrank && (
                                    <a href={`https://www.hackerrank.com/profile/${student.codingProfiles.hackerrank}`} target="_blank" rel="noopener noreferrer" className="sd-social-link" title="HackerRank">
                                        <Award size={18} />
                                    </a>
                                )}
                                {student.codingProfiles?.linkedin && (
                                    <a href={student.codingProfiles.linkedin} target="_blank" rel="noopener noreferrer" className="sd-social-link" title="LinkedIn">
                                        <Linkedin size={18} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metric Cards Row */}
                <div className="sd-metrics">
                    <div className="sd-metric-card sd-metric-blue">
                        <div className="sd-metric-icon"><TrendingUp size={20} /></div>
                        <div className="sd-metric-data">
                            <span className="sd-metric-value">{growthScore}</span>
                            <span className="sd-metric-label">Growth Score</span>
                        </div>
                        <div className="sd-metric-badge" style={{ background: scoreLevel.bg, color: scoreLevel.color }}>
                            {scoreLevel.label}
                        </div>
                    </div>
                    <div className="sd-metric-card sd-metric-amber">
                        <div className="sd-metric-icon"><Code2 size={20} /></div>
                        <div className="sd-metric-data">
                            <span className="sd-metric-value">{totalProblems}</span>
                            <span className="sd-metric-label">Problems Solved</span>
                        </div>
                        <div className="sd-metric-sub">{platformData?.leetcode?.hardSolved || 0} Hard</div>
                    </div>
                    <div className="sd-metric-card sd-metric-dark">
                        <div className="sd-metric-icon"><Github size={20} /></div>
                        <div className="sd-metric-data">
                            <span className="sd-metric-value">{repos}</span>
                            <span className="sd-metric-label">Repositories</span>
                        </div>
                        <div className="sd-metric-sub">{followers} followers &bull; {stars} stars</div>
                    </div>
                    <div className="sd-metric-card sd-metric-green">
                        <div className="sd-metric-icon"><GraduationCap size={20} /></div>
                        <div className="sd-metric-data">
                            <span className="sd-metric-value">{cgpa.toFixed(1)}</span>
                            <span className="sd-metric-label">CGPA</span>
                        </div>
                        <div className="sd-metric-sub">SGPA: {sgpa.toFixed(1)}</div>
                    </div>
                    <div className="sd-metric-card sd-metric-purple">
                        <div className="sd-metric-icon"><Award size={20} /></div>
                        <div className="sd-metric-data">
                            <span className="sd-metric-value">{hrBadges}</span>
                            <span className="sd-metric-label">Badges</span>
                        </div>
                        <div className="sd-metric-sub">{hrSolved} solved</div>
                    </div>
                    <div className="sd-metric-card sd-metric-teal">
                        <div className="sd-metric-icon"><Calendar size={20} /></div>
                        <div className="sd-metric-data">
                            <span className="sd-metric-value">{attendance}%</span>
                            <span className="sd-metric-label">Attendance</span>
                        </div>
                        {attendance < 75 && <div className="sd-metric-warn">⚠ Low</div>}
                    </div>
                    <div className="sd-metric-card sd-metric-indigo">
                        <div className="sd-metric-icon"><FileText size={20} /></div>
                        <div className="sd-metric-data">
                            <span className="sd-metric-value">
                                {student.resumeData?.atsScore != null ? student.resumeData.atsScore : '—'}
                            </span>
                            <span className="sd-metric-label">Resume ATS</span>
                        </div>
                        {student.resumeData?.atsScore != null && (
                            <div className="sd-metric-badge" style={{ background: student.resumeData.atsScore >= 75 ? '#ecfdf5' : student.resumeData.atsScore >= 50 ? '#fffbeb' : '#fef2f2', color: student.resumeData.atsScore >= 75 ? '#10b981' : student.resumeData.atsScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                                {student.resumeData.atsScore >= 75 ? 'Excellent' : student.resumeData.atsScore >= 50 ? 'Good' : 'Needs Work'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="sd-grid-main">

                    {/* Left Column */}
                    <div className="sd-col-left">

                        {/* Student Details Panel */}
                        <div className="sd-panel">
                            <div className="sd-panel-header">
                                <User size={16} />
                                <h3>Student Profile</h3>
                            </div>
                            <div className="sd-detail-list">
                                <div className="sd-detail-row">
                                    <span className="sd-detail-label"><Hash size={13} /> Roll Number</span>
                                    <span className="sd-detail-value">{student.rollNumber || 'N/A'}</span>
                                </div>
                                <div className="sd-detail-row">
                                    <span className="sd-detail-label"><MapPin size={13} /> Department</span>
                                    <span className="sd-detail-value">{student.department?.toUpperCase() || 'N/A'}</span>
                                </div>
                                <div className="sd-detail-row">
                                    <span className="sd-detail-label"><Calendar size={13} /> Year / Sem</span>
                                    <span className="sd-detail-value">Year {student.year || 'N/A'} / Sem {academicData?.semester || student?.semester || '4'}</span>
                                </div>
                                <div className="sd-detail-row">
                                    <span className="sd-detail-label"><Shield size={13} /> Section</span>
                                    <span className="sd-detail-value">{student.section || 'A'}</span>
                                </div>
                                <div className="sd-detail-row">
                                    <span className="sd-detail-label"><Mail size={13} /> Email</span>
                                    <span className="sd-detail-value sd-detail-small">{student.email || 'N/A'}</span>
                                </div>
                                <div className="sd-detail-row">
                                    <span className="sd-detail-label"><Phone size={13} /> Phone</span>
                                    <span className="sd-detail-value">{student.phone || 'Not provided'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Academic Performance Panel */}
                        <div className="sd-panel">
                            <div className="sd-panel-header">
                                <GraduationCap size={16} />
                                <h3>Academic Performance</h3>
                            </div>
                            <div className="sd-academic-scores">
                                <div className="sd-gpa-ring-container">
                                    <div className="sd-gpa-ring" style={{ borderColor: cgpa >= 8 ? '#10b981' : cgpa >= 7 ? '#f59e0b' : '#ef4444' }}>
                                        <span className="sd-gpa-val">{cgpa.toFixed(2)}</span>
                                        <span className="sd-gpa-lbl">CGPA</span>
                                    </div>
                                    <div className="sd-gpa-ring" style={{ borderColor: sgpa >= 8 ? '#10b981' : sgpa >= 7 ? '#f59e0b' : '#ef4444' }}>
                                        <span className="sd-gpa-val">{sgpa.toFixed(2)}</span>
                                        <span className="sd-gpa-lbl">SGPA</span>
                                    </div>
                                </div>
                                <div className="sd-attendance-bar">
                                    <div className="sd-att-header">
                                        <span>Attendance</span>
                                        <span className={attendance < 75 ? 'sd-att-warn' : 'sd-att-ok'}>{attendance}%</span>
                                    </div>
                                    <div className="sd-att-track">
                                        <div className="sd-att-fill" style={{
                                            width: `${Math.min(attendance, 100)}%`,
                                            background: attendance >= 75 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)'
                                        }}></div>
                                    </div>
                                    {attendance < 75 && <span className="sd-att-warning">⚠ Below 75% minimum requirement</span>}
                                </div>
                            </div>
                            <div className="sd-academic-extra">
                                <div className="sd-extra-item">
                                    <span className="sd-extra-val">{academicData?.semester || student?.semester || '4'}</span>
                                    <span className="sd-extra-lbl">Semester</span>
                                </div>
                                <div className="sd-extra-item">
                                    <span className="sd-extra-val" style={{ color: (academicData?.backlogs || 0) > 0 ? '#ef4444' : '#10b981' }}>{academicData?.backlogs || student?.backlogs || 0}</span>
                                    <span className="sd-extra-lbl">Backlogs</span>
                                </div>
                                <div className="sd-extra-item">
                                    <span className="sd-extra-val">{academicData?.totalCredits || '120'}</span>
                                    <span className="sd-extra-lbl">Credits</span>
                                </div>
                                <div className="sd-extra-item">
                                    <span className="sd-extra-val">{academicData?.subjects?.length || '6'}</span>
                                    <span className="sd-extra-lbl">Subjects</span>
                                </div>
                            </div>
                        </div>

                        {/* Coding Profiles Panel */}
                        <div className="sd-panel">
                            <div className="sd-panel-header">
                                <Code2 size={16} />
                                <h3>Coding Profiles</h3>
                            </div>
                            <div className="sd-profiles-list">
                                <div className="sd-profile-item sd-profile-github">
                                    <div className="sd-profile-icon"><Github size={18} /></div>
                                    <div className="sd-profile-info">
                                        <span className="sd-profile-name">GitHub</span>
                                        <span className="sd-profile-user">{student.codingProfiles?.github || 'Not linked'}</span>
                                    </div>
                                    <div className="sd-profile-stats">
                                        <span>{repos} repos</span>
                                        <span>{commits} commits</span>
                                    </div>
                                </div>
                                <div className="sd-profile-item sd-profile-leetcode">
                                    <div className="sd-profile-icon"><Code2 size={18} /></div>
                                    <div className="sd-profile-info">
                                        <span className="sd-profile-name">LeetCode</span>
                                        <span className="sd-profile-user">{student.codingProfiles?.leetcode || 'Not linked'}</span>
                                    </div>
                                    <div className="sd-profile-stats">
                                        <span>{totalProblems} solved</span>
                                        <span>#{platformData?.leetcode?.ranking?.toLocaleString() || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="sd-profile-item sd-profile-hackerrank">
                                    <div className="sd-profile-icon"><Award size={18} /></div>
                                    <div className="sd-profile-info">
                                        <span className="sd-profile-name">HackerRank</span>
                                        <span className="sd-profile-user">{student.codingProfiles?.hackerrank || 'Not linked'}</span>
                                    </div>
                                    <div className="sd-profile-stats">
                                        <span>{hrBadges} badges</span>
                                        <span>{hrSolved} solved</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="sd-col-right">

                        {/* Rank & Growth Breakdown */}
                        {(growthBreakdown || rankInfo) && (
                            <div className="sd-panel sd-breakdown-panel">
                                <div className="sd-panel-header">
                                    <Trophy size={16} />
                                    <h3>Growth Score Breakdown</h3>
                                </div>
                                {rankInfo && (
                                    <div className="sd-rank-row">
                                        <div className="sd-rank-item sd-rank-overall">
                                            <span className="sd-rank-num">#{rankInfo.rank}</span>
                                            <span className="sd-rank-lbl">Overall Rank</span>
                                            <span className="sd-rank-of">of {rankInfo.totalStudents}</span>
                                        </div>
                                        <div className="sd-rank-item sd-rank-dept">
                                            <span className="sd-rank-num">#{rankInfo.deptRank}</span>
                                            <span className="sd-rank-lbl">Dept Rank</span>
                                            <span className="sd-rank-of">of {rankInfo.deptTotal}</span>
                                        </div>
                                    </div>
                                )}
                                {growthBreakdown && (
                                    <div className="sd-breakdown-bars">
                                        {[
                                            { label: 'Coding', value: growthBreakdown.coding, max: 30, color: '#6366f1' },
                                            { label: 'Academics', value: growthBreakdown.academics, max: 25, color: '#10b981' },
                                            { label: 'Courses', value: growthBreakdown.courses, max: 20, color: '#f59e0b' },
                                            { label: 'Resume', value: growthBreakdown.resume, max: 15, color: '#ec4899' },
                                            { label: 'Consistency', value: growthBreakdown.consistency, max: 10, color: '#8b5cf6' }
                                        ].map(item => (
                                            <div key={item.label} className="sd-bd-row">
                                                <div className="sd-bd-label">
                                                    <span>{item.label}</span>
                                                    <span style={{ color: item.color, fontWeight: 700 }}>{item.value}/{item.max}</span>
                                                </div>
                                                <div className="sd-bd-track">
                                                    <div className="sd-bd-fill" style={{ width: `${(item.value / item.max) * 100}%`, background: item.color }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Growth Trend Chart */}
                        <div className="sd-panel sd-chart-panel">
                            <div className="sd-panel-header">
                                <TrendingUp size={16} />
                                <h3>Growth Trend</h3>
                            </div>
                            <div className="sd-chart-container">
                                <ResponsiveContainer width="100%" height={220}>
                                    <AreaChart data={getGrowthData()}>
                                        <defs>
                                            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.12)', fontSize: '0.82rem', padding: '10px 14px' }}
                                            labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
                                        />
                                        <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2.5} fill="url(#growthGrad)" dot={{ fill: '#6366f1', strokeWidth: 2, r: 3, stroke: '#fff' }} activeDot={{ r: 5, stroke: '#6366f1', strokeWidth: 2 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Skills & LeetCode Row */}
                        <div className="sd-two-col">
                            <div className="sd-panel sd-chart-panel">
                                <div className="sd-panel-header">
                                    <Target size={16} />
                                    <h3>Skills Overview</h3>
                                </div>
                                <div className="sd-chart-container">
                                    <ResponsiveContainer width="100%" height={220}>
                                        <RadarChart data={getSkillsData()} cx="50%" cy="50%">
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="skill" stroke="#64748b" fontSize={11} fontWeight={500} />
                                            <Radar name="Skills" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 3 }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="sd-panel sd-chart-panel">
                                <div className="sd-panel-header">
                                    <BarChart3 size={16} />
                                    <h3>LeetCode Breakdown</h3>
                                </div>
                                <div className="sd-lc-breakdown">
                                    <div className="sd-lc-donut">
                                        {getLeetCodeBreakdown().length > 0 ? (
                                            <ResponsiveContainer width="100%" height={140}>
                                                <PieChart>
                                                    <Pie data={getLeetCodeBreakdown()} cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} dataKey="value">
                                                        {getLeetCodeBreakdown().map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="sd-no-data">No data</div>
                                        )}
                                    </div>
                                    <div className="sd-lc-stats">
                                        <div className="sd-lc-row">
                                            <span className="sd-lc-dot" style={{ background: '#10b981' }}></span>
                                            <span className="sd-lc-name">Easy</span>
                                            <span className="sd-lc-count">{platformData?.leetcode?.easySolved || 0}</span>
                                        </div>
                                        <div className="sd-lc-row">
                                            <span className="sd-lc-dot" style={{ background: '#f59e0b' }}></span>
                                            <span className="sd-lc-name">Medium</span>
                                            <span className="sd-lc-count">{platformData?.leetcode?.mediumSolved || 0}</span>
                                        </div>
                                        <div className="sd-lc-row">
                                            <span className="sd-lc-dot" style={{ background: '#ef4444' }}></span>
                                            <span className="sd-lc-name">Hard</span>
                                            <span className="sd-lc-count">{platformData?.leetcode?.hardSolved || 0}</span>
                                        </div>
                                        <div className="sd-lc-total">
                                            <span>Total</span>
                                            <strong>{totalProblems}</strong>
                                        </div>
                                    </div>
                                </div>
                                {platformData?.leetcode?.ranking && (
                                    <div className="sd-lc-ranking">
                                        <Trophy size={13} />
                                        Rank #{platformData.leetcode.ranking.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Platform Detail Cards */}
                        <div className="sd-platforms-row">
                            {platformData?.github && (
                                <div className="sd-platform-card">
                                    <div className="sd-platform-head">
                                        <div className="sd-platform-title">
                                            <Github size={16} />
                                            <span>GitHub</span>
                                        </div>
                                        <a href={platformData.github.profileUrl || `https://github.com/${platformData.github.username}`} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                    <div className="sd-platform-grid">
                                        <div className="sd-platform-stat">
                                            <span className="sd-ps-val">{repos}</span>
                                            <span className="sd-ps-lbl">Repos</span>
                                        </div>
                                        <div className="sd-platform-stat">
                                            <span className="sd-ps-val">{commits}</span>
                                            <span className="sd-ps-lbl">Commits</span>
                                        </div>
                                        <div className="sd-platform-stat">
                                            <span className="sd-ps-val">{stars}</span>
                                            <span className="sd-ps-lbl">Stars</span>
                                        </div>
                                        <div className="sd-platform-stat">
                                            <span className="sd-ps-val">{followers}</span>
                                            <span className="sd-ps-lbl">Followers</span>
                                        </div>
                                    </div>
                                    {platformData.github.topLanguages?.length > 0 && (
                                        <div className="sd-platform-footer">
                                            <span className="sd-pf-label">Languages:</span>
                                            <div className="sd-pf-tags">
                                                {platformData.github.topLanguages.slice(0, 4).map((lang, idx) => (
                                                    <span key={idx} className="sd-tag">{lang.language}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {platformData?.hackerrank && (
                                <div className="sd-platform-card">
                                    <div className="sd-platform-head">
                                        <div className="sd-platform-title">
                                            <Award size={16} />
                                            <span>HackerRank</span>
                                        </div>
                                        <a href={platformData.hackerrank.profileUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                    <div className="sd-platform-grid">
                                        <div className="sd-platform-stat">
                                            <span className="sd-ps-val">{hrBadges}</span>
                                            <span className="sd-ps-lbl">Badges</span>
                                        </div>
                                        <div className="sd-platform-stat">
                                            <span className="sd-ps-val">{platformData.hackerrank.certificates || 0}</span>
                                            <span className="sd-ps-lbl">Certs</span>
                                        </div>
                                        <div className="sd-platform-stat">
                                            <span className="sd-ps-val">{hrSolved}</span>
                                            <span className="sd-ps-lbl">Solved</span>
                                        </div>
                                        <div className="sd-platform-stat">
                                            <span className="sd-ps-val sd-gold">{platformData.hackerrank.goldBadges || 0}</span>
                                            <span className="sd-ps-lbl">Gold</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Course Progress Panel */}
                        {courseData.length > 0 && (
                            <div className="sd-panel">
                                <div className="sd-panel-header">
                                    <BookOpen size={16} />
                                    <h3>Course Progress</h3>
                                    <span className="sd-panel-count">{courseData.length} courses</span>
                                </div>
                                <div className="sd-courses-summary">
                                    <div className="sd-cs-stat sd-cs-completed">
                                        <CheckCircle2 size={14} />
                                        <span>{courseData.filter(c => c.studentStatus === 'completed').length}</span>
                                        <span>Completed</span>
                                    </div>
                                    <div className="sd-cs-stat sd-cs-ongoing">
                                        <Clock size={14} />
                                        <span>{courseData.filter(c => c.studentStatus === 'ongoing').length}</span>
                                        <span>Ongoing</span>
                                    </div>
                                    <div className="sd-cs-stat sd-cs-notstarted">
                                        <Target size={14} />
                                        <span>{courseData.filter(c => c.studentStatus === 'not-started').length}</span>
                                        <span>Not Started</span>
                                    </div>
                                </div>
                                <div className="sd-courses-list">
                                    {courseData.map(course => (
                                        <div key={course.id} className={`sd-course-row sd-course-${course.studentStatus}`}>
                                            <div className="sd-course-info">
                                                <span className="sd-course-name">{course.title}</span>
                                                {course.code && <span className="sd-course-code">{course.code}</span>}
                                            </div>
                                            <span className={`sd-course-badge sd-cb-${course.studentStatus}`}>
                                                {course.studentStatus === 'completed' ? 'Completed' :
                                                 course.studentStatus === 'ongoing' ? 'Ongoing' : 'Not Started'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Resume ATS Score Panel */}
                        {student.resumeData?.atsScore != null && (
                            <div className="sd-panel">
                                <div className="sd-panel-header">
                                    <FileText size={16} />
                                    <h3>Resume ATS Score</h3>
                                </div>
                                <div className="sd-ats-body">
                                    <div className="sd-ats-top">
                                        <span className="sd-ats-score" style={{ color: student.resumeData.atsScore >= 75 ? '#10b981' : student.resumeData.atsScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                                            {student.resumeData.atsScore}
                                            <span className="sd-ats-of">/100</span>
                                        </span>
                                        <span className="sd-ats-badge" style={{ background: student.resumeData.atsScore >= 75 ? '#ecfdf5' : student.resumeData.atsScore >= 50 ? '#fffbeb' : '#fef2f2', color: student.resumeData.atsScore >= 75 ? '#10b981' : student.resumeData.atsScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                                            {student.resumeData.atsScore >= 75 ? 'Excellent' : student.resumeData.atsScore >= 50 ? 'Good' : student.resumeData.atsScore >= 35 ? 'Average' : 'Needs Work'}
                                        </span>
                                    </div>
                                    {student.resumeData.formatting && (
                                        <div className="sd-ats-bars">
                                            <div className="sd-ats-bar-item">
                                                <div className="sd-ats-bar-head">
                                                    <span>Formatting</span><span>{student.resumeData.formatting.score}/100</span>
                                                </div>
                                                <div className="sd-ats-bar-track">
                                                    <div className="sd-ats-bar-fill" style={{ width: `${student.resumeData.formatting.score}%`, background: '#6366f1' }}></div>
                                                </div>
                                            </div>
                                            <div className="sd-ats-bar-item">
                                                <div className="sd-ats-bar-head">
                                                    <span>Content</span><span>{student.resumeData.content?.score || 0}/100</span>
                                                </div>
                                                <div className="sd-ats-bar-track">
                                                    <div className="sd-ats-bar-fill" style={{ width: `${student.resumeData.content?.score || 0}%`, background: '#8b5cf6' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {student.resumeData.keywords?.length > 0 && (
                                        <div className="sd-ats-keywords">
                                            <p className="sd-ats-section-label">Keywords Found</p>
                                            <div className="sd-ats-tags">
                                                {student.resumeData.keywords.slice(0, 8).map((kw, i) => (
                                                    <span key={i} className="sd-ats-tag sd-ats-tag-green">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {student.resumeData.missingKeywords?.length > 0 && (
                                        <div className="sd-ats-keywords">
                                            <p className="sd-ats-section-label">Missing Keywords</p>
                                            <div className="sd-ats-tags">
                                                {student.resumeData.missingKeywords.slice(0, 6).map((kw, i) => (
                                                    <span key={i} className="sd-ats-tag sd-ats-tag-red">{kw}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {student.resumeData.suggestions?.length > 0 && (
                                        <div className="sd-ats-suggestions">
                                            <p className="sd-ats-section-label">Top Suggestions</p>
                                            {student.resumeData.suggestions.slice(0, 3).map((sug, i) => (
                                                <div key={i} className="sd-ats-sug-row">
                                                    <AlertTriangle size={12} className="sd-ats-sug-icon" />
                                                    <span>{typeof sug === 'string' ? sug : sug.text || sug.suggestion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {student.resumeData.lastAnalyzed && (
                                        <p className="sd-ats-date">
                                            Last analyzed: {new Date(student.resumeData.lastAnalyzed).toLocaleDateString()}
                                        </p>
                                    )}

                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Mentor Actions Footer */}
                <div className="sd-footer-actions">
                    <div className="sd-footer-left">
                        <MessageSquare size={18} />
                        <div>
                            <h4>Mentor Actions</h4>
                            <p>Provide feedback and track student progress</p>
                        </div>
                    </div>
                    <div className="sd-footer-btns">
                        <button className="sd-btn sd-btn-primary" onClick={() => setShowFeedbackModal(true)}>
                            <MessageSquare size={15} />
                            Send Feedback
                        </button>
                        <button className="sd-btn sd-btn-outline">
                            <FileText size={15} />
                            View History
                        </button>
                        <button className="sd-btn sd-btn-outline">
                            <Activity size={15} />
                            Progress Report
                        </button>
                    </div>
                </div>

                {showFeedbackModal && (
                    <FeedbackModal
                        studentId={id}
                        studentName={student?.fullName}
                        onClose={() => setShowFeedbackModal(false)}
                        onSuccess={() => {
                            // Optionally refresh feedback list if displayed
                            alert('Feedback sent successfully!')
                        }}
                    />
                )}
            </div>
        </DashboardLayout>
    )
}
