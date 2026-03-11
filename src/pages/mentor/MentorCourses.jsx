import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { courseAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import {
    BookOpen, Plus, Trash2, Edit3, Save, X, RefreshCw, Search, GraduationCap, Hash, Layers, Award
} from 'lucide-react'
import './MentorCourses.css'

const CATEGORIES = ['Core', 'Elective', 'Lab', 'Project', 'Other']
const DEPARTMENTS = [
    { value: 'cse', label: 'Computer Science & Engineering' },
    { value: 'it', label: 'Information Technology' },
    { value: 'ece', label: 'Electronics & Communication' },
    { value: 'eee', label: 'Electrical & Electronics' },
    { value: 'mech', label: 'Mechanical Engineering' },
    { value: 'civil', label: 'Civil Engineering' },
]

export default function MentorCourses() {
    const { userData } = useAuth()
    const [courses, setCourses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [saving, setSaving] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterDept, setFilterDept] = useState(userData?.department || '')
    const [form, setForm] = useState({
        title: '', code: '', description: '', department: userData?.department || '',
        credits: '3', category: 'Core'
    })

    useEffect(() => { loadCourses() }, [filterDept])

    const loadCourses = async () => {
        try {
            setLoading(true)
            const data = await courseAPI.getCourses(filterDept || undefined)
            setCourses(data)
        } catch (err) {
            console.error('Load courses error:', err)
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setForm({ title: '', code: '', description: '', department: userData?.department || '', credits: '3', category: 'Core' })
        setEditingId(null)
        setShowForm(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.title.trim() || !form.department.trim()) return
        setSaving(true)
        try {
            const payload = {
                ...form,
                credits: form.credits ? parseInt(form.credits) : 3
            }
            if (editingId) {
                await courseAPI.updateCourse(editingId, payload)
            } else {
                await courseAPI.createCourse(payload)
            }
            resetForm()
            loadCourses()
        } catch (err) {
            alert(err.message || 'Failed to save course')
        } finally {
            setSaving(false)
        }
    }

    const handleEdit = (course) => {
        setForm({
            title: course.title, code: course.code || '', description: course.description || '',
            department: course.department,
            credits: course.credits?.toString() || '3', category: course.category || 'Core'
        })
        setEditingId(course.id)
        setShowForm(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this course? Student progress for this course will also be removed.')) return
        try {
            await courseAPI.deleteCourse(id)
            loadCourses()
        } catch (err) {
            alert(err.message || 'Failed to delete')
        }
    }

    const filtered = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    const departments = [...new Set(courses.map(c => c.department))].filter(Boolean)

    return (
        <DashboardLayout role="mentor">
            <div className="mc-page">
                <div className="mc-header">
                    <div className="mc-header-left">
                        <div className="mc-header-icon"><BookOpen size={28} /></div>
                        <div>
                            <h1 className="mc-title">Course Management</h1>
                            <p className="mc-subtitle">Add courses for your department students</p>
                        </div>
                    </div>
                    <div className="mc-header-actions">
                        <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={loadCourses}>Refresh</Button>
                        <Button variant="primary" icon={<Plus size={16} />} onClick={() => { resetForm(); setShowForm(true) }}>
                            Add Course
                        </Button>
                    </div>
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <Card className="mc-form-card" variant="elevated">
                        <CardHeader>
                            <CardTitle>
                                {editingId ? <><Edit3 size={18} /> Edit Course</> : <><Plus size={18} /> New Course</>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="mc-form">
                                <div className="mc-form-grid">
                                    <Input label="Course Title *" value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="e.g., Data Structures & Algorithms" required />
                                    <Input label="Course Code" value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                        placeholder="e.g., CS201" />
                                    <div className="mc-select-wrap">
                                        <label className="mc-label">Department *</label>
                                        <select className="mc-select" value={form.department}
                                            onChange={(e) => setForm({ ...form, department: e.target.value })} required>
                                            <option value="">Select Department</option>
                                            {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                        </select>
                                    </div>
                                    <Input label="Credits" type="number" min="1" max="10" value={form.credits}
                                        onChange={(e) => setForm({ ...form, credits: e.target.value })}
                                        placeholder="3" />
                                    <div className="mc-select-wrap">
                                        <label className="mc-label">Category</label>
                                        <select className="mc-select" value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="mc-form-desc">
                                    <label className="mc-label">Description</label>
                                    <textarea className="mc-textarea" rows={3} value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        placeholder="Brief course description..." />
                                </div>
                                <div className="mc-form-actions">
                                    <Button variant="secondary" type="button" onClick={resetForm}><X size={14} /> Cancel</Button>
                                    <Button variant="primary" type="submit" disabled={saving}>
                                        <Save size={14} /> {saving ? 'Saving...' : editingId ? 'Update Course' : 'Create Course'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Filters */}
                <div className="mc-filters">
                    <div className="mc-search-wrap">
                        <Search size={16} />
                        <input className="mc-search" placeholder="Search courses..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="mc-dept-filters">
                        <button className={`mc-dept-btn ${filterDept === '' ? 'active' : ''}`}
                            onClick={() => setFilterDept('')}>All</button>
                        {departments.map(d => (
                            <button key={d} className={`mc-dept-btn ${filterDept === d ? 'active' : ''}`}
                                onClick={() => setFilterDept(d)}>{d}</button>
                        ))}
                        {userData?.department && !departments.includes(userData.department) && (
                            <button className={`mc-dept-btn ${filterDept === userData.department ? 'active' : ''}`}
                                onClick={() => setFilterDept(userData.department)}>{userData.department}</button>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="mc-stats">
                    <div className="mc-stat"><Layers size={18} /><span>{filtered.length}</span><span>Total Courses</span></div>
                    <div className="mc-stat"><GraduationCap size={18} /><span>{filtered.filter(c => c.category === 'Core').length}</span><span>Core</span></div>
                    <div className="mc-stat"><Award size={18} /><span>{filtered.filter(c => c.category === 'Elective').length}</span><span>Elective</span></div>
                    <div className="mc-stat"><Hash size={18} /><span>{[...new Set(filtered.map(c => c.department))].length}</span><span>Departments</span></div>
                </div>

                {/* Course List */}
                {loading ? (
                    <div className="mc-loading"><RefreshCw className="spin" size={24} /><p>Loading courses...</p></div>
                ) : filtered.length === 0 ? (
                    <div className="mc-empty">
                        <BookOpen size={48} />
                        <h3>No courses yet</h3>
                        <p>Click "Add Course" to create courses for your department</p>
                    </div>
                ) : (
                    <div className="mc-grid">
                        {filtered.map(course => (
                            <Card key={course.id} className="mc-card" variant="default">
                                <CardContent>
                                    <div className="mc-card-top">
                                        <div className="mc-card-info">
                                            <div className="mc-card-title-row">
                                                <h3 className="mc-card-title">{course.title}</h3>
                                                <Badge variant={
                                                    course.category === 'Core' ? 'primary' :
                                                    course.category === 'Lab' ? 'warning' :
                                                    course.category === 'Elective' ? 'success' : 'secondary'
                                                }>{course.category}</Badge>
                                            </div>
                                            {course.code && <span className="mc-card-code">{course.code}</span>}
                                            {course.description && <p className="mc-card-desc">{course.description}</p>}
                                        </div>
                                    </div>
                                    <div className="mc-card-meta">
                                        <span><GraduationCap size={14} /> {course.department}</span>

                                        <span><Award size={14} /> {course.credits} Credits</span>
                                        {course.creator && <span>By {course.creator.fullName}</span>}
                                    </div>
                                    <div className="mc-card-actions">
                                        <button className="mc-action-btn mc-edit" onClick={() => handleEdit(course)}>
                                            <Edit3 size={14} /> Edit
                                        </button>
                                        <button className="mc-action-btn mc-delete" onClick={() => handleDelete(course.id)}>
                                            <Trash2 size={14} /> Delete
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
