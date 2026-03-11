import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Settings } from 'lucide-react'
import './AdminDashboard.css'

export default function IntegrationSettings() {
    return (
        <DashboardLayout role="admin">
            <div className="admin-page">
                <div className="admin-header">
                    <div>
                        <h1 className="admin-title">Integration Settings</h1>
                        <p className="admin-subtitle">Manage external platform connections and data sync</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle><Settings size={18} /> Integrations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="no-data-msg">No integrations configured yet</div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
