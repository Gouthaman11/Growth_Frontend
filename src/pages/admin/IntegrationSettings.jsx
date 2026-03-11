import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { Github, Code2, RefreshCw, Settings, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import './AdminDashboard.css'

const integrations = [
    {
        id: 1,
        name: 'GitHub',
        description: 'Track repositories, commits, and contributions',
        icon: Github,
        iconClass: 'github',
        status: 'connected',
        lastSync: '5 mins ago',
        stats: [
            { label: 'Students Synced', value: '1,234' },
            { label: 'Total Repos', value: '8,456' },
            { label: 'Today Commits', value: '234' },
        ]
    },
    {
        id: 2,
        name: 'LeetCode',
        description: 'Monitor problem solving progress and rankings',
        icon: Code2,
        iconClass: 'leetcode',
        status: 'connected',
        lastSync: '10 mins ago',
        stats: [
            { label: 'Students Synced', value: '1,180' },
            { label: 'Problems Solved', value: '45,678' },
            { label: 'Active Streaks', value: '456' },
        ]
    },
    {
        id: 3,
        name: 'HackerRank',
        description: 'Track badges, certifications, and skill scores',
        icon: Code2,
        iconClass: 'hackerrank',
        status: 'connected',
        lastSync: '1 hour ago',
        stats: [
            { label: 'Students Synced', value: '980' },
            { label: 'Certifications', value: '1,234' },
            { label: 'Badges Earned', value: '3,456' },
        ]
    },
    {
        id: 4,
        name: 'Academic System',
        description: 'Sync attendance, grades, and course data',
        icon: Settings,
        iconClass: 'academic',
        status: 'syncing',
        lastSync: 'In progress...',
        stats: [
            { label: 'Students', value: '1,780' },
            { label: 'Courses', value: '45' },
            { label: 'Last Semester GPA', value: '7.8' },
        ]
    },
]

export default function IntegrationSettings() {
    return (
        <DashboardLayout role="admin">
            <div className="admin-page">
                <div className="admin-header">
                    <div>
                        <h1 className="admin-title">Integration Settings</h1>
                        <p className="admin-subtitle">Manage external platform connections and data sync</p>
                    </div>
                    <Button variant="primary" icon={<RefreshCw size={18} />}>
                        Sync All
                    </Button>
                </div>

                <div className="integration-grid">
                    {integrations.map((integration) => (
                        <div key={integration.id} className="integration-card">
                            <div className="integration-header">
                                <div className={`integration-icon ${integration.iconClass}`}>
                                    <integration.icon size={28} />
                                </div>
                                <div className="integration-info">
                                    <h3>{integration.name}</h3>
                                    <p>{integration.description}</p>
                                </div>
                                <div className="integration-status">
                                    <Badge
                                        variant={integration.status === 'connected' ? 'success' : 'warning'}
                                        dot
                                    >
                                        {integration.status === 'connected' ? 'Connected' : 'Syncing'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="integration-stats">
                                {integration.stats.map((stat, idx) => (
                                    <div key={idx} className="integration-stat">
                                        <div className="integration-stat-value">{stat.value}</div>
                                        <div className="integration-stat-label">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="integration-actions">
                                <div className="sync-info">
                                    <Clock size={14} />
                                    <span>Last sync: {integration.lastSync}</span>
                                </div>
                                <Button variant="ghost" size="sm" icon={<RefreshCw size={14} />}>
                                    Sync Now
                                </Button>
                                <Button variant="ghost" size="sm" icon={<Settings size={14} />}>
                                    Configure
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* API Settings */}
                <div className="api-settings-card">
                    <CardHeader>
                        <CardTitle>API Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="api-list">
                            <div className="api-item">
                                <div className="api-info">
                                    <strong>GitHub API</strong>
                                    <span>OAuth Authentication</span>
                                </div>
                                <Badge variant="success" dot>Active</Badge>
                                <Button variant="outline" size="sm">Update Token</Button>
                            </div>
                            <div className="api-item">
                                <div className="api-info">
                                    <strong>LeetCode API</strong>
                                    <span>GraphQL Endpoint</span>
                                </div>
                                <Badge variant="success" dot>Active</Badge>
                                <Button variant="outline" size="sm">Configure</Button>
                            </div>
                            <div className="api-item">
                                <div className="api-info">
                                    <strong>HackerRank API</strong>
                                    <span>REST API v2</span>
                                </div>
                                <Badge variant="success" dot>Active</Badge>
                                <Button variant="outline" size="sm">Configure</Button>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </div>
        </DashboardLayout>
    )
}
