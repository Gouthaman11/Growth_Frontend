import { useState, useEffect } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input, { TextArea, Select } from '../../components/ui/Input'
import { Target, Calendar, CheckCircle2, Clock, Plus, X, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { goalsAPI, milestonesAPI, codingDataAPI, academicsAPI } from '../../services/api'
import './StudentDashboard.css'
import './Goals.css'

const categoryOptions = [
    { value: 'Coding', label: 'Coding' },
    { value: 'Learning', label: 'Learning' },
    { value: 'Projects', label: 'Projects' },
    { value: 'Academic', label: 'Academic' },
    { value: 'Other', label: 'Other' },
]

export default function Goals() {
    const { userData } = useAuth()
    const [goals, setGoals] = useState([])
    const [milestones, setMilestones] = useState([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [platformData, setPlatformData] = useState(null)
    const [academicData, setAcademicData] = useState(null)
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        category: 'Coding',
        total: 100,
        deadline: ''
    })

    useEffect(() => {
        if (userData?.id) {
            loadData()
            loadPlatformData()
        }
    }, [userData])

    // Auto-refresh every 2 minutes
    useEffect(() => {
        if (!userData?.id) return
        
        const refreshInterval = setInterval(() => {
            loadPlatformData()
        }, 120000) // 2 minutes

        return () => clearInterval(refreshInterval)
    }, [userData])

    const loadPlatformData = async () => {
        try {
            const [codingSync, academics] = await Promise.all([
                codingDataAPI.syncAll(userData.id).catch(() => ({ github: {}, leetcode: {}, hackerrank: {} })),
                academicsAPI.getData(userData.id).catch(() => ({}))
            ])
            setPlatformData({
                github: codingSync.github || {},
                leetcode: codingSync.leetcode || {},
                hackerrank: codingSync.hackerrank || {}
            })
            setAcademicData(academics)
        } catch (error) {
            console.error('Error loading platform data:', error)
        }
    }

    const syncNow = async () => {
        setSyncing(true)
        await loadPlatformData()
        await loadData()
        setSyncing(false)
    }

    const loadData = async () => {
        try {
            setLoading(true)
            const [goalsData, milestonesData] = await Promise.all([
                goalsAPI.getByStudent(userData.id),
                milestonesAPI.getByStudent(userData.id)
            ])
            setGoals(goalsData)
            setMilestones(milestonesData)
        } catch (error) {
            console.error('Error loading goals:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddGoal = async (e) => {
        e.preventDefault()
        try {
            await goalsAPI.create({
                studentId: userData.id,
                title: newGoal.title,
                description: newGoal.description,
                category: newGoal.category,
                total: parseInt(newGoal.total),
                deadline: newGoal.deadline,
                assignedBy: 'Self'
            })
            setShowAddModal(false)
            setNewGoal({ title: '', description: '', category: 'Coding', total: 100, deadline: '' })
            loadData()
        } catch (error) {
            console.error('Error adding goal:', error)
            alert('Failed to add goal')
        }
    }

    const handleUpdateProgress = async (goalId, currentProgress, total) => {
        const newProgress = prompt(`Enter new progress (current: ${currentProgress}/${total}):`, currentProgress)
        if (newProgress !== null) {
            try {
                await goalsAPI.updateProgress(goalId, parseInt(newProgress))
                loadData()
            } catch (error) {
                console.error('Error updating progress:', error)
            }
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const activeGoals = goals.filter(g => g.status !== 'completed')
    const completedGoals = goals.filter(g => g.status === 'completed')

    const completionPercentage = goals.length > 0
        ? Math.round((completedGoals.length / goals.length) * 100)
        : 0

    return (
        <DashboardLayout role="student">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">Goals & Milestones</h1>
                    <p className="dashboard-subtitle">Track your assigned goals and personal milestones</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button 
                        variant="secondary" 
                        icon={<RefreshCw size={18} className={syncing ? 'spinning' : ''} />} 
                        onClick={syncNow}
                        disabled={syncing}
                    >
                        {syncing ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button variant="primary" icon={<Plus size={18} />} onClick={() => setShowAddModal(true)}>
                        Add Goal
                    </Button>
                </div>
            </div>

            {/* Add Goal Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Add New Goal</h3>
                            <button className="modal-close" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddGoal}>
                            <Input
                                label="Goal Title"
                                placeholder="e.g., Solve 50 LeetCode Problems"
                                value={newGoal.title}
                                onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                required
                            />
                            <TextArea
                                label="Description"
                                placeholder="Describe your goal..."
                                value={newGoal.description}
                                onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                rows={2}
                            />
                            <div className="form-grid">
                                <Select
                                    label="Category"
                                    options={categoryOptions}
                                    value={newGoal.category}
                                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                                />
                                <Input
                                    label="Target"
                                    type="number"
                                    placeholder="100"
                                    value={newGoal.total}
                                    onChange={(e) => setNewGoal({ ...newGoal, total: e.target.value })}
                                />
                            </div>
                            <Input
                                label="Deadline"
                                type="date"
                                value={newGoal.deadline}
                                onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                            />
                            <Button type="submit" variant="primary" fullWidth>
                                Create Goal
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            <div className="goals-layout">
                <div className="goals-main">
                    <div className="goals-section">
                        <h2 className="section-title-sm">Active Goals</h2>
                        {loading ? (
                            <p style={{ color: 'var(--text-muted)' }}>Loading goals...</p>
                        ) : activeGoals.length === 0 ? (
                            <Card variant="default" padding="lg">
                                <CardContent>
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                                        No active goals. Click "Add Goal" to create one!
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="goals-cards">
                                {activeGoals.map((goal) => {
                                    // Calculate real-time progress based on platform data
                                    let currentProgress = goal.progress || 0
                                    let maxValue = goal.total || 100
                                    
                                    // Auto-update progress based on goal title/category
                                    if (goal.title.toLowerCase().includes('leetcode') || goal.category === 'Coding') {
                                        const leetcodeSolved = platformData?.leetcode?.totalSolved || 0
                                        if (leetcodeSolved > 0) currentProgress = leetcodeSolved
                                    } else if (goal.title.toLowerCase().includes('github') || goal.title.toLowerCase().includes('project')) {
                                        const githubRepos = platformData?.github?.publicRepos || 0
                                        if (githubRepos > 0) currentProgress = githubRepos
                                    } else if (goal.title.toLowerCase().includes('hackerrank') || goal.title.toLowerCase().includes('badge')) {
                                        const hackerrankBadges = platformData?.hackerrank?.badges || 0
                                        if (hackerrankBadges > 0) currentProgress = hackerrankBadges
                                    } else if (goal.title.toLowerCase().includes('cgpa') || goal.category === 'Academic') {
                                        const cgpa = academicData?.cgpa || userData?.academics?.cgpa || 0
                                        if (cgpa > 0) {
                                            currentProgress = cgpa * 10
                                            maxValue = 100
                                        }
                                    }
                                    
                                    const progressPercent = (currentProgress / maxValue) * 100
                                    
                                    return (
                                        <Card
                                            key={goal.id}
                                            variant="default"
                                            padding="lg"
                                            className="goal-card"
                                            onClick={() => handleUpdateProgress(goal.id, currentProgress, maxValue)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="goal-card-header">
                                                <Badge variant={
                                                    goal.category === 'Coding' ? 'primary' :
                                                        goal.category === 'Learning' ? 'accent' :
                                                            goal.category === 'Projects' ? 'secondary' : 'default'
                                                }>
                                                    {goal.category}
                                                </Badge>
                                                <Badge variant={progressPercent >= 70 ? 'success' : progressPercent >= 40 ? 'warning' : 'default'} dot>
                                                    {progressPercent >= 100 ? 'Completed' : progressPercent >= 70 ? 'On Track' : 'In Progress'}
                                                </Badge>
                                            </div>
                                            <h3 className="goal-card-title">{goal.title}</h3>
                                            <p className="goal-card-description">{goal.description}</p>

                                            <ProgressBar
                                                value={currentProgress}
                                                max={maxValue}
                                                variant={progressPercent >= 70 ? 'secondary' : 'primary'}
                                                label={maxValue === 100 && currentProgress <= 10 ? 
                                                    `${(currentProgress / 10).toFixed(1)}/${(maxValue / 10).toFixed(1)}` : 
                                                    `${currentProgress}/${maxValue}`
                                                }
                                            />

                                            <div className="goal-card-footer">
                                                <div className="goal-meta">
                                                    <Calendar size={14} />
                                                    <span>{formatDate(goal.deadline)}</span>
                                                </div>
                                                <div className="goal-meta">
                                                    <span className="goal-assigned">Assigned by: {goal.assignedBy}</span>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {completedGoals.length > 0 && (
                        <div className="goals-section">
                            <h2 className="section-title-sm">Completed Goals</h2>
                            <div className="goals-cards">
                                {completedGoals.map((goal) => (
                                    <Card key={goal.id} variant="default" padding="lg" className="goal-card goal-completed">
                                        <div className="goal-card-header">
                                            <Badge variant="success">
                                                <CheckCircle2 size={14} /> Completed
                                            </Badge>
                                        </div>
                                        <h3 className="goal-card-title">{goal.title}</h3>
                                        <p className="goal-card-description">{goal.description}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="goals-sidebar">
                    <Card variant="default" padding="lg">
                        <CardHeader>
                            <CardTitle>Milestone Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="milestone-timeline">
                                {milestones.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>
                                        No milestones yet
                                    </p>
                                ) : (
                                    milestones.map((milestone, idx) => (
                                        <div key={idx} className={`milestone-item ${milestone.completed ? 'completed' : ''}`}>
                                            <div className="milestone-marker">
                                                {milestone.completed ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                            </div>
                                            <div className="milestone-content">
                                                <span className="milestone-date">{formatDate(milestone.date)}</span>
                                                <span className="milestone-title">{milestone.title}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="gradient" padding="lg">
                        <CardContent>
                            <div className="motivation-card">
                                <Target size={32} />
                                <h3>Keep Going!</h3>
                                <p>You're {completionPercentage}% towards completing your goals. Stay focused!</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
