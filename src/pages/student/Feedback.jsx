import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { feedbackAPI } from '../../services/api'
import { MessageSquare, Calendar, Star, Filter, RefreshCw, TrendingUp, Award, Search } from 'lucide-react'
import './Feedback.css'

export default function Feedback() {
    const { userData } = useAuth()
    const [feedbacks, setFeedbacks] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterType, setFilterType] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        loadFeedback()
    }, [])

    const loadFeedback = async () => {
        setLoading(true)
        try {
            const data = await feedbackAPI.getByStudent(userData.id)
            setFeedbacks(data)
        } catch (error) {
            console.error('Error loading feedback:', error)
        } finally {
            setLoading(false)
        }
    }

    // filtering logic
    const filteredFeedback = feedbacks.filter(f => {
        const matchesType = filterType === 'all' ? true : f.type === filterType
        const matchesSearch = searchTerm === '' ? true :
            f.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.strengths?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.improvements?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesType && matchesSearch
    })

    // Stats Calculation
    const totalReviews = feedbacks.length
    const averageRating = totalReviews > 0
        ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews).toFixed(1)
        : '0.0'
    const latestFeedbackDate = totalReviews > 0
        ? new Date(feedbacks[0].createdAt).toLocaleDateString()
        : 'N/A'

    const getScoreColor = (rating) => {
        if (rating >= 4.5) return '#10b981' // Green
        if (rating >= 3.5) return '#3b82f6' // Blue
        if (rating >= 2.5) return '#f59e0b' // Amber
        return '#ef4444' // Red
    }

    const getTypeLabel = (type) => {
        const types = {
            monthly: 'Monthly Review',
            goal: 'Goal Evaluation',
            performance: 'Performance Review',
            general: 'General Feedback'
        }
        return types[type] || type
    }

    return (
        <DashboardLayout role="student">
            <div className="fb-container">
                {/* Clean Header */}
                <div className="fb-header-pro">
                    <div>
                        <h1>Mentor Feedback</h1>
                        <p>Track your progress through mentor evaluations and guidance.</p>
                    </div>
                    <div className="fb-header-actions">
                        <button className="btn-refresh" onClick={loadFeedback}>
                            <RefreshCw size={16} /> Refresh
                        </button>
                    </div>
                </div>

                {/* KPI Status Row */}
                <div className="fb-stats-row">
                    <div className="stat-card">
                        <div className="stat-icon i-blue"><MessageSquare size={20} /></div>
                        <div>
                            <span className="stat-label">Total Reviews</span>
                            <span className="stat-value">{totalReviews}</span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon i-amber"><Star size={20} /></div>
                        <div>
                            <span className="stat-label">Avg. Rating</span>
                            <span className="stat-value">{averageRating} <span className="stat-max">/ 5.0</span></span>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon i-green"><Calendar size={20} /></div>
                        <div>
                            <span className="stat-label">Last Review</span>
                            <span className="stat-value">{latestFeedbackDate}</span>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="fb-controls-bar">
                    <div className="search-wrap">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search feedback..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-wrap">
                        <Filter size={16} className="filter-icon" />
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="all">All Types</option>
                            <option value="monthly">Monthly Reviews</option>
                            <option value="goal">Goal Evals</option>
                            <option value="performance">Performance</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                </div>

                {/* Feedback List */}
                {loading ? (
                    <div className="fb-loading-state">
                        <RefreshCw className="spin" size={32} />
                        <p>Retrieving your feedback history...</p>
                    </div>
                ) : filteredFeedback.length > 0 ? (
                    <div className="fb-list-grid">
                        {filteredFeedback.map((item) => (
                            <div key={item.id} className="fb-card-pro">
                                <div className="fb-card-top">
                                    <div className="fb-card-info">
                                        <div className="fb-card-type">
                                            <span className={`badge badge-${item.type}`}>
                                                {getTypeLabel(item.type)}
                                            </span>
                                            <span className="fb-card-date">
                                                {new Date(item.createdAt).toLocaleDateString(undefined, {
                                                    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="fb-card-score" style={{ borderColor: getScoreColor(item.rating), color: getScoreColor(item.rating) }}>
                                        <span className="score-val">{item.rating}</span>
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                </div>

                                <div className="fb-card-body">
                                    {item.strengths && (
                                        <div className="feedback-block">
                                            <h5><TrendingUp size={14} className="icon-green" /> Key Strengths</h5>
                                            <p>{item.strengths}</p>
                                        </div>
                                    )}
                                    {item.improvements && (
                                        <div className="feedback-block">
                                            <h5><Award size={14} className="icon-amber" /> Areas for Growth</h5>
                                            <p>{item.improvements}</p>
                                        </div>
                                    )}
                                    {item.notes && (
                                        <div className="feedback-block">
                                            <h5><MessageSquare size={14} className="icon-blue" /> Mentor Notes</h5>
                                            <p className="notes-text">{item.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="fb-empty-state">
                        <div className="empty-icon-bg">
                            <MessageSquare size={48} />
                        </div>
                        <h3>No feedback found</h3>
                        <p>Feedback matching your filters will appear here once submitted by your mentor.</p>
                        {searchTerm || filterType !== 'all' ? (
                            <button className="btn-link" onClick={() => { setFilterType('all'); setSearchTerm('') }}>Clear Filters</button>
                        ) : null}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
