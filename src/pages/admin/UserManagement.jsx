import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { userAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Input, { Select } from '../../components/ui/Input'
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Users,
    GraduationCap,
    UserCheck,
    Shield,
    Eye,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Check,
    Clock,
    CheckCircle,
    XCircle
} from 'lucide-react'
import './AdminDashboard.css'

const ROLES = [
    { value: '', label: 'All Roles' },
    { value: 'student', label: 'Student' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'admin', label: 'Admin' },
]

const DEPARTMENTS = [
    { value: '', label: 'All Departments' },
    { value: 'cse', label: 'CSE' },
    { value: 'it', label: 'IT' },
    { value: 'ece', label: 'ECE' },
    { value: 'eee', label: 'EEE' },
    { value: 'mech', label: 'MECH' },
    { value: 'civil', label: 'CIVIL' },
    { value: 'aids', label: 'AI&DS' },
]

export default function UserManagement() {
    const { userData } = useAuth()
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [deptFilter, setDeptFilter] = useState('')
    const [page, setPage] = useState(1)
    const perPage = 10

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
    const [editingUser, setEditingUser] = useState(null)
    const [formData, setFormData] = useState({
        fullName: '', email: '', password: '', role: 'student',
        department: '', rollNumber: '', year: '',
        employeeId: '', designation: '', specialization: ''
    })
    const [formError, setFormError] = useState('')
    const [saving, setSaving] = useState(false)

    // Delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deletingUser, setDeletingUser] = useState(null)
    const [deleting, setDeleting] = useState(false)

    // Success message
    const [successMsg, setSuccessMsg] = useState('')

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        setLoading(true)
        try {
            const data = await userAPI.getAllUsers()
            setUsers(data)
        } catch (error) {
            console.error('Error loading users:', error)
        }
        setLoading(false)
    }

    // Filtered users
    const filteredUsers = users.filter(u => {
        if (roleFilter && u.role !== roleFilter) return false
        if (deptFilter && u.department?.toLowerCase() !== deptFilter) return false
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            return (
                u.fullName?.toLowerCase().includes(term) ||
                u.email?.toLowerCase().includes(term) ||
                u.rollNumber?.toLowerCase().includes(term) ||
                u.employeeId?.toLowerCase().includes(term)
            )
        }
        return true
    })

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / perPage)
    const paginatedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage)

    // Role counts
    const studentCount = users.filter(u => u.role === 'student').length
    const mentorCount = users.filter(u => u.role === 'mentor').length
    const adminCount = users.filter(u => u.role === 'admin').length
    const pendingMentors = users.filter(u => u.role === 'mentor' && u.isApproved === false)
    const pendingCount = pendingMentors.length

    // Open Add modal
    const openAddModal = () => {
        setModalMode('add')
        setFormData({
            fullName: '', email: '', password: '', role: 'student',
            department: '', rollNumber: '', year: '',
            employeeId: '', designation: '', specialization: ''
        })
        setFormError('')
        setShowModal(true)
    }

    // Open Edit modal
    const openEditModal = (user) => {
        setModalMode('edit')
        setEditingUser(user)
        setFormData({
            fullName: user.fullName || '',
            email: user.email || '',
            password: '',
            role: user.role || 'student',
            department: user.department || '',
            rollNumber: user.rollNumber || '',
            year: user.year || '',
            employeeId: user.employeeId || '',
            designation: user.designation || '',
            specialization: user.specialization || ''
        })
        setFormError('')
        setShowModal(true)
    }

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')
        setSaving(true)

        try {
            if (modalMode === 'add') {
                if (!formData.email || !formData.password || !formData.fullName) {
                    setFormError('Name, email and password are required')
                    setSaving(false)
                    return
                }
                const payload = {
                    email: formData.email,
                    password: formData.password,
                    fullName: formData.fullName,
                    role: formData.role,
                    department: formData.department,
                }
                if (formData.role === 'student') {
                    payload.rollNumber = formData.rollNumber
                    payload.year = formData.year
                }
                if (formData.role === 'mentor') {
                    payload.employeeId = formData.employeeId
                    payload.designation = formData.designation
                    payload.specialization = formData.specialization
                }
                await userAPI.createUser(payload)
                showSuccess('User created successfully!')
            } else {
                // Edit
                const payload = {
                    fullName: formData.fullName,
                    department: formData.department,
                    role: formData.role,
                }
                if (formData.role === 'student') {
                    payload.rollNumber = formData.rollNumber
                    payload.year = formData.year
                }
                if (formData.role === 'mentor') {
                    payload.employeeId = formData.employeeId
                    payload.designation = formData.designation
                    payload.specialization = formData.specialization
                }
                await userAPI.updateUser(editingUser.id, payload)
                showSuccess('User updated successfully!')
            }
            setShowModal(false)
            await loadUsers()
        } catch (error) {
            setFormError(error.message || 'Operation failed')
        }
        setSaving(false)
    }

    // Delete user
    const confirmDelete = (user) => {
        setDeletingUser(user)
        setShowDeleteModal(true)
    }

    const handleDelete = async () => {
        if (!deletingUser) return
        setDeleting(true)
        try {
            await userAPI.deleteUser(deletingUser.id)
            showSuccess(`${deletingUser.fullName} deleted successfully`)
            setShowDeleteModal(false)
            setDeletingUser(null)
            await loadUsers()
        } catch (error) {
            console.error('Delete error:', error)
        }
        setDeleting(false)
    }

    const showSuccess = (msg) => {
        setSuccessMsg(msg)
        setTimeout(() => setSuccessMsg(''), 3000)
    }

    const handleViewStudent = (user) => {
        if (user.role === 'student') {
            navigate(`/mentor/student/${user.id}`)
        }
    }

    const handleApproveMentor = async (user) => {
        try {
            await userAPI.approveMentor(user.id)
            setSuccessMsg(`${user.fullName} has been approved as a mentor!`)
            setTimeout(() => setSuccessMsg(''), 3000)
            loadUsers()
        } catch (error) {
            console.error('Error approving mentor:', error)
        }
    }

    const handleRejectMentor = async (user) => {
        if (!window.confirm(`Are you sure you want to reject ${user.fullName}'s mentor registration? This will delete their account.`)) return
        try {
            await userAPI.rejectMentor(user.id)
            setSuccessMsg(`${user.fullName}'s registration has been rejected.`)
            setTimeout(() => setSuccessMsg(''), 3000)
            loadUsers()
        } catch (error) {
            console.error('Error rejecting mentor:', error)
        }
    }

    return (
        <DashboardLayout role="admin">
            <div className="admin-page">
                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1 className="admin-title">User Management</h1>
                        <p className="admin-subtitle">Manage students, mentors, and administrators</p>
                    </div>
                    <Button variant="primary" icon={<Plus size={18} />} onClick={openAddModal}>
                        Add User
                    </Button>
                </div>

                {/* Success Toast */}
                {successMsg && (
                    <div className="success-toast">
                        <Check size={18} />
                        {successMsg}
                    </div>
                )}

                {/* Role Summary Cards */}
                <div className="role-summary-cards">
                    <div className={`role-card ${roleFilter === '' ? 'active' : ''}`} onClick={() => { setRoleFilter(''); setPage(1) }}>
                        <div className="role-card-icon all"><Users size={20} /></div>
                        <div>
                            <span className="role-card-count">{users.length}</span>
                            <span className="role-card-label">All Users</span>
                        </div>
                    </div>
                    <div className={`role-card ${roleFilter === 'student' ? 'active' : ''}`} onClick={() => { setRoleFilter('student'); setPage(1) }}>
                        <div className="role-card-icon student"><GraduationCap size={20} /></div>
                        <div>
                            <span className="role-card-count">{studentCount}</span>
                            <span className="role-card-label">Students</span>
                        </div>
                    </div>
                    <div className={`role-card ${roleFilter === 'mentor' ? 'active' : ''}`} onClick={() => { setRoleFilter('mentor'); setPage(1) }}>
                        <div className="role-card-icon mentor"><UserCheck size={20} /></div>
                        <div>
                            <span className="role-card-count">{mentorCount}</span>
                            <span className="role-card-label">Mentors</span>
                        </div>
                        {pendingCount > 0 && <span className="pending-badge">{pendingCount} pending</span>}
                    </div>
                    <div className={`role-card ${roleFilter === 'admin' ? 'active' : ''}`} onClick={() => { setRoleFilter('admin'); setPage(1) }}>
                        <div className="role-card-icon admin"><Shield size={20} /></div>
                        <div>
                            <span className="role-card-count">{adminCount}</span>
                            <span className="role-card-label">Admins</span>
                        </div>
                    </div>
                </div>

                {/* Pending Mentor Approvals */}
                {pendingCount > 0 && (
                    <Card className="pending-mentors-card">
                        <CardHeader>
                            <CardTitle>
                                <Clock size={20} />
                                Pending Mentor Approvals ({pendingCount})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="pending-mentors-list">
                                {pendingMentors.map(mentor => (
                                    <div key={mentor.id} className="pending-mentor-row">
                                        <div className="pending-mentor-info">
                                            <div className="user-avatar role-mentor">
                                                {mentor.fullName?.charAt(0) || 'M'}
                                            </div>
                                            <div>
                                                <span className="user-name">{mentor.fullName}</span>
                                                <span className="user-email">{mentor.email}</span>
                                                {mentor.employeeId && <span className="user-meta">ID: {mentor.employeeId}</span>}
                                                {mentor.department && <span className="user-meta">Dept: {mentor.department.toUpperCase()}</span>}
                                                {mentor.designation && <span className="user-meta">{mentor.designation.replace(/_/g, ' ')}</span>}
                                            </div>
                                        </div>
                                        <div className="pending-mentor-actions">
                                            <button
                                                className="approve-btn"
                                                onClick={() => handleApproveMentor(mentor)}
                                                title="Approve"
                                            >
                                                <CheckCircle size={18} />
                                                Approve
                                            </button>
                                            <button
                                                className="reject-btn"
                                                onClick={() => handleRejectMentor(mentor)}
                                                title="Reject"
                                            >
                                                <XCircle size={18} />
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <div className="user-filters">
                    <Input
                        placeholder="Search by name, email, roll number..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
                    />
                    <Select
                        options={DEPARTMENTS}
                        value={deptFilter}
                        onChange={(e) => { setDeptFilter(e.target.value); setPage(1) }}
                        placeholder="All Departments"
                    />
                </div>

                {/* Users Table */}
                <Card className="users-table-card">
                    <CardContent>
                        {loading ? (
                            <div className="table-loading">Loading users...</div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="table-empty">
                                <Users size={40} />
                                <p>No users found matching your filters</p>
                            </div>
                        ) : (
                            <>
                                <div className="users-table">
                                    <div className="users-table-header">
                                        <span>User</span>
                                        <span>Role</span>
                                        <span>Department</span>
                                        <span>Growth Score</span>
                                        <span>Actions</span>
                                    </div>
                                    {paginatedUsers.map((user) => (
                                        <div key={user.id} className="users-table-row">
                                            <div className="user-cell">
                                                <div className={`user-avatar role-${user.role}`}>
                                                    {user.fullName?.charAt(0) || 'U'}
                                                </div>
                                                <div className="user-info">
                                                    <span className="user-name">{user.fullName}</span>
                                                    <span className="user-email">{user.email}</span>
                                                    {user.rollNumber && <span className="user-meta">{user.rollNumber}</span>}
                                                    {user.employeeId && <span className="user-meta">ID: {user.employeeId}</span>}
                                                </div>
                                            </div>
                                            <div>
                                                <Badge
                                                    variant={user.role === 'admin' ? 'accent' : user.role === 'mentor' ? 'secondary' : 'primary'}
                                                >
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Badge>
                                                {user.role === 'mentor' && user.isApproved === false && (
                                                    <Badge variant="warning" style={{ marginLeft: '4px', fontSize: '10px' }}>
                                                        Pending
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="dept-cell">{user.department?.toUpperCase() || '—'}</span>
                                            <div className="score-cell">
                                                {user.role === 'student' ? (
                                                    <span className={`score-badge ${(user.growthScore || 0) >= 70 ? 'good' : (user.growthScore || 0) >= 40 ? 'avg' : 'low'}`}>
                                                        {user.growthScore || 0}
                                                    </span>
                                                ) : (
                                                    <span className="na-text">—</span>
                                                )}
                                            </div>
                                            <div className="actions-cell">
                                                {user.role === 'mentor' && user.isApproved === false && (
                                                    <>
                                                        <button className="action-btn approve" title="Approve Mentor" onClick={() => handleApproveMentor(user)}>
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button className="action-btn reject" title="Reject Mentor" onClick={() => handleRejectMentor(user)}>
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                {user.role === 'student' && (
                                                    <button className="action-btn view" title="View Dashboard" onClick={() => handleViewStudent(user)}>
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                                <button className="action-btn edit" title="Edit" onClick={() => openEditModal(user)}>
                                                    <Edit2 size={16} />
                                                </button>
                                                {user.id !== userData?.id && (
                                                    <button className="action-btn delete" title="Delete" onClick={() => confirmDelete(user)}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="table-pagination">
                                    <span className="pagination-info">
                                        Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filteredUsers.length)} of {filteredUsers.length}
                                    </span>
                                    <div className="pagination-btns">
                                        <button
                                            className="page-btn"
                                            disabled={page <= 1}
                                            onClick={() => setPage(p => p - 1)}
                                        >
                                            <ChevronLeft size={16} /> Prev
                                        </button>
                                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            let pageNum = i + 1
                                            if (totalPages > 5) {
                                                if (page <= 3) pageNum = i + 1
                                                else if (page >= totalPages - 2) pageNum = totalPages - 4 + i
                                                else pageNum = page - 2 + i
                                            }
                                            return (
                                                <button
                                                    key={pageNum}
                                                    className={`page-btn ${page === pageNum ? 'active' : ''}`}
                                                    onClick={() => setPage(pageNum)}
                                                >
                                                    {pageNum}
                                                </button>
                                            )
                                        })}
                                        <button
                                            className="page-btn"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage(p => p + 1)}
                                        >
                                            Next <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                {formError && (
                                    <div className="form-error">
                                        <AlertTriangle size={16} />
                                        {formError}
                                    </div>
                                )}
                                <Input
                                    label="Full Name"
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Enter full name"
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="user@university.edu"
                                    disabled={modalMode === 'edit'}
                                />
                                {modalMode === 'add' && (
                                    <Input
                                        label="Password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Min 6 characters"
                                    />
                                )}
                                <Select
                                    label="Role"
                                    required
                                    options={[
                                        { value: 'student', label: 'Student' },
                                        { value: 'mentor', label: 'Mentor' },
                                        { value: 'admin', label: 'Admin' },
                                    ]}
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                />
                                <Select
                                    label="Department"
                                    options={DEPARTMENTS.filter(d => d.value !== '')}
                                    value={formData.department}
                                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                                    placeholder="Select department"
                                />

                                {/* Student fields */}
                                {formData.role === 'student' && (
                                    <div className="form-row">
                                        <Input
                                            label="Roll Number"
                                            value={formData.rollNumber}
                                            onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                                            placeholder="e.g., 22CSE101"
                                        />
                                        <Select
                                            label="Year"
                                            options={[
                                                { value: '1', label: '1st Year' },
                                                { value: '2', label: '2nd Year' },
                                                { value: '3', label: '3rd Year' },
                                                { value: '4', label: '4th Year' },
                                            ]}
                                            value={formData.year}
                                            onChange={e => setFormData({ ...formData, year: e.target.value })}
                                            placeholder="Select year"
                                        />
                                    </div>
                                )}

                                {/* Mentor fields */}
                                {formData.role === 'mentor' && (
                                    <>
                                        <Input
                                            label="Employee ID"
                                            value={formData.employeeId}
                                            onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                                            placeholder="e.g., EMP001"
                                        />
                                        <div className="form-row">
                                            <Input
                                                label="Designation"
                                                value={formData.designation}
                                                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                                                placeholder="e.g., Assistant Professor"
                                            />
                                            <Input
                                                label="Specialization"
                                                value={formData.specialization}
                                                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                                placeholder="e.g., Machine Learning"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer">
                                <Button variant="outline" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                                <Button variant="primary" type="submit" disabled={saving}>
                                    {saving ? 'Saving...' : modalMode === 'add' ? 'Create User' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && deletingUser && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content modal-sm" onClick={e => e.stopPropagation()}>
                        <div className="modal-header delete-header">
                            <h2>Delete User</h2>
                            <button className="modal-close" onClick={() => setShowDeleteModal(false)}><X size={20} /></button>
                        </div>
                        <div className="modal-body">
                            <div className="delete-confirm">
                                <div className="delete-icon-wrap">
                                    <AlertTriangle size={32} />
                                </div>
                                <p>Are you sure you want to delete <strong>{deletingUser.fullName}</strong>?</p>
                                <p className="delete-warning">This action cannot be undone. All data associated with this user will be permanently removed.</p>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                            <Button variant="primary" className="btn-danger" onClick={handleDelete} disabled={deleting}>
                                {deleting ? 'Deleting...' : 'Delete User'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
