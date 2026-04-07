import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userAPI, codingDataAPI, progressAPI, academicsAPI, goalsAPI, groqAPI, courseAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import StatCard from '../../components/ui/StatCard'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import {
    TrendingUp,
    BookOpen,
    Code2,
    Calendar,
    Target,
    Award,
    ArrowUpRight,
    RefreshCw,
    Github,
    Zap,
    Trophy,
    ArrowUp,
    ArrowDown,
    Minus,
    Activity,
    Star,
    GitCommit,
    Brain,
    CheckCircle,
    Lightbulb,
    AlertCircle
} from 'lucide-react'
import {
    LineChart,
    Line,
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
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts'
import './StudentDashboard.css'

export default function StudentDashboard() {
    const { currentUser, userData } = useAuth()
    const [platformData, setPlatformData] = useState(null)
    const [academicData, setAcademicData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [growthScore, setGrowthScore] = useState(0)
    const [progressHistory, setProgressHistory] = useState([])
    const [weeklyComparison, setWeeklyComparison] = useState(null)
    const [achievements, setAchievements] = useState([])
    const [currentStreak, setCurrentStreak] = useState(0)
    const [longestStreak, setLongestStreak] = useState(0)
    const [monthlyGrowth, setMonthlyGrowth] = useState(null)
    const [growthRate, setGrowthRate] = useState(0)
    const [growthVelocity, setGrowthVelocity] = useState(0)
    const [activityLevel, setActivityLevel] = useState(0)
    const [consistencyScore, setConsistencyScore] = useState(0)
    const [projectedScore, setProjectedScore] = useState(0)
    const [lastSyncTime, setLastSyncTime] = useState(null)
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
    const [dynamicGoals, setDynamicGoals] = useState([])
    const [academicRefreshKey, setAcademicRefreshKey] = useState(0)
    const [aiAnalysis, setAiAnalysis] = useState(null)
    const [aiLoading, setAiLoading] = useState(false)
    const [aiError, setAiError] = useState(null)
    const [resumeData, setResumeData] = useState(userData?.resumeData || null)
    const [atsRank, setAtsRank] = useState(null)
    const [atsTotalRanked, setAtsTotalRanked] = useState(0)
    const [courseStats, setCourseStats] = useState({ completed: 0, total: 0 })
    const [growthBreakdown, setGrowthBreakdown] = useState(null)
    const [overallRank, setOverallRank] = useState(null)
    const [deptRank, setDeptRank] = useState(null)
    const [totalStudents, setTotalStudents] = useState(0)
    const [deptTotal, setDeptTotal] = useState(0)
    const navigate = useNavigate()

    // Load cached data first (fast), then sync in background
    useEffect(() => {
        if (currentUser) {
            loadCachedData()
            loadDynamicGoals()
            loadCourseStats()
            loadGrowthBreakdown()
        } else {
            setLoading(false)
        }
    }, [currentUser])

    // Reload academic data when page becomes visible (user navigates back)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (!document.hidden && currentUser) {
                console.log('👁️ Page became visible - refreshing academic data')
                // Page is visible - reload academic data
                try {
                    const acadRes = await academicsAPI.getData(currentUser.uid)
                    if (acadRes?.data) {
                        setAcademicData(acadRes.data)
                        setAcademicRefreshKey(prev => prev + 1)
                        console.log('✅ Academic data refreshed on visibility change:', acadRes.data)
                    }
                } catch (e) {
                    console.log('Could not refresh academic data')
                }
            }
        }

        // Listen for localStorage changes from Academics page
        const handleStorageChange = async (e) => {
            console.log('📦 Storage change detected:', e.key)
            if (e.key === 'academics_updated' && currentUser) {
                console.log('🔄 Reloading academic data from storage event')
                try {
                    const acadRes = await academicsAPI.getData(currentUser.uid)
                    if (acadRes?.data) {
                        setAcademicData(acadRes.data)
                        setAcademicRefreshKey(prev => prev + 1)
                        console.log('✅ Academic data loaded:', acadRes.data)
                    }
                } catch (e) {
                    console.log('Could not refresh academic data')
                }
            }
        }

        // Listen for custom event from Academics page (same tab)
        const handleAcademicsUpdate = async (e) => {
            console.log('📚 Academic update event received:', e.detail)
            if (e.detail && currentUser) {
                setAcademicData(e.detail)
                setAcademicRefreshKey(prev => prev + 1)
                console.log('✅ Academic data state updated:', e.detail)

                // Force re-render by also reloading from API to ensure consistency
                try {
                    const acadRes = await academicsAPI.getData(currentUser.uid)
                    if (acadRes?.data) {
                        setAcademicData(acadRes.data)
                        setAcademicRefreshKey(prev => prev + 1)
                        console.log('✅ Academic data refreshed from API:', acadRes.data)
                    }
                } catch (e) {
                    console.log('Could not refresh academic data from API')
                }
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        window.addEventListener('focus', handleVisibilityChange)
        window.addEventListener('storage', handleStorageChange)
        window.addEventListener('academicsUpdated', handleAcademicsUpdate)

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange)
            window.removeEventListener('focus', handleVisibilityChange)
            window.removeEventListener('storage', handleStorageChange)
            window.removeEventListener('academicsUpdated', handleAcademicsUpdate)
        }
    }, [currentUser])

    // Auto-refresh data every 5 minutes
    useEffect(() => {
        if (!currentUser || !autoRefreshEnabled) return

        const refreshInterval = setInterval(() => {
            console.log('Auto-refreshing dashboard data...')
            syncDataInBackground()
            // Refresh academic data on auto-refresh
            academicsAPI.getData(currentUser.uid).then(acadRes => {
                if (acadRes?.data) {
                    setAcademicData(acadRes.data)
                    setAcademicRefreshKey(prev => prev + 1)
                    console.log('✅ Academic data auto-refreshed')
                }
            }).catch(e => console.log('Academic auto-refresh skipped'))
        }, 5 * 60 * 1000) // 5 minutes

        return () => clearInterval(refreshInterval)
    }, [currentUser, autoRefreshEnabled])

    // Listen for academic data updates from Academics page
    useEffect(() => {
        if (!currentUser) return

        const handleAcademicsUpdate = (e) => {
            console.log('📡 Received academicsUpdated event, refreshing dashboard...')
            // If event has detail data, use it directly
            if (e.detail) {
                setAcademicData(e.detail)
                setAcademicRefreshKey(prev => prev + 1)
            } else {
                // Otherwise fetch fresh data
                academicsAPI.getData(currentUser.uid).then(acadRes => {
                    if (acadRes?.data) {
                        setAcademicData(acadRes.data)
                        setAcademicRefreshKey(prev => prev + 1)
                        console.log('✅ Academic data refreshed from event')
                    }
                }).catch(e => console.log('Academic refresh from event failed'))
            }
        }

        // Listen for same-tab custom event
        window.addEventListener('academicsUpdated', handleAcademicsUpdate)

        // Listen for cross-tab localStorage changes
        const handleStorage = (e) => {
            if (e.key === 'academics_updated') {
                console.log('📡 Cross-tab academic update detected')
                academicsAPI.getData(currentUser.uid).then(acadRes => {
                    if (acadRes?.data) {
                        setAcademicData(acadRes.data)
                        setAcademicRefreshKey(prev => prev + 1)
                    }
                }).catch(err => console.log('Cross-tab refresh failed'))
            }
        }
        window.addEventListener('storage', handleStorage)

        return () => {
            window.removeEventListener('academicsUpdated', handleAcademicsUpdate)
            window.removeEventListener('storage', handleStorage)
        }
    }, [currentUser])

    // Calculate achievements, streaks, and growth metrics
    useEffect(() => {
        if (platformData) {
            calculateAchievements()
            calculateStreaks()
            calculateGrowthMetrics()
        }
    }, [platformData, academicData, progressHistory])

    // Auto-trigger AI analysis when data is loaded
    useEffect(() => {
        if (platformData && !aiAnalysis && !aiLoading) {
            loadAIAnalysis()
        }
    }, [platformData])

    // Load cached data instantly
    const loadCachedData = async () => {
        try {
            // Load cached platform data first (instant)
            const cachedData = await codingDataAPI.get(currentUser.uid)
            if (cachedData) {
                setPlatformData({
                    github: cachedData.github,
                    leetcode: cachedData.leetcode,
                    hackerrank: cachedData.hackerrank
                })
                setGrowthScore(cachedData.growthScore || userData?.growthScore || 0)
            }

            // Load academic data
            try {
                const acadRes = await academicsAPI.getData(currentUser.uid)
                if (acadRes?.data) {
                    setAcademicData(acadRes.data)
                }
            } catch (e) {
                console.log('Academic data not available')
            }

            // Load resume data (ATS score) + rank
            try {
                const userFull = await userAPI.getUser(currentUser.uid)
                if (userFull?.resumeData) setResumeData(userFull.resumeData)
                // Fetch ATS leaderboard to find this student's rank
                try {
                    const lb = await groqAPI.getResumeLeaderboard()
                    if (lb?.leaderboard) {
                        setAtsTotalRanked(lb.leaderboard.length)
                        const me = lb.leaderboard.find(s => s.id === currentUser.uid)
                        if (me) setAtsRank(me.rank)
                    }
                } catch (_) {}
            } catch (e) {
                console.log('Resume data not available')
            }

            // Load progress history
            try {
                const history = await progressAPI.getHistory(currentUser.uid, 30)
                console.log('📊 Progress history loaded:', history?.length || 0, 'records')
                if (history && history.length > 0) {
                    console.log('Sample record:', JSON.stringify(history[0], null, 2))
                }
                setProgressHistory(history || [])
            } catch (e) {
                console.log('Progress history not available:', e.message)
            }

            // Load weekly comparison
            try {
                const comparison = await progressAPI.getWeeklyComparison(currentUser.uid)
                setWeeklyComparison(comparison)
            } catch (e) {
                console.log('Weekly comparison not available')
            }

            setLoading(false)

            // Sync fresh data in the background (non-blocking) - always try
            syncDataInBackground()
        } catch (error) {
            console.error('Error loading cached data:', error)
            setLoading(false)
        }
    }

    // Load dynamic goals from API
    const loadDynamicGoals = async () => {
        try {
            const goalsData = await goalsAPI.getByStudent(currentUser.uid)
            const activeGoals = goalsData.filter(g => g.status !== 'completed')
            setDynamicGoals(activeGoals.slice(0, 4)) // Top 4 active goals
        } catch (error) {
            console.log('Goals not available')
            setDynamicGoals([])
        }
    }

    // Load course completion stats
    const loadCourseStats = async () => {
        try {
            const courses = await courseAPI.getStudentCourses(currentUser.uid)
            if (Array.isArray(courses)) {
                const completed = courses.filter(c => c.studentStatus === 'completed').length
                setCourseStats({ completed, total: courses.length })
            }
        } catch (e) {
            console.log('Course stats not available')
        }
    }

    // Load growth breakdown + rank
    const loadGrowthBreakdown = async () => {
        try {
            const data = await userAPI.getGrowthBreakdown(currentUser.uid)
            if (data) {
                setGrowthBreakdown(data.breakdown)
                setOverallRank(data.rank)
                setDeptRank(data.deptRank)
                setTotalStudents(data.totalStudents)
                setDeptTotal(data.deptTotal)
                if (data.score) setGrowthScore(data.score)
                if (data.courseStats) setCourseStats(data.courseStats)
            }
        } catch (e) {
            console.log('Growth breakdown not available')
        }
    }

    // Background sync (doesn't block UI)
    const syncDataInBackground = async () => {
        setSyncing(true)
        try {
            const syncResult = await codingDataAPI.syncAll(currentUser.uid)
            // Only update with non-null results to avoid wiping cached data
            setPlatformData(prev => ({
                github: syncResult.github || prev.github,
                leetcode: syncResult.leetcode || prev.leetcode,
                hackerrank: syncResult.hackerrank || prev.hackerrank
            }))
            setGrowthScore(syncResult.growthScore || 0)

            // Update history after sync
            const history = await progressAPI.getHistory(currentUser.uid, 30)
            setProgressHistory(history || [])

            const comparison = await progressAPI.getWeeklyComparison(currentUser.uid)
            setWeeklyComparison(comparison)

            // Reload goals to update progress
            await loadDynamicGoals()

            // Refresh academic data
            try {
                const acadRes = await academicsAPI.getData(currentUser.uid)
                if (acadRes?.data) {
                    setAcademicData(acadRes.data)
                    setAcademicRefreshKey(prev => prev + 1)
                    console.log('✅ Academic data refreshed in background sync')
                }
            } catch (e) {
                console.log('Academic data not available')
            }

            // Update sync time
            setLastSyncTime(new Date())
        } catch (error) {
            console.error('Background sync error:', error)
        }
        setSyncing(false)
    }

    const handleSync = async () => {
        setSyncing(true)
        try {
            if (currentUser && userData?.codingProfiles) {
                const syncResult = await codingDataAPI.syncAll(currentUser.uid)
                // Only update with non-null results to avoid wiping cached data
                setPlatformData(prev => ({
                    github: syncResult.github || prev.github,
                    leetcode: syncResult.leetcode || prev.leetcode,
                    hackerrank: syncResult.hackerrank || prev.hackerrank
                }))
                setGrowthScore(syncResult.growthScore || 0)

                const history = await progressAPI.getHistory(currentUser.uid, 30)
                setProgressHistory(history || [])

                const comparison = await progressAPI.getWeeklyComparison(currentUser.uid)
                setWeeklyComparison(comparison)

                // Refresh academic data too
                const acadRes = await academicsAPI.getData(currentUser.uid)
                if (acadRes?.data) {
                    setAcademicData(acadRes.data)
                    setAcademicRefreshKey(prev => prev + 1)
                    console.log('✅ Academic data refreshed in manual sync')
                }
            }
        } catch (error) {
            console.error('Error syncing:', error)
        }
        setSyncing(false)
    }

    // Generate dynamic growth data from history - ONLY use real data
    const getGrowthData = useCallback(() => {
        if (progressHistory.length > 0) {
            // Use actual historical data - last 7 records
            // Handle both camelCase and snake_case field names from API
            return progressHistory.slice(-7).map(h => ({
                date: new Date(h.recordDate || h.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                score: h.growthScore || h.growth_score || 0,
                problems: h.leetcodeTotal || h.leetcode_total || 0,
                repos: h.githubRepos || h.github_repos || 0,
                commits: h.githubCommits || h.github_commits || 0
            }))
        }

        // No data yet - return empty array (don't generate dummy data)
        return []
    }, [progressHistory])

    // Dynamic LeetCode breakdown
    const getLeetCodeBreakdown = useCallback(() => {
        const lc = platformData?.leetcode || {}
        return [
            { name: 'Easy', value: lc.easySolved || 0, color: '#22c55e' },
            { name: 'Medium', value: lc.mediumSolved || 0, color: '#f59e0b' },
            { name: 'Hard', value: lc.hardSolved || 0, color: '#ef4444' }
        ].filter(d => d.value > 0)
    }, [platformData])

    // Dynamic skills radar based on real data
    const getSkillsData = useCallback(() => {
        const totalProblems = platformData?.leetcode?.totalSolved || 0
        const repos = platformData?.github?.publicRepos || 0
        const commits = platformData?.github?.totalCommits || platformData?.github?.contributions || platformData?.github?.recentCommits || 0
        const stars = platformData?.github?.totalStars || 0
        const hrBadges = platformData?.hackerrank?.badges || 0
        const cgpa = academicData?.cgpa || userData?.academics?.cgpa || 0

        // Calculate skill values with real data
        const dsaValue = Math.min(100, Math.round(totalProblems / 2.5))
        const projectsValue = Math.min(100, Math.round(repos * 6 + stars * 2))
        const gitValue = Math.min(100, Math.round(commits * 2 + repos * 4))
        const problemSolvingValue = Math.min(100, Math.round(totalProblems / 2 + hrBadges * 5))
        const consistencyValue = Math.min(100, progressHistory.length * 8) // Based on actual history records
        const academicsValue = Math.min(100, Math.round(cgpa * 10))

        return [
            { skill: 'DSA', value: dsaValue, fullMark: 100 },
            { skill: 'Projects', value: projectsValue, fullMark: 100 },
            { skill: 'Git Skills', value: gitValue, fullMark: 100 },
            { skill: 'Problem Solving', value: problemSolvingValue, fullMark: 100 },
            { skill: 'Consistency', value: consistencyValue, fullMark: 100 },
            { skill: 'Academics', value: academicsValue, fullMark: 100 },
        ]
    }, [platformData, academicData, userData, progressHistory])

    // Dynamic HackerRank track chart
    const getHackerRankData = useCallback(() => {
        const hr = platformData?.hackerrank
        if (!hr || !hr.submissionsByTrack) return []

        const tracks = Object.entries(hr.submissionsByTrack)
            .filter(([_, count]) => typeof count === 'number' && count > 0)
            .map(([track, count]) => ({ name: track.replace('_', ' '), value: count }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6)

        return tracks
    }, [platformData])

    // Dynamic commit activity chart - ONLY use real data
    const getCommitActivityData = useCallback(() => {
        if (progressHistory.length > 0) {
            // Handle both camelCase and snake_case field names
            return progressHistory.slice(-14).map(h => ({
                date: new Date(h.recordDate || h.record_date).toLocaleDateString('en-US', { weekday: 'short' }),
                commits: h.githubCommits || h.github_commits || 0
            }))
        }

        // No data yet - return empty array
        return []
    }, [progressHistory])

    // Generate activity heatmap data for last 30 days
    const getActivityHeatmap = useCallback(() => {
        const getLocalDateKey = (dateObj) => {
            const year = dateObj.getFullYear()
            const month = String(dateObj.getMonth() + 1).padStart(2, '0')
            const day = String(dateObj.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        const normalizeDateKey = (recordDate) => {
            if (!recordDate) return null
            if (typeof recordDate === 'string' && recordDate.length >= 10) {
                return recordDate.slice(0, 10)
            }
            return getLocalDateKey(new Date(recordDate))
        }

        // Build per-day coding work from deltas of cumulative totals.
        const dailyWorkMap = {}
        const sortedHistory = [...progressHistory].sort(
            (a, b) => new Date(a.recordDate || a.record_date) - new Date(b.recordDate || b.record_date)
        )

        let prevCommitsTotal = null
        let prevProblemsTotal = null

        sortedHistory.forEach((record) => {
            const dateKey = normalizeDateKey(record.recordDate || record.record_date)
            if (!dateKey) return

            const commitsTotal = record.githubCommits || record.github_commits || 0
            const problemsTotal = record.leetcodeTotal || record.leetcode_total || 0

            let commitsDelta = 0
            let problemsDelta = 0
            if (prevCommitsTotal !== null && prevProblemsTotal !== null) {
                commitsDelta = Math.max(0, commitsTotal - prevCommitsTotal)
                problemsDelta = Math.max(0, problemsTotal - prevProblemsTotal)
            }

            const prevDayWork = dailyWorkMap[dateKey] || { commits: 0, problems: 0 }
            dailyWorkMap[dateKey] = {
                commits: Math.max(prevDayWork.commits, commitsDelta),
                problems: Math.max(prevDayWork.problems, problemsDelta)
            }

            prevCommitsTotal = commitsTotal
            prevProblemsTotal = problemsTotal
        })

        const today = new Date()
        const heatmapData = []

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today)
            date.setDate(date.getDate() - i)

            const dateKey = getLocalDateKey(date)
            const dayWork = dailyWorkMap[dateKey] || { commits: 0, problems: 0 }
            const commits = dayWork.commits
            const problems = dayWork.problems
            const activity = commits + (problems * 2) // Weight problems more

            // Determine intensity level (0-4)
            let level = 0
            if (activity > 20) level = 4
            else if (activity > 10) level = 3
            else if (activity > 5) level = 2
            else if (activity > 0) level = 1

            heatmapData.push({
                date: date,
                dateStr: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                day: date.getDate(),
                weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
                activity: activity,
                level: level,
                commits: commits,
                problems: problems
            })
        }

        return heatmapData
    }, [progressHistory])

    // Calculate achievements based on milestones
    const calculateAchievements = () => {
        const badges = []
        const lc = platformData?.leetcode || {}
        const gh = platformData?.github || {}
        const hr = platformData?.hackerrank || {}
        const acad = academicData || userData?.academics || {}

        // LeetCode achievements
        if (lc.totalSolved >= 500) badges.push({ icon: '🏆', title: 'LeetCode Master', desc: '500+ problems' })
        else if (lc.totalSolved >= 250) badges.push({ icon: '⭐', title: 'LeetCode Pro', desc: '250+ problems' })
        else if (lc.totalSolved >= 100) badges.push({ icon: '🎯', title: 'Problem Solver', desc: '100+ problems' })

        if (lc.hardSolved >= 50) badges.push({ icon: '💎', title: 'Hard Master', desc: '50 hard problems' })

        // GitHub achievements
        if (gh.publicRepos >= 20) badges.push({ icon: '🚀', title: 'Project Builder', desc: '20+ repositories' })
        else if (gh.publicRepos >= 10) badges.push({ icon: '📦', title: 'Active Developer', desc: '10+ repositories' })

        if (gh.totalStars >= 100) badges.push({ icon: '⭐', title: 'Popular Dev', desc: '100+ stars' })
        if (gh.followers >= 50) badges.push({ icon: '👥', title: 'Influencer', desc: '50+ followers' })

        // Academic achievements
        if (acad.cgpa >= 9.0) badges.push({ icon: '🎓', title: 'Academic Excellence', desc: 'CGPA 9.0+' })
        else if (acad.cgpa >= 8.0) badges.push({ icon: '📚', title: 'Dean\'s List', desc: 'CGPA 8.0+' })

        // HackerRank achievements
        if (hr.badges >= 10) badges.push({ icon: '🏅', title: 'Badge Collector', desc: '10+ badges' })
        if (hr.goldBadges >= 5) badges.push({ icon: '🥇', title: 'Gold Achiever', desc: '5+ gold badges' })

        // Growth achievements
        if (growthScore >= 90) badges.push({ icon: '🔥', title: 'Top Performer', desc: 'Growth Score 90+' })
        else if (growthScore >= 75) badges.push({ icon: '💪', title: 'High Achiever', desc: 'Growth Score 75+' })

        setAchievements(badges)
    }

    // Calculate coding streaks
    const calculateStreaks = () => {
        if (progressHistory.length === 0) {
            setCurrentStreak(0)
            setLongestStreak(0)
            return
        }

        // Helper to get date field
        const getDate = (h) => h.recordDate || h.record_date

        // Sort by date
        const sorted = [...progressHistory].sort((a, b) =>
            new Date(getDate(a)) - new Date(getDate(b))
        )

        let current = 0
        let longest = 0
        let temp = 0

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Calculate current streak
        for (let i = sorted.length - 1; i >= 0; i--) {
            const date = new Date(getDate(sorted[i]))
            date.setHours(0, 0, 0, 0)
            const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24))

            if (diffDays === current) {
                current++
            } else {
                break
            }
        }

        // Calculate longest streak
        for (let i = 1; i < sorted.length; i++) {
            const prevDate = new Date(getDate(sorted[i - 1]))
            const currDate = new Date(getDate(sorted[i]))
            const diff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24))

            if (diff <= 1) {
                temp++
                longest = Math.max(longest, temp)
            } else {
                temp = 1
            }
        }

        setCurrentStreak(current)
        setLongestStreak(Math.max(longest, current))
    }

    // Calculate comprehensive growth metrics
    const calculateGrowthMetrics = () => {
        if (progressHistory.length < 2) {
            setGrowthRate(0)
            setGrowthVelocity(0)
            setActivityLevel(0)
            setConsistencyScore(0)
            setProjectedScore(growthScore)
            return
        }

        // Helper to get field value (handles both camelCase and snake_case)
        const getField = (h, camelCase, snakeCase) => h[camelCase] || h[snakeCase] || 0

        // Sort history by date
        const sorted = [...progressHistory].sort((a, b) =>
            new Date(getField(a, 'recordDate', 'record_date')) - new Date(getField(b, 'recordDate', 'record_date'))
        )

        // Calculate Growth Rate (percentage change over time)
        const recent = sorted.slice(-7) // Last 7 days
        if (recent.length >= 2) {
            const firstScore = getField(recent[0], 'growthScore', 'growth_score')
            const lastScore = getField(recent[recent.length - 1], 'growthScore', 'growth_score')
            const rate = firstScore > 0 ? ((lastScore - firstScore) / firstScore) * 100 : 0
            setGrowthRate(Math.round(rate * 10) / 10)
        }

        // Calculate Growth Velocity (average daily improvement)
        if (sorted.length >= 2) {
            const firstEntry = sorted[0]
            const lastEntry = sorted[sorted.length - 1]
            const daysDiff = Math.max(1, Math.floor(
                (new Date(getField(lastEntry, 'recordDate', 'record_date')) - new Date(getField(firstEntry, 'recordDate', 'record_date'))) / (1000 * 60 * 60 * 24)
            ))
            const scoreDiff = getField(lastEntry, 'growthScore', 'growth_score') - getField(firstEntry, 'growthScore', 'growth_score')
            const velocity = scoreDiff / daysDiff
            setGrowthVelocity(Math.round(velocity * 10) / 10)
        }

        // Calculate Activity Level (based on commits, problems solved, etc.)
        const recentActivity = sorted.slice(-7)
        const totalCommits = recentActivity.reduce((sum, h) => sum + getField(h, 'githubCommits', 'github_commits'), 0)
        const totalProblems = recentActivity.reduce((sum, h) => sum + getField(h, 'leetcodeTotal', 'leetcode_total'), 0)
        const activityScore = Math.min(100, (totalCommits * 2) + (totalProblems * 3))
        setActivityLevel(Math.round(activityScore))

        // Calculate Consistency Score (how regular the activity is)
        const daysWithActivity = recentActivity.filter(h =>
            getField(h, 'githubCommits', 'github_commits') > 0 || getField(h, 'leetcodeTotal', 'leetcode_total') > 0
        ).length
        const consistency = (daysWithActivity / Math.min(7, recentActivity.length)) * 100
        setConsistencyScore(Math.round(consistency))

        // Project future score based on current velocity
        const currentScore = growthScore || 0
        const daysToProject = 30 // Project 30 days ahead
        const velocityValue = growthVelocity || 0
        const projected = Math.min(100, Math.max(0, currentScore + (velocityValue * daysToProject)))
        setProjectedScore(Math.round(projected))

        // Update last sync time
        setLastSyncTime(new Date())
    }

    const ChangeIndicator = ({ value, suffix = '' }) => {
        if (value === undefined || value === null) return null
        const isPositive = value > 0
        const isZero = value === 0
        return (
            <span className={`change-indicator ${isPositive ? 'positive' : isZero ? 'neutral' : 'negative'}`}>
                {isPositive ? <ArrowUp size={14} /> : isZero ? <Minus size={14} /> : <ArrowDown size={14} />}
                {Math.abs(value)}{suffix}
            </span>
        )
    }

    // Load AI Growth Analysis from Groq
    const loadAIAnalysis = async () => {
        setAiLoading(true)
        setAiError(null)
        try {
            const studentData = {
                growthScore,
                growthVelocity,
                consistencyScore,
                currentStreak,
                longestStreak,
                leetcode: platformData?.leetcode || null,
                github: platformData?.github || null,
                hackerrank: platformData?.hackerrank || null,
                academics: {
                    cgpa: academicData?.cgpa || userData?.academics?.cgpa || 0,
                    sgpa: academicData?.sgpa || userData?.academics?.sgpa || 0,
                    attendance: academicData?.attendance || userData?.academics?.attendance || 0
                },
                achievements
            }
            const result = await groqAPI.analyzeGrowth(studentData)
            setAiAnalysis(result.analysis)
        } catch (error) {
            console.error('AI analysis error:', error)
            setAiError('Could not load AI analysis. Please try again.')
        }
        setAiLoading(false)
    }

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="loading-container">
                    <RefreshCw className="spin" size={32} />
                    <p>Loading your dashboard...</p>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout role="student">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Welcome back, {userData?.fullName?.split(' ')[0] || 'Student'}!</h1>
                    <p className="dashboard-subtitle">Track your growth and stay on top of your learning journey</p>
                </div>
                <div className="dashboard-actions">
                    <button className="sync-btn" onClick={handleSync} disabled={syncing}>
                        <RefreshCw size={18} className={syncing ? 'spin' : ''} />
                        {syncing ? 'Syncing...' : 'Sync Data'}
                    </button>
                    <div className="dashboard-date">
                        <Calendar size={18} />
                        <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    title="Growth Score"
                    value={growthScore.toString()}
                    change={growthRate !== 0 ? `${growthRate > 0 ? '+' : ''}${growthRate}% growth rate` : weeklyComparison?.changes?.growthScore ? `${weeklyComparison.changes.growthScore > 0 ? '+' : ''}${weeklyComparison.changes.growthScore} this week` : 'Track your progress'}
                    changeType={growthRate > 0 ? 'positive' : growthRate < 0 ? 'negative' : 'neutral'}
                    icon={<TrendingUp size={24} />}
                    iconColor="primary"
                />
                <StatCard
                    title="LeetCode Progress"
                    value={(platformData?.leetcode?.totalSolved || 0).toString()}
                    change={weeklyComparison?.changes?.leetcodeTotal ? `+${weeklyComparison.changes.leetcodeTotal} this week` : `${platformData?.leetcode?.hardSolved || 0} Hard solved`}
                    changeType="positive"
                    icon={<Code2 size={24} />}
                    iconColor="accent"
                />
                <StatCard
                    title="GitHub Activity"
                    value={(platformData?.github?.publicRepos || 0).toString()}
                    change={weeklyComparison?.changes?.githubCommits ? `+${weeklyComparison.changes.githubCommits} commits` : `${platformData?.github?.totalCommits || platformData?.github?.contributions || platformData?.github?.recentCommits || 0} commits`}
                    changeType="positive"
                    icon={<Github size={24} />}
                    iconColor="secondary"
                />
                <StatCard
                    key={`academic-stat-${academicRefreshKey}`}
                    title="Academic (CGPA)"
                    value={(academicData?.cgpa || userData?.academics?.cgpa || 0).toFixed(2)}
                    change={`SGPA: ${(academicData?.sgpa || userData?.academics?.sgpa || 0).toFixed(2)}`}
                    changeType="neutral"
                    icon={<BookOpen size={24} />}
                    iconColor="warning"
                />
                <StatCard
                    title="Resume ATS Score"
                    value={resumeData?.atsScore != null ? resumeData.atsScore.toString() : '—'}
                    change={resumeData?.atsScore != null ? `${resumeData.atsScore >= 75 ? 'Excellent' : resumeData.atsScore >= 50 ? 'Good' : 'Needs Work'}${atsRank ? ` · Rank #${atsRank}/${atsTotalRanked}` : ''}` : 'Upload resume'}
                    changeType={resumeData?.atsScore >= 75 ? 'positive' : resumeData?.atsScore >= 50 ? 'neutral' : 'negative'}
                    icon={<Award size={24} />}
                    iconColor="secondary"
                    onClick={() => navigate('/student/resume')}
                    style={{ cursor: 'pointer' }}
                />
                <StatCard
                    title="Courses Completed"
                    value={`${courseStats.completed}/${courseStats.total}`}
                    change={courseStats.total > 0 ? (courseStats.completed === courseStats.total ? 'All completed!' : `${courseStats.total - courseStats.completed} remaining`) : 'No courses assigned'}
                    changeType={courseStats.completed === courseStats.total && courseStats.total > 0 ? 'positive' : 'neutral'}
                    icon={<CheckCircle size={24} />}
                    iconColor="secondary"
                    onClick={() => navigate('/student/academics')}
                    style={{ cursor: 'pointer' }}
                />
            </div>

            {/* Rank & Score Breakdown */}
            {(overallRank || growthBreakdown) && (
                <div className="rank-breakdown-section">
                    {/* Rank Cards */}
                    <div className="rank-cards">
                        {overallRank && (
                            <div className="rank-card rank-card-overall">
                                <div className="rank-badge">
                                    <Trophy size={22} />
                                    <span className="rank-number">#{overallRank}</span>
                                </div>
                                <div className="rank-info">
                                    <span className="rank-title">Overall Rank</span>
                                    <span className="rank-sub">out of {totalStudents} students</span>
                                </div>
                            </div>
                        )}
                        {deptRank && (
                            <div className="rank-card rank-card-dept">
                                <div className="rank-badge">
                                    <Award size={22} />
                                    <span className="rank-number">#{deptRank}</span>
                                </div>
                                <div className="rank-info">
                                    <span className="rank-title">Department Rank</span>
                                    <span className="rank-sub">out of {deptTotal} in {userData?.department?.toUpperCase() || 'dept'}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Score Breakdown */}
                    {growthBreakdown && (
                        <div className="score-breakdown-card">
                            <h3 className="breakdown-title"><Star size={18} /> Growth Score Breakdown</h3>
                            <div className="breakdown-bars">
                                {[
                                    { label: 'Coding', value: growthBreakdown.coding, max: 30, color: '#6366f1', icon: '💻' },
                                    { label: 'Academics', value: growthBreakdown.academics, max: 25, color: '#10b981', icon: '📚' },
                                    { label: 'Courses', value: growthBreakdown.courses, max: 20, color: '#f59e0b', icon: '📋' },
                                    { label: 'Resume', value: growthBreakdown.resume, max: 15, color: '#ec4899', icon: '📄' },
                                    { label: 'Consistency', value: growthBreakdown.consistency, max: 10, color: '#8b5cf6', icon: '🔥' },
                                ].map(item => (
                                    <div key={item.label} className="breakdown-row">
                                        <div className="breakdown-label">
                                            <span className="breakdown-icon">{item.icon}</span>
                                            <span>{item.label}</span>
                                            <span className="breakdown-score">{item.value}/{item.max}</span>
                                        </div>
                                        <div className="breakdown-bar-bg">
                                            <div
                                                className="breakdown-bar-fill"
                                                style={{ width: `${(item.value / item.max) * 100}%`, background: item.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="breakdown-total">
                                <span>Total Score</span>
                                <span className="breakdown-total-value">{growthScore}/100</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Growth Analytics Dashboard */}
            <div className="growth-analytics-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <Activity size={20} className="text-blue-600" />
                        Growth Analytics
                    </h2>
                    <div className="sync-indicator">
                        {lastSyncTime && (
                            <span className="last-sync">
                                Updated: {new Date(lastSyncTime).toLocaleTimeString()}
                            </span>
                        )}
                        {syncing && <Badge variant="primary" size="sm">Syncing...</Badge>}
                    </div>
                </div>

                <div className="growth-metrics-grid-pro">
                    {/* Velocity KPI */}
                    <div className="kpi-card blue">
                        <div className="kpi-icon-wrapper">
                            <Zap size={24} />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Growth Velocity</span>
                            <div className="kpi-value-row">
                                <span className="kpi-value">{growthVelocity}</span>
                                <span className="kpi-unit">pts/day</span>
                            </div>
                            <span className="kpi-subtext">Avg. daily improvement</span>
                        </div>
                    </div>

                    {/* Consistency KPI */}
                    <div className="kpi-card purple">
                        <div className="kpi-icon-wrapper">
                            <Activity size={24} />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Consistency Score</span>
                            <div className="kpi-value-row">
                                <span className="kpi-value">{consistencyScore}%</span>
                            </div>
                            <span className="kpi-subtext">Based on daily activity</span>
                        </div>
                    </div>

                    {/* Projected Score KPI */}
                    <div className="kpi-card pink">
                        <div className="kpi-icon-wrapper">
                            <Target size={24} />
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-label">Projected (30d)</span>
                            <div className="kpi-value-row">
                                <span className="kpi-value">{projectedScore}</span>
                            </div>
                            <span className="metric-sublabel">
                                {projectedScore > growthScore ? `+${projectedScore - growthScore} pts` : 'Maintain pace'}
                            </span>
                        </div>
                        <div className="projection-visual-mini">
                            <div className="projection-bar-bg">
                                <div className="projection-bar-fill" style={{ width: `${Math.min(100, (growthScore / projectedScore) * 100)}%` }}></div>
                            </div>
                            <div className="projection-labels-mini">
                                <span>Now: {growthScore}</span>
                                <span>Goal: {projectedScore}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Growth Insights */}
            <div className="ai-insights-section">
                <Card variant="default" padding="lg" className="ai-insights-card">
                    <CardHeader>
                        <div className="ai-insights-header">
                            <div className="ai-insights-title">
                                <div className="ai-icon-pulse">
                                    <Brain size={22} />
                                </div>
                                <div>
                                    <h3>Growth Analysis</h3>
                                </div>
                            </div>
                            <button
                                className="ai-analyze-btn"
                                onClick={loadAIAnalysis}
                                disabled={aiLoading}
                            >
                                {aiLoading ? (
                                    <><RefreshCw size={16} className="spin" /> Analyzing...</>
                                ) : (
                                    <><RefreshCw size={16} /> Refresh</>
                                )}
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {aiLoading && (
                            <div className="ai-loading">
                                <div className="ai-loading-shimmer"></div>
                                <div className="ai-loading-shimmer short"></div>
                                <div className="ai-loading-shimmer"></div>
                                <div className="ai-loading-shimmer medium"></div>
                                <p className="ai-loading-text">🤖 Analyzing your growth data with AI...</p>
                            </div>
                        )}
                        {aiError && (
                            <div className="ai-error">
                                <span>⚠️ {aiError}</span>
                                <button className="ai-retry-btn" onClick={loadAIAnalysis}>Retry</button>
                            </div>
                        )}
                        {aiAnalysis && !aiLoading && (
                            <div className="ai-visual-dashboard">
                                {/* Score Gauges */}
                                <div className="ai-scores-row">
                                    {[
                                        { label: 'Growth', value: growthScore, color: '#6366f1' },
                                        { label: 'Coding', value: Math.min(100, Math.round(((platformData?.leetcode?.totalSolved || 0) / 300) * 100)), color: '#3b82f6' },
                                        { label: 'Academics', value: Math.round(((academicData?.cgpa || userData?.academics?.cgpa || 0) / 10) * 100), color: '#22c55e' },
                                        { label: 'Consistency', value: consistencyScore, color: '#f59e0b' },
                                        { label: 'Activity', value: Math.min(100, Math.round((((platformData?.github?.totalCommits || platformData?.github?.contributions || platformData?.github?.recentCommits || 0)) / 200) * 100)), color: '#ec4899' }
                                    ].map((g, idx) => {
                                        const r = 34, circ = 2 * Math.PI * r, p = Math.min(g.value, 100)
                                        return (
                                            <div key={idx} className="ai-gauge">
                                                <div className="ai-gauge-ring">
                                                    <svg width="80" height="80" viewBox="0 0 80 80">
                                                        <circle cx="40" cy="40" r={r} fill="none" stroke="#f3f4f6" strokeWidth="5" />
                                                        <circle cx="40" cy="40" r={r} fill="none" stroke={g.color} strokeWidth="5" strokeLinecap="round"
                                                            strokeDasharray={circ} strokeDashoffset={circ - (p / 100) * circ}
                                                            transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset 1s ease' }} />
                                                    </svg>
                                                    <span className="ai-gauge-value">{p}</span>
                                                </div>
                                                <span className="ai-gauge-label">{g.label}</span>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Charts Row: Skill Radar + Effort Pie */}
                                <div className="ai-charts-row">
                                    {aiAnalysis.skillRadar && (
                                        <div className="ai-chart-box">
                                            <h4 className="ai-chart-title">Skill Assessment</h4>
                                            <ResponsiveContainer width="100%" height={240}>
                                                <RadarChart data={aiAnalysis.skillRadar} outerRadius={80}>
                                                    <PolarGrid stroke="#e5e7eb" />
                                                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#6b7280' }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                    <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                    {aiAnalysis.effortDistribution && (
                                        <div className="ai-chart-box">
                                            <h4 className="ai-chart-title">Effort Distribution</h4>
                                            <ResponsiveContainer width="100%" height={240}>
                                                <PieChart>
                                                    <Pie data={aiAnalysis.effortDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value">
                                                        {aiAnalysis.effortDistribution.map((_, i) => (
                                                            <Cell key={i} fill={['#6366f1', '#3b82f6', '#f59e0b', '#22c55e', '#ec4899'][i % 5]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip formatter={(v) => `${v}%`} />
                                                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{v}</span>} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    )}
                                </div>

                                {/* Improvement Areas */}
                                {aiAnalysis.improvements && (
                                    <div className="ai-chart-box full-width">
                                        <h4 className="ai-chart-title">Areas to Improve — Current vs Target</h4>
                                        <ResponsiveContainer width="100%" height={180}>
                                            <BarChart data={aiAnalysis.improvements} layout="vertical" barGap={2}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                                                <YAxis dataKey="area" type="category" width={90} tick={{ fontSize: 11, fill: '#374151' }} />
                                                <Tooltip />
                                                <Bar dataKey="current" name="Current" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} />
                                                <Bar dataKey="target" name="Target" fill="#c7d2fe" radius={[0, 4, 4, 0]} barSize={12} />
                                                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{v}</span>} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Action Plan Strategies */}
                                {aiAnalysis.actionPlan && (
                                    <div className="ai-strategies-section">
                                        <h4 className="ai-chart-title">🚀 Strategic Action Plan</h4>
                                        <div className="ai-strategies-grid">
                                            {aiAnalysis.actionPlan.map((plan, i) => (
                                                <div key={i} className={`ai-strategy-card ${plan.priority.toLowerCase()}`}>
                                                    <div className="ai-strategy-header">
                                                        {plan.type.includes('Soft') ? <Lightbulb size={18} /> : <Zap size={18} />}
                                                        <span className="ai-strategy-type">{plan.type}</span>
                                                    </div>
                                                    <h5 className="ai-strategy-title">{plan.title}</h5>
                                                    <div className="ai-strategy-footer">
                                                        <span className={`ai-priority-badge ${plan.priority.toLowerCase()}`}>
                                                            {plan.priority} Priority
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Weekly Goals */}
                                {aiAnalysis.weeklyGoals && (
                                    <div className="ai-goals-strip">
                                        <h4 className="ai-chart-title">🎯 Weekly Goals</h4>
                                        <div className="ai-goals-list">
                                            {aiAnalysis.weeklyGoals.map((goal, i) => (
                                                <div key={i} className="ai-goal-chip">
                                                    <CheckCircle size={14} />
                                                    <span>{goal}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {!aiAnalysis && !aiLoading && !aiError && (
                            <div className="ai-placeholder">
                                <Brain size={40} className="ai-placeholder-icon" />
                                <p>AI analysis will load automatically with your data.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>




            {/* Weekly Progress Highlight */}
            {
                weeklyComparison && weeklyComparison.changes && (
                    <Card variant="gradient" padding="lg" className="weekly-highlight">
                        <CardContent>
                            <div className="weekly-highlight-header">
                                <div className="weekly-title">
                                    <Activity size={20} />
                                    <span>Your Weekly Progress</span>
                                </div>
                                <Badge variant="primary" size="sm">This Week</Badge>
                            </div>
                            <div className="weekly-stats">
                                <div className="weekly-stat">
                                    <span className="weekly-stat-label">Problems Solved</span>
                                    <div className="weekly-stat-value">
                                        <ChangeIndicator value={weeklyComparison.changes.leetcodeTotal} />
                                    </div>
                                </div>
                                <div className="weekly-stat">
                                    <span className="weekly-stat-label">Git Commits</span>
                                    <div className="weekly-stat-value">
                                        <ChangeIndicator value={weeklyComparison.changes.githubCommits} />
                                    </div>
                                </div>
                                <div className="weekly-stat">
                                    <span className="weekly-stat-label">New Repos</span>
                                    <div className="weekly-stat-value">
                                        <ChangeIndicator value={weeklyComparison.changes.githubRepos} />
                                    </div>
                                </div>
                                <div className="weekly-stat">
                                    <span className="weekly-stat-label">Growth Score</span>
                                    <div className="weekly-stat-value">
                                        <ChangeIndicator value={weeklyComparison.changes.growthScore} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            {/* Achievements and Streaks Row */}
            <div className="achievements-row">
                <Card variant="default" padding="lg" className="achievements-card">
                    <CardHeader>
                        <CardTitle>
                            <Trophy size={20} />
                            Your Achievements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="achievements-grid">
                            {achievements.length > 0 ? (
                                achievements.map((badge, idx) => (
                                    <div key={idx} className="achievement-badge">
                                        <span className="achievement-icon">{badge.icon}</span>
                                        <div className="achievement-info">
                                            <span className="achievement-title">{badge.title}</span>
                                            <span className="achievement-desc">{badge.desc}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-achievements">
                                    <span className="emoji">🎯</span>
                                    <p>Keep coding to unlock achievements!</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card variant="default" padding="lg" className="streaks-card">
                    <CardHeader>
                        <CardTitle>
                            <Zap size={20} />
                            Coding Streak
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="streak-display">
                            <div className="streak-item current-streak">
                                <div className="streak-icon">🔥</div>
                                <div className="streak-info">
                                    <span className="streak-value">{currentStreak}</span>
                                    <span className="streak-label">Current Streak</span>
                                    <span className="streak-desc">Days active</span>
                                </div>
                            </div>
                            <div className="streak-divider"></div>
                            <div className="streak-item longest-streak">
                                <div className="streak-icon">⚡</div>
                                <div className="streak-info">
                                    <span className="streak-value">{longestStreak}</span>
                                    <span className="streak-label">Longest Streak</span>
                                    <span className="streak-desc">Personal best</span>
                                </div>
                            </div>
                        </div>
                        <div className="streak-message">
                            {currentStreak >= 7 ? (
                                <span className="streak-msg success">🎉 Amazing! Keep the momentum!</span>
                            ) : currentStreak >= 3 ? (
                                <span className="streak-msg good">💪 Great work! Stay consistent!</span>
                            ) : (
                                <span className="streak-msg neutral">💡 Start coding daily to build streak!</span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Heatmap */}
            <Card variant="default" padding="lg" className="activity-heatmap-card">
                <CardHeader>
                    <CardTitle>
                        <Calendar size={20} />
                        30-Day Coding Work Heatmap
                    </CardTitle>
                    <Badge variant="secondary" size="sm">Last 30 days</Badge>
                </CardHeader>
                <CardContent>
                    <div className="heatmap-container">
                        <div className="heatmap-grid">
                            {getActivityHeatmap().map((day, idx) => (
                                <div
                                    key={idx}
                                    className={`heatmap-cell level-${day.level}`}
                                    title={`${day.dateStr}: ${day.problems} LeetCode solved, ${day.commits} GitHub commits`}
                                    data-tooltip={`${day.problems} LeetCode solved • ${day.commits} GitHub commits`}
                                >
                                    <span className="heatmap-day">{day.day}</span>
                                </div>
                            ))}
                        </div>
                        <div className="heatmap-legend">
                            <span className="legend-label">Less</span>
                            <div className="legend-cells">
                                <div className="legend-cell level-0"></div>
                                <div className="legend-cell level-1"></div>
                                <div className="legend-cell level-2"></div>
                                <div className="legend-cell level-3"></div>
                                <div className="legend-cell level-4"></div>
                            </div>
                            <span className="legend-label">More</span>
                        </div>
                    </div>
                    <div className="heatmap-stats">
                        <div className="heatmap-stat">
                            <span className="heatmap-stat-value">{getActivityHeatmap().filter(d => d.level > 0).length}</span>
                            <span className="heatmap-stat-label">Active Days</span>
                        </div>
                        <div className="heatmap-stat">
                            <span className="heatmap-stat-value">
                                {Math.round((getActivityHeatmap().filter(d => d.level > 0).length / 30) * 100)}%
                            </span>
                            <span className="heatmap-stat-label">Activity Rate</span>
                        </div>
                        <div className="heatmap-stat">
                            <span className="heatmap-stat-value">
                                {Math.max(...getActivityHeatmap().map(d => d.activity))}
                            </span>
                            <span className="heatmap-stat-label">Best Day Score</span>
                        </div>
                        <div className="heatmap-stat">
                            <span className="heatmap-stat-value">
                                {getActivityHeatmap().filter(d => d.level >= 3).length}
                            </span>
                            <span className="heatmap-stat-label">High Activity Days</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Platform Summary Cards */}
            <div className="platform-summary">
                {platformData?.github && (
                    <Card variant="default" padding="md" className="platform-mini-card github-card">
                        <div className="platform-mini-header">
                            <Github size={20} />
                            <span>GitHub</span>
                            <a href={`https://github.com/${platformData.github.username}`} target="_blank" rel="noopener noreferrer" className="external-link">
                                <ArrowUpRight size={14} />
                            </a>
                        </div>
                        <div className="platform-mini-stats">
                            <div className="mini-stat">
                                <span className="mini-stat-value">{platformData.github.publicRepos || 0}</span>
                                <span className="mini-stat-label">Repos</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat-value">{platformData.github.recentCommits || 0}</span>
                                <span className="mini-stat-label">Commits</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat-value">{platformData.github.totalStars || 0}</span>
                                <span className="mini-stat-label">Stars</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat-value">{platformData.github.followers || 0}</span>
                                <span className="mini-stat-label">Followers</span>
                            </div>
                        </div>
                        {platformData.github.topLanguages?.length > 0 && (
                            <div className="mini-languages">
                                {platformData.github.topLanguages.slice(0, 3).map((lang, i) => (
                                    <Badge key={i} variant="secondary" size="sm">{lang.language}</Badge>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {platformData?.leetcode && (
                    <Card variant="default" padding="md" className="platform-mini-card leetcode-card">
                        <div className="platform-mini-header">
                            <Code2 size={20} />
                            <span>LeetCode</span>
                            <a href={`https://leetcode.com/${platformData.leetcode.username}`} target="_blank" rel="noopener noreferrer" className="external-link">
                                <ArrowUpRight size={14} />
                            </a>
                        </div>
                        <div className="platform-mini-stats">
                            <div className="mini-stat">
                                <span className="mini-stat-value">{platformData.leetcode.totalSolved || 0}</span>
                                <span className="mini-stat-label">Total</span>
                            </div>
                            <div className="mini-stat easy">
                                <span className="mini-stat-value">{platformData.leetcode.easySolved || 0}</span>
                                <span className="mini-stat-label">Easy</span>
                            </div>
                            <div className="mini-stat medium">
                                <span className="mini-stat-value">{platformData.leetcode.mediumSolved || 0}</span>
                                <span className="mini-stat-label">Medium</span>
                            </div>
                            <div className="mini-stat hard">
                                <span className="mini-stat-value">{platformData.leetcode.hardSolved || 0}</span>
                                <span className="mini-stat-label">Hard</span>
                            </div>
                        </div>
                        <div className="mini-ranking">
                            <Trophy size={14} />
                            <span>Ranking: #{platformData.leetcode.ranking?.toLocaleString() || 'N/A'}</span>
                        </div>
                    </Card>
                )}

                {platformData?.hackerrank && (
                    <Card variant="default" padding="md" className="platform-mini-card hackerrank-card">
                        <div className="platform-mini-header">
                            <Award size={20} />
                            <span>HackerRank</span>
                            <a href={platformData.hackerrank.profileUrl || `https://www.hackerrank.com/profile/${platformData.hackerrank.username}`} target="_blank" rel="noopener noreferrer" className="external-link">
                                <ArrowUpRight size={14} />
                            </a>
                        </div>
                        <div className="platform-mini-stats">
                            <div className="mini-stat">
                                <span className="mini-stat-value">{platformData.hackerrank.badges || 0}</span>
                                <span className="mini-stat-label">Badges</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat-value">{platformData.hackerrank.certificates || 0}</span>
                                <span className="mini-stat-label">Certificates</span>
                            </div>
                            <div className="mini-stat">
                                <span className="mini-stat-value">{platformData.hackerrank.solvedChallenges || 0}</span>
                                <span className="mini-stat-label">Solved</span>
                            </div>
                            <div className="mini-stat gold">
                                <span className="mini-stat-value">{platformData.hackerrank.goldBadges || 0}</span>
                                <span className="mini-stat-label">Gold</span>
                            </div>
                        </div>
                        {platformData.hackerrank.skills?.length > 0 && (
                            <div className="mini-languages">
                                {platformData.hackerrank.skills.slice(0, 3).map((skill, i) => (
                                    <Badge key={i} variant="warning" size="sm">{skill}</Badge>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Academic Overview Card */}
                <Card key={`academic-card-${academicRefreshKey}`} variant="default" padding="md" className="platform-mini-card academic-card">
                    <div className="platform-mini-header">
                        <BookOpen size={20} />
                        <span>Academics (BIP)</span>
                        <a href="/student/academics" className="external-link">
                            <ArrowUpRight size={14} />
                        </a>
                    </div>
                    <div className="academic-gpa-display">
                        <div className="academic-gpa-circle" style={{ borderColor: (academicData?.cgpa || userData?.academics?.cgpa || 0) >= 8 ? '#10b981' : (academicData?.cgpa || userData?.academics?.cgpa || 0) >= 7 ? '#f59e0b' : '#ef4444' }}>
                            <span className="academic-gpa-value">{(academicData?.cgpa || userData?.academics?.cgpa || 0).toFixed(2)}</span>
                            <span className="academic-gpa-label">CGPA</span>
                        </div>
                        <div className="academic-stats-mini">
                            <div className="academic-mini-stat">
                                <span className="academic-mini-value">{(academicData?.sgpa || userData?.academics?.sgpa || 0).toFixed(2)}</span>
                                <span className="academic-mini-label">SGPA</span>
                            </div>
                            <div className="academic-mini-stat">
                                <span className="academic-mini-value">{academicData?.attendance || userData?.academics?.attendance || 0}%</span>
                                <span className="academic-mini-label">Attendance</span>
                            </div>
                        </div>
                    </div>
                    {(academicData?.attendance || userData?.academics?.attendance || 100) < 75 && (
                        <div className="academic-warning">⚠️ Low Attendance</div>
                    )}
                </Card>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
                <Card variant="default" padding="lg" className="chart-card">
                    <CardHeader>
                        <CardTitle>Growth Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="chart-container">
                            {getGrowthData().length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={getGrowthData()} key={`growth-${progressHistory.length}-${academicRefreshKey}`}>
                                        <defs>
                                            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                        <YAxis stroke="#9ca3af" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#10b981"
                                            strokeWidth={3}
                                            fill="url(#growthGradient)"
                                            name="Growth Score"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div style={{
                                    height: '250px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#9ca3af',
                                    fontSize: '14px'
                                }}>
                                    No historical data yet. Keep coding to see your growth trend!
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card variant="default" padding="lg" className="chart-card">
                    <CardHeader>
                        <CardTitle>Skills Radar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={250}>
                                <RadarChart data={getSkillsData()} key={`radar-${platformData?.leetcode?.totalSolved}-${platformData?.github?.publicRepos}-${academicData?.cgpa}-${academicRefreshKey}`}>
                                    <PolarGrid stroke="#e5e7eb" />
                                    <PolarAngleAxis dataKey="skill" stroke="#6b7280" fontSize={11} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
                                    <Radar
                                        name="Skills"
                                        dataKey="value"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.3}
                                        strokeWidth={2}
                                        animationDuration={800}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '12px'
                                        }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* LeetCode Breakdown */}
            {
                platformData?.leetcode && getLeetCodeBreakdown().length > 0 && (
                    <Card variant="default" padding="lg" className="leetcode-breakdown-card">
                        <CardHeader>
                            <CardTitle>LeetCode Problem Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="leetcode-breakdown">
                                <div className="leetcode-chart">
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={getLeetCodeBreakdown()}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {getLeetCodeBreakdown().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="leetcode-details">
                                    <div className="lc-stat easy">
                                        <div className="lc-stat-label">
                                            <span className="lc-dot" style={{ background: '#22c55e' }}></span>
                                            Easy
                                        </div>
                                        <div className="lc-stat-value">{platformData.leetcode.easySolved || 0}</div>
                                    </div>
                                    <div className="lc-stat medium">
                                        <div className="lc-stat-label">
                                            <span className="lc-dot" style={{ background: '#f59e0b' }}></span>
                                            Medium
                                        </div>
                                        <div className="lc-stat-value">{platformData.leetcode.mediumSolved || 0}</div>
                                    </div>
                                    <div className="lc-stat hard">
                                        <div className="lc-stat-label">
                                            <span className="lc-dot" style={{ background: '#ef4444' }}></span>
                                            Hard
                                        </div>
                                        <div className="lc-stat-value">{platformData.leetcode.hardSolved || 0}</div>
                                    </div>
                                    <div className="lc-total">
                                        <strong>Total: {platformData.leetcode.totalSolved || 0}</strong>
                                        <span className="lc-ranking">Ranking: #{platformData.leetcode.ranking?.toLocaleString() || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            {/* HackerRank Tracks Chart - Dynamic */}
            {
                platformData?.hackerrank && getHackerRankData().length > 0 && (
                    <Card variant="default" padding="lg" className="hackerrank-tracks-card">
                        <CardHeader>
                            <CardTitle>HackerRank Track Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="chart-container">
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={getHackerRankData()} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                        <YAxis type="category" dataKey="name" stroke="#9ca3af" fontSize={11} width={80} />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Submissions" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )
            }

            {/* Goals & Quick Stats */}
            <div className="charts-row">
                <Card variant="default" padding="lg" className="goals-card">
                    <CardHeader>
                        <div className="card-header-row">
                            <CardTitle>Current Goals</CardTitle>
                            <a href="/student/goals" className="card-link">
                                View All <ArrowUpRight size={16} />
                            </a>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="goals-list">
                            {dynamicGoals.length > 0 ? (
                                dynamicGoals.map((goal, idx) => {
                                    // Calculate actual progress based on goal title/category
                                    let currentValue = goal.progress || 0
                                    let maxValue = goal.total || 100

                                    // Auto-update progress based on platform data
                                    if (goal.title.toLowerCase().includes('leetcode') || goal.category === 'Coding') {
                                        currentValue = platformData?.leetcode?.totalSolved || goal.progress || 0
                                    } else if (goal.title.toLowerCase().includes('github') || goal.title.toLowerCase().includes('project')) {
                                        currentValue = platformData?.github?.publicRepos || goal.progress || 0
                                    } else if (goal.title.toLowerCase().includes('hackerrank') || goal.title.toLowerCase().includes('badge')) {
                                        currentValue = platformData?.hackerrank?.badges || goal.progress || 0
                                    } else if (goal.title.toLowerCase().includes('cgpa') || goal.category === 'Academic') {
                                        currentValue = (academicData?.cgpa || userData?.academics?.cgpa || goal.progress || 0)
                                        maxValue = 10
                                        if (maxValue === 10 && currentValue <= 10) {
                                            currentValue = currentValue * 10
                                            maxValue = 100
                                        }
                                    }

                                    const iconVariant = idx === 0 ? '' : idx === 1 ? 'secondary' : idx === 2 ? 'accent' : 'warning'
                                    const progressVariant = idx === 0 ? 'primary' : idx === 1 ? 'secondary' : idx === 2 ? 'accent' : 'warning'

                                    return (
                                        <div key={goal.id} className="goal-item">
                                            <div className="goal-header">
                                                <Target size={18} className={`goal-icon ${iconVariant}`} />
                                                <span>{goal.title}</span>
                                            </div>
                                            <ProgressBar
                                                value={currentValue}
                                                max={maxValue}
                                                variant={progressVariant}
                                                size="md"
                                            />
                                            <span className="goal-progress-text">
                                                {maxValue === 100 ? `${(currentValue / 10).toFixed(1)}` : currentValue} / {maxValue === 100 ? (maxValue / 10).toFixed(1) : maxValue}
                                            </span>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="no-goals-message">
                                    <Target size={32} style={{ opacity: 0.3 }} />
                                    <p>No active goals. Visit Goals page to set your targets!</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card variant="default" padding="lg" className="activity-card">
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="quick-stats-list">
                            <div className="quick-stat-item">
                                <div className="quick-stat-icon"><Zap size={18} /></div>
                                <div className="quick-stat-content">
                                    <span className="quick-stat-value">{growthScore}</span>
                                    <span className="quick-stat-label">Growth Score</span>
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <div className="quick-stat-icon"><Code2 size={18} /></div>
                                <div className="quick-stat-content">
                                    <span className="quick-stat-value">{platformData?.leetcode?.totalSolved || 0}</span>
                                    <span className="quick-stat-label">Problems Solved</span>
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <div className="quick-stat-icon"><GitCommit size={18} /></div>
                                <div className="quick-stat-content">
                                    <span className="quick-stat-value">{platformData?.github?.totalCommits || platformData?.github?.contributions || platformData?.github?.recentCommits || 0}</span>
                                    <span className="quick-stat-label">Total Commits</span>
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <div className="quick-stat-icon"><Star size={18} /></div>
                                <div className="quick-stat-content">
                                    <span className="quick-stat-value">{platformData?.github?.totalStars || 0}</span>
                                    <span className="quick-stat-label">GitHub Stars</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Over Time */}
            <Card variant="default" padding="lg" className="coding-activity-card">
                <CardHeader>
                    <CardTitle>Progress Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="chart-container">
                        {getGrowthData().length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={getGrowthData()} key={`progress-${progressHistory.length}-${academicRefreshKey}`}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                    <YAxis stroke="#9ca3af" fontSize={12} yAxisId="left" />
                                    <YAxis stroke="#9ca3af" fontSize={12} yAxisId="right" orientation="right" />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                    <Line
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="problems"
                                        stroke="#f59e0b"
                                        strokeWidth={3}
                                        dot={{ fill: '#f59e0b', strokeWidth: 2 }}
                                        name="Problems Solved"
                                    />
                                    <Line
                                        yAxisId="right"
                                        type="monotone"
                                        dataKey="repos"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                                        name="GitHub Repos"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#9ca3af',
                                fontSize: '14px'
                            }}>
                                No progress data yet. Your coding journey will appear here!
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </DashboardLayout >
    )
}
