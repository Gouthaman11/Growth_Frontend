import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input, { TextArea, Select } from '../../components/ui/Input'
import { Send, Bell, Calendar, Users, Edit2, Trash2 } from 'lucide-react'
import './AdminDashboard.css'

const audiences = [
    { value: 'all', label: 'All Users' },
    { value: 'students', label: 'All Students' },
    { value: 'mentors', label: 'All Mentors' },
    { value: 'cse', label: 'CSE Department' },
    { value: 'it', label: 'IT Department' },
]

const priorities = [
    { value: 'normal', label: 'Normal' },
    { value: 'important', label: 'Important' },
    { value: 'urgent', label: 'Urgent' },
]

const announcements = [
    {
        id: 1,
        title: 'Placement Drive - Tech Mahindra',
        body: 'Tech Mahindra campus drive scheduled for Feb 15th. All eligible students must register by Feb 10th.',
        audience: 'CSE Students',
        priority: 'important',
        date: 'Feb 5, 2026',
        author: 'Placement Cell'
    },
    {
        id: 2,
        title: 'System Maintenance Notice',
        body: 'EduGrow+ will be under maintenance on Feb 8th from 2 AM to 6 AM. Please save your work.',
        audience: 'All Users',
        priority: 'normal',
        date: 'Feb 4, 2026',
        author: 'IT Admin'
    },
    {
        id: 3,
        title: 'Monthly Goal Deadline',
        body: 'Reminder: Submit your February monthly goals by Feb 28th for mentor review.',
        audience: 'All Students',
        priority: 'normal',
        date: 'Feb 1, 2026',
        author: 'Academic Office'
    },
]

export default function Announcements() {
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        audience: '',
        priority: 'normal'
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        alert('Announcement published!')
    }

    return (
        <DashboardLayout role="admin">
            <div className="admin-page">
                <div className="admin-header">
                    <div>
                        <h1 className="admin-title">Announcements</h1>
                        <p className="admin-subtitle">Create and manage institution-wide announcements</p>
                    </div>
                </div>

                <div className="admin-charts-row">
                    {/* New Announcement Form */}
                    <Card className="admin-chart-card">
                        <CardHeader>
                            <CardTitle>New Announcement</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="announcement-form" onSubmit={handleSubmit}>
                                <Input
                                    label="Title"
                                    placeholder="Announcement title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />

                                <TextArea
                                    label="Message"
                                    placeholder="Write your announcement here..."
                                    rows={4}
                                    value={formData.body}
                                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                    required
                                />

                                <div className="form-grid">
                                    <Select
                                        label="Target Audience"
                                        options={audiences}
                                        value={formData.audience}
                                        onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                                        required
                                    />
                                    <Select
                                        label="Priority"
                                        options={priorities}
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    />
                                </div>

                                <Button type="submit" variant="primary" fullWidth icon={<Send size={18} />}>
                                    Publish Announcement
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Recent Announcements */}
                    <Card className="admin-chart-card">
                        <CardHeader>
                            <CardTitle>Recent Announcements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="announcement-list">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="announcement-item">
                                        <div className="announcement-header">
                                            <h4 className="announcement-title">{announcement.title}</h4>
                                            <Badge
                                                variant={
                                                    announcement.priority === 'urgent' ? 'error' :
                                                        announcement.priority === 'important' ? 'warning' : 'default'
                                                }
                                                size="sm"
                                            >
                                                {announcement.priority}
                                            </Badge>
                                        </div>
                                        <p className="announcement-body">{announcement.body}</p>
                                        <div className="announcement-meta">
                                            <span><Users size={12} /> {announcement.audience}</span>
                                            <span><Calendar size={12} /> {announcement.date}</span>
                                            <span>By {announcement.author}</span>
                                        </div>
                                        <div className="announcement-actions">
                                            <Button variant="ghost" size="sm" icon={<Edit2 size={14} />}>Edit</Button>
                                            <Button variant="ghost" size="sm" icon={<Trash2 size={14} />}>Delete</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
