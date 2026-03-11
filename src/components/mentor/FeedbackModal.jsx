import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Button from '../ui/Button'
import { X, Star, MessageSquare, CheckCircle2, AlertTriangle } from 'lucide-react'
import { feedbackAPI } from '../../services/api'
import './FeedbackModal.css'

export default function FeedbackModal({ studentId, studentName, onClose, onSuccess }) {
    const { userData } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: 'monthly', // default type
        rating: 0,
        notes: '',
        strengths: '',
        improvements: ''
    })
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.rating === 0) {
            setError('Please provide a rating')
            return
        }

        setLoading(true)
        setError(null)

        try {
            if (!userData?.id) {
                throw new Error('Mentor session invalid. Please refresh.')
            }

            await feedbackAPI.create({
                studentId,
                mentorId: userData.id,
                ...formData
            })
            onSuccess()
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to submit feedback')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fm-overlay">
            <div className="fm-modal">
                <div className="fm-header">
                    <h3>Give Feedback to {studentName}</h3>
                    <button onClick={onClose} className="fm-close"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="fm-form">

                    {error && <div className="fm-error"><AlertTriangle size={14} /> {error}</div>}

                    <div className="fm-field">
                        <label>Feedback Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="monthly">Monthly Review</option>
                            <option value="goal">Goal Evaluation</option>
                            <option value="performance">Performance Review</option>
                            <option value="general">General Feedback</option>
                        </select>
                    </div>

                    <div className="fm-field">
                        <label>Rating</label>
                        <div className="fm-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className={`fm-star ${formData.rating >= star ? 'filled' : ''}`}
                                    onClick={() => setFormData({ ...formData, rating: star })}
                                >
                                    <Star size={24} fill={formData.rating >= star ? '#f59e0b' : 'none'} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="fm-field">
                        <label>Strengths</label>
                        <textarea
                            placeholder="What is the student doing well?"
                            value={formData.strengths}
                            onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="fm-field">
                        <label>Improvements</label>
                        <textarea
                            placeholder="Areas for improvement..."
                            value={formData.improvements}
                            onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="fm-field">
                        <label>Additional Notes</label>
                        <textarea
                            placeholder="Any other comments?"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="fm-actions">
                        <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Sending...' : 'Submit Feedback'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
