import { useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input, { TextArea, Select } from '../../components/ui/Input'
import { Send, Bell } from 'lucide-react'
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
                            <div className="no-data-msg">
                                <Bell size={32} />
                                <p>No announcements yet</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
