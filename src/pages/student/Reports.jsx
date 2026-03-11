import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import { codingDataAPI, academicsAPI, goalsAPI, progressAPI, feedbackAPI } from '../../services/api'
import {
    FileText,
    Download,
    TrendingUp,
    Code2,
    GraduationCap,
    Target,
    MessageSquare,
    RefreshCw,
    Calendar,
    Award
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
    PolarRadiusAxis,
    Radar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'
import './Reports.css'

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                <p className="tooltip-value">
                    {payload[0].name}: <span className="value">{payload[0].value}</span>
                </p>
            </div>
        )
    }
    return null
}

export default function Reports() {
    const { currentUser, userData } = useAuth()
    const [loading, setLoading] = useState(true)
    const [reportData, setReportData] = useState(null)
    const [generatingPDF, setGeneratingPDF] = useState(false)
    const [timeRange, setTimeRange] = useState('30') // 30 days default

    useEffect(() => {
        if (currentUser) {
            fetchReportData()
        }
    }, [currentUser, timeRange])

    const fetchReportData = async () => {
        if (!currentUser) return
        setLoading(true)
        try {
            // Fetch comprehensive data
            const [codingData, academicsRes, goalsData, progressHistory] = await Promise.all([
                codingDataAPI.get(currentUser.uid).catch(() => null),
                academicsAPI.getData(currentUser.uid).catch(() => ({ data: null })),
                goalsAPI.getByStudent(currentUser.uid).catch(() => []),
                progressAPI.getHistory(currentUser.uid, 365).catch(() => []) // Fetch year for heatmap
            ])

            const academics = academicsRes?.data || {}

            // --- Process Growth Trend Data ---
            // Filter for selected range for the main chart
            const filteredHistory = (progressHistory || [])
                .filter(h => {
                    const d = new Date(h.recordDate)
                    const limit = new Date()
                    limit.setDate(limit.getDate() - parseInt(timeRange))
                    return d >= limit
                })
                .map(entry => ({
                    date: new Date(entry.recordDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    score: entry.growthScore || 0,
                    fullDate: new Date(entry.recordDate).toLocaleDateString()
                })).reverse() // Chronological

            // --- Process Heatmap Data ---
            const today = new Date()
            const heatmapData = []
            // Generate last 120 days empty grid
            for (let i = 119; i >= 0; i--) {
                const d = new Date()
                d.setDate(today.getDate() - i)
                const dateStr = d.toISOString().split('T')[0]
                const record = progressHistory?.find(h => h.recordDate === dateStr)

                // Calculate intensity based on activity (leetcode + commits)
                let intensity = 0
                if (record) {
                    const activity = (record.leetcodeTotal || 0) + (record.githubCommits || 0)
                    if (activity > 0) intensity = 1
                    if (activity > 3) intensity = 2
                    if (activity > 6) intensity = 3
                    if (activity > 10) intensity = 4
                }
                heatmapData.push({ date: d, intensity, dateStr })
            }

            // --- Process Skills Radar Data ---
            // Normalize scores to 0-100 scale
            const skillsData = [
                { subject: 'LeetCode', A: Math.min((codingData?.leetcode?.totalSolved || 0) / 5, 100), fullMark: 100 },
                { subject: 'GitHub', A: Math.min((codingData?.github?.contributions || 0) / 10, 100), fullMark: 100 },
                { subject: 'Academics', A: ((academics?.cgpa || 0) / 10) * 100, fullMark: 100 },
                { subject: 'HackerRank', A: Math.min((codingData?.hackerrank?.solvedChallenges || 0) / 20, 100), fullMark: 100 },
                { subject: 'Consistency', A: Math.min(((codingData?.currentStreak || 0) / 30) * 100, 100), fullMark: 100 },
                { subject: 'Projects', A: Math.min(((codingData?.github?.publicRepos || 0) / 5) * 100, 100), fullMark: 100 }
            ]

            // --- Process Problem Distribution Data ---
            const problemDistribution = [
                { name: 'Easy', value: codingData?.leetcode?.easySolved || 0 },
                { name: 'Medium', value: codingData?.leetcode?.mediumSolved || 0 },
                { name: 'Hard', value: codingData?.leetcode?.hardSolved || 0 }
            ]

            // Calculate Metrics
            const totalGoals = goalsData.length
            const completedGoals = goalsData.filter(g => g.status === 'completed').length

            // Processing Badges
            // Mocking badge images if URLs aren't present, or just using Lucide icons
            const badges = []
            if (codingData?.hackerrank?.badges) badges.push({ name: 'HackerRank Badges', count: codingData.hackerrank.badges, icon: 'Award' })
            if (codingData?.hackerrank?.certificates) badges.push({ name: 'Certifications', count: codingData.hackerrank.certificates.length, icon: 'FileText' })
            if (codingData?.leetcode?.ranking < 100000 && codingData?.leetcode?.ranking > 0) badges.push({ name: 'Top Coder', count: '1', icon: 'Trophy' })

            setReportData({
                generatedAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                student: {
                    name: userData?.fullName || 'Student',
                    roll: userData?.rollNumber || 'N/A',
                    dept: userData?.department || 'N/A'
                },
                growth: {
                    currentScore: codingData?.growthScore || userData?.growthScore || 0,
                    history: filteredHistory
                },
                heatmap: heatmapData,
                skills: skillsData,
                problems: problemDistribution,
                badges,
                stats: {
                    cgpa: academics?.cgpa || 0,
                    attendance: academics?.attendance || 0,
                    goalsCompletion: totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0,
                    streak: codingData?.currentStreak || 0
                }
            })

        } catch (error) {
            console.error('Error fetching report data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        setGeneratingPDF(true)
        setTimeout(() => {
            window.print()
            setGeneratingPDF(false)
        }, 500)
    }

    // Chart Colors
    const COLORS = ['#10b981', '#f59e0b', '#ef4444'] // Green (Easy), Amber (Medium), Red (Hard)

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="reports-loading-container">
                    <RefreshCw className="spinning" size={40} />
                    <p>Generating your professional report...</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="student">
            <div className="reports-container">
                {/* Header Section */}
                <div className="reports-header-pro">
                    <div className="header-content">
                        <h1 className="report-title">Performance Analytics</h1>
                        <p className="report-meta">
                            Generated for <span className="highlight">{reportData?.student.name}</span> • {reportData?.generatedAt}
                        </p>
                    </div>
                    <div className="header-actions">
                        <Button variant="ghost" icon={<RefreshCw size={16} />} onClick={fetchReportData}>
                            Refresh
                        </Button>
                        <Button variant="primary" icon={<Download size={16} />} onClick={handlePrint} loading={generatingPDF}>
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="metric-icon"><TrendingUp size={24} /></div>
                        <div className="metric-info">
                            <span className="label">Growth Score</span>
                            <span className="value">{reportData?.growth.currentScore}</span>
                        </div>
                        <div className="metric-trend positive">Based on comprehensive analysis</div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon"><GraduationCap size={24} /></div>
                        <div className="metric-info">
                            <span className="label">CGPA</span>
                            <span className="value">{reportData?.stats.cgpa?.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon"><Target size={24} /></div>
                        <div className="metric-info">
                            <span className="label">Goals Achieved</span>
                            <span className="value">{reportData?.stats.goalsCompletion}%</span>
                        </div>
                    </div>

                    <div className="metric-card">
                        <div className="metric-icon"><Award size={24} /></div>
                        <div className="metric-info">
                            <span className="label">Active Streak</span>
                            <span className="value">{reportData?.stats.streak} Days</span>
                        </div>
                    </div>
                </div>

                <div className="charts-layout">
                    {/* Growth Trend Chart (Main Feature) */}
                    <Card className="chart-card wide">
                        <CardHeader>
                            <CardTitle icon={<TrendingUp size={20} />}>Growth Trajectory</CardTitle>
                            <div className="chart-actions">
                                <select
                                    className="chart-select"
                                    value={timeRange}
                                    onChange={(e) => setTimeRange(e.target.value)}
                                >
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 3 Months</option>
                                    <option value="180">Last 6 Months</option>
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="chart-container-large">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={reportData?.growth.history}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#64748b', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            hide={true}
                                            domain={['dataMin - 5', 'dataMax + 5']}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorScore)"
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Consistency Heatmap */}
                    <Card className="chart-card wide">
                        <CardHeader>
                            <CardTitle icon={<Calendar size={20} />}>Consistency Map (Last 4 Months)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="heatmap-container">
                                <div className="heatmap-grid">
                                    {reportData?.heatmap.map((day, i) => (
                                        <div
                                            key={i}
                                            className={`heatmap-cell intensity-${day.intensity}`}
                                            title={`${day.dateStr}: Level ${day.intensity}`}
                                        ></div>
                                    ))}
                                </div>
                                <div className="heatmap-legend">
                                    <span>Less</span>
                                    <div className="heatmap-cell intensity-0"></div>
                                    <div className="heatmap-cell intensity-1"></div>
                                    <div className="heatmap-cell intensity-2"></div>
                                    <div className="heatmap-cell intensity-3"></div>
                                    <div className="heatmap-cell intensity-4"></div>
                                    <span>More</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills Radar */}
                    <Card className="chart-card">
                        <CardHeader>
                            <CardTitle icon={<Code2 size={20} />}>Skills Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="chart-container-medium">
                                <ResponsiveContainer width="100%" height={280}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={reportData?.skills}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name="Skills"
                                            dataKey="A"
                                            stroke="#8b5cf6"
                                            strokeWidth={2}
                                            fill="#8b5cf6"
                                            fillOpacity={0.4}
                                        />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Problem Distribution */}
                    <Card className="chart-card">
                        <CardHeader>
                            <CardTitle icon={<Award size={20} />}>Problem Solving</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="chart-container-medium">
                                <ResponsiveContainer width="100%" height={280}>
                                    <PieChart>
                                        <Pie
                                            data={reportData?.problems}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {reportData?.problems.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value) => <span style={{ color: '#64748b', fontSize: '12px' }}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Achievements Section */}
                    {reportData?.badges.length > 0 && (
                        <Card className="chart-card wide">
                            <CardHeader>
                                <CardTitle icon={<Award size={20} />}>Achievements & Badges</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="achievements-grid">
                                    {reportData.badges.map((badge, idx) => (
                                        <div key={idx} className="achievement-card">
                                            <div className="ach-icon">
                                                <Award size={24} color="#f59e0b" />
                                            </div>
                                            <div className="ach-info">
                                                <span className="ach-count">{badge.count}</span>
                                                <span className="ach-name">{badge.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
