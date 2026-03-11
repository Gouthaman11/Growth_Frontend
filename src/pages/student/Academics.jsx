import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { academicsAPI, courseAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import { BookOpen, Save, TrendingUp, Calendar, Award, AlertCircle, RefreshCw, Layers, CheckCircle, Clock, Circle, Hash, GraduationCap } from 'lucide-react'
import './Academics.css'

const Academics = () => {
    const { userData } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    // Academic data state
    const [academicData, setAcademicData] = useState({
        cgpa: 0,
        sgpa: 0,
        attendance: 0,
        currentSemester: 1,
    })

    // Form state
    const [formCgpa, setFormCgpa] = useState('')
    const [formSgpa, setFormSgpa] = useState('')
    const [formAttendance, setFormAttendance] = useState('')
    const [formSemester, setFormSemester] = useState('')
    const [courses, setCourses] = useState([])
    const [coursesLoading, setCoursesLoading] = useState(false)
    const [updatingCourseId, setUpdatingCourseId] = useState(null)

    useEffect(() => {
        if (userData?.id) {
            loadData()
            loadCourses()
        }
    }, [userData])

    const loadData = async () => {
        try {
            setLoading(true)
            
            // Load academic data
            const dataRes = await academicsAPI.getData(userData.id)
            if (dataRes.success && dataRes.data) {
                setAcademicData(dataRes.data)
                // Pre-fill form with existing data
                setFormCgpa(dataRes.data.cgpa?.toString() || '')
                setFormSgpa(dataRes.data.sgpa?.toString() || '')
                setFormAttendance(dataRes.data.attendance?.toString() || '')
                setFormSemester(dataRes.data.currentSemester?.toString() || '1')
            }
        } catch (err) {
            console.error('Error loading data:', err)
        } finally {
            setLoading(false)
        }
    }

    const loadCourses = async () => {
        try {
            setCoursesLoading(true)
            setError('')
            const data = await courseAPI.getStudentCourses(userData.id)
            setCourses(data)
        } catch (err) {
            console.error('Error loading courses:', err)
            setError('Unable to load department courses. Please refresh and try again.')
        } finally {
            setCoursesLoading(false)
        }
    }

    const updateCourseStatus = async (courseId, status) => {
        setUpdatingCourseId(courseId)
        try {
            setError('')
            await courseAPI.updateStudentStatus(userData.id, courseId, status)
            setCourses(prev => prev.map(c => c.id === courseId ? { ...c, studentStatus: status } : c))
        } catch (err) {
            console.error('Error updating course status:', err)
            setError(err.message || 'Unable to update course status right now.')
        } finally {
            setUpdatingCourseId(null)
        }
    }

    const handleUpdateAcademics = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')

        // Validation
        const cgpaVal = parseFloat(formCgpa)
        const sgpaVal = parseFloat(formSgpa)
        const attVal = parseFloat(formAttendance)
        const semVal = parseInt(formSemester)
        
        if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 10) {
            setError('⚠️ CGPA must be between 0 and 10')
            return
        }
        if (isNaN(sgpaVal) || sgpaVal < 0 || sgpaVal > 10) {
            setError('⚠️ SGPA must be between 0 and 10')
            return
        }
        if (isNaN(attVal) || attVal < 0 || attVal > 100) {
            setError('⚠️ Attendance must be between 0 and 100')
            return
        }
        if (isNaN(semVal) || semVal < 1 || semVal > 8) {
            setError('⚠️ Semester must be between 1 and 8')
            return
        }

        try {
            setSaving(true)
            const res = await academicsAPI.updateData(userData.id, {
                cgpa: cgpaVal,
                sgpa: sgpaVal,
                attendance: attVal,
                currentSemester: semVal
            })

            if (res.success) {
                setSuccess('✅ Academic data updated successfully! Dashboard will refresh automatically.')
                setAcademicData(res.data)
                
                console.log('📊 Academic data saved:', res.data)
                
                // Signal dashboard to refresh - works across tabs
                localStorage.setItem('academics_updated', Date.now().toString())
                console.log('💾 localStorage flag set for cross-tab sync')
                
                // Dispatch custom event for same-tab communication
                const event = new CustomEvent('academicsUpdated', { 
                    detail: res.data 
                })
                window.dispatchEvent(event)
                console.log('📡 Custom event dispatched:', event)
                
                setTimeout(() => setSuccess(''), 3000)
            }
        } catch (err) {
            setError('❌ ' + (err.message || 'Failed to save data'))
        } finally {
            setSaving(false)
        }
    }

    const getGradeColor = (gpa) => {
        if (gpa >= 9.0) return '#10B981'
        if (gpa >= 8.0) return '#3B82F6'
        if (gpa >= 7.0) return '#F59E0B'
        if (gpa >= 6.0) return '#EF4444'
        return '#9CA3AF'
    }

    const getGradeLabel = (gpa) => {
        if (gpa >= 9.0) return '🌟 Excellent'
        if (gpa >= 8.0) return '✨ Very Good'
        if (gpa >= 7.0) return '👍 Good'
        if (gpa >= 6.0) return '📈 Average'
        if (gpa > 0) return '⚠️ Needs Improvement'
        return 'Not Set'
    }

    const getAttendanceStatus = (att) => {
        if (att >= 90) return { color: '#10B981', label: '🎯 Outstanding', variant: 'success' }
        if (att >= 75) return { color: '#3B82F6', label: '✅ Good', variant: 'primary' }
        if (att >= 65) return { color: '#F59E0B', label: '⚠️ Warning', variant: 'warning' }
        return { color: '#EF4444', label: '❌ Critical', variant: 'error' }
    }

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="academics-loading">
                    <RefreshCw className="spin" size={32} />
                    <p>Loading academic data...</p>
                </div>
            </DashboardLayout>
        )
    }

    const attStatus = getAttendanceStatus(academicData.attendance || 0)

    return (
        <DashboardLayout role="student">
            <div className="academics-page">
                <div className="academics-header">
                    <div>
                        <h1 className="dashboard-title">
                            <BookOpen size={32} />
                            Academic Performance
                        </h1>
                        <p className="dashboard-subtitle">Track and update your academic metrics</p>
                    </div>
                    <Button variant="secondary" icon={<RefreshCw size={18} />} onClick={loadData}>
                        Refresh
                    </Button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">
                        <Award size={20} />
                        {success}
                    </div>
                )}

                <div className="academics-grid">
                    {/* Academic Overview Cards */}
                    <div className="overview-cards">
                        <Card className="gpa-card cgpa-card" variant="elevated">
                            <CardContent>
                                <div className="gpa-header">
                                    <TrendingUp size={24} className="gpa-icon" />
                                    <span className="gpa-type">Cumulative GPA</span>
                                </div>
                                <div className="gpa-display">
                                    <div className="gpa-circle" style={{ borderColor: getGradeColor(academicData.cgpa) }}>
                                        <span className="gpa-value">{(academicData.cgpa || 0).toFixed(2)}</span>
                                        <span className="gpa-max">/ 10.0</span>
                                    </div>
                                </div>
                                <Badge 
                                    variant={academicData.cgpa >= 8 ? 'success' : academicData.cgpa >= 6.5 ? 'warning' : 'error'}
                                    className="gpa-badge"
                                >
                                    {getGradeLabel(academicData.cgpa)}
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="gpa-card sgpa-card" variant="elevated">
                            <CardContent>
                                <div className="gpa-header">
                                    <Calendar size={24} className="gpa-icon" />
                                    <span className="gpa-type">Semester GPA</span>
                                </div>
                                <div className="gpa-display">
                                    <div className="gpa-circle" style={{ borderColor: getGradeColor(academicData.sgpa) }}>
                                        <span className="gpa-value">{(academicData.sgpa || 0).toFixed(2)}</span>
                                        <span className="gpa-max">/ 10.0</span>
                                    </div>
                                </div>
                                <Badge 
                                    variant={academicData.sgpa >= 8 ? 'success' : academicData.sgpa >= 6.5 ? 'warning' : 'error'}
                                    className="gpa-badge"
                                >
                                    {getGradeLabel(academicData.sgpa)}
                                </Badge>
                            </CardContent>
                        </Card>

                        <Card className="attendance-card" variant="elevated">
                            <CardContent>
                                <div className="attendance-content">
                                    <div className="attendance-header-main">
                                        <Award size={24} className="attendance-icon" />
                                        <span className="attendance-type">Attendance</span>
                                    </div>
                                    <div className="attendance-value-display">
                                        <span className="attendance-percentage" style={{ color: attStatus.color }}>
                                            {(academicData.attendance || 0)}%
                                        </span>
                                    </div>
                                    <ProgressBar 
                                        value={academicData.attendance || 0} 
                                        max={100}
                                        variant={academicData.attendance >= 75 ? 'secondary' : 'warning'}
                                        size="lg"
                                    />
                                    <Badge variant={attStatus.variant} className="attendance-badge">
                                        {attStatus.label}
                                    </Badge>
                                    {academicData.attendance > 0 && academicData.attendance < 75 && (
                                        <p className="attendance-warning">
                                            <AlertCircle size={16} />
                                            Below 75% minimum requirement
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Update Form */}
                    <Card className="update-form-card" variant="default">
                        <CardHeader>
                            <CardTitle>
                                <Save size={20} />
                                Update Academic Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="form-description">
                                Manually update your academic metrics from your institution's portal
                            </p>
                            
                            <form onSubmit={handleUpdateAcademics} className="academic-form">
                                <div className="form-grid">
                                    <Input
                                        label="CGPA (Cumulative)"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        value={formCgpa}
                                        onChange={(e) => setFormCgpa(e.target.value)}
                                        placeholder="e.g., 8.50"
                                        required
                                    />
                                    <Input
                                        label="SGPA (Current Semester)"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        value={formSgpa}
                                        onChange={(e) => setFormSgpa(e.target.value)}
                                        placeholder="e.g., 8.75"
                                        required
                                    />
                                    <Input
                                        label="Attendance Percentage"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        value={formAttendance}
                                        onChange={(e) => setFormAttendance(e.target.value)}
                                        placeholder="e.g., 85.5"
                                        required
                                    />
                                    <Input
                                        label="Current Semester"
                                        type="number"
                                        min="1"
                                        max="8"
                                        value={formSemester}
                                        onChange={(e) => setFormSemester(e.target.value)}
                                        placeholder="e.g., 4"
                                        required
                                    />
                                </div>

                                <div className="form-actions">
                                    <Button 
                                        type="submit" 
                                        disabled={saving} 
                                        variant="primary"
                                        icon={<Save size={18} />}
                                        fullWidth
                                    >
                                        {saving ? 'Saving Changes...' : 'Save Academic Data'}
                                    </Button>
                                </div>
                            </form>

                            {academicData.lastSynced && (
                                <p className="last-updated">
                                    Last updated: {new Date(academicData.lastSynced).toLocaleString()}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Academic Summary */}
                    <Card className="summary-card" variant="default">
                        <CardHeader>
                            <CardTitle>
                                <Award size={20} />
                                Academic Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="summary-stats">
                                <div className="summary-stat">
                                    <span className="summary-label">Current Semester</span>
                                    <span className="summary-value">{academicData.currentSemester || 1}</span>
                                </div>
                                <div className="summary-stat">
                                    <span className="summary-label">CGPA Status</span>
                                    <span className="summary-value" style={{ color: getGradeColor(academicData.cgpa) }}>
                                        {getGradeLabel(academicData.cgpa)}
                                    </span>
                                </div>
                                <div className="summary-stat">
                                    <span className="summary-label">Attendance Status</span>
                                    <span className="summary-value" style={{ color: attStatus.color }}>
                                        {attStatus.label}
                                    </span>
                                </div>
                            </div>

                            <div className="performance-tips">
                                <h4>📚 Performance Tips</h4>
                                <ul>
                                    {academicData.cgpa < 7.0 && (
                                        <li>Focus on improving your CGPA through consistent study habits</li>
                                    )}
                                    {academicData.attendance < 75 && (
                                        <li>⚠️ Urgent: Improve attendance to meet minimum requirements</li>
                                    )}
                                    {academicData.cgpa >= 9.0 && (
                                        <li>🌟 Excellent performance! Keep up the outstanding work</li>
                                    )}
                                    {academicData.attendance >= 90 && (
                                        <li>🎯 Perfect attendance! This reflects great discipline</li>
                                    )}
                                    <li>Update your academic data regularly to track progress</li>
                                    <li>Sync your data with the student dashboard for comprehensive tracking</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Department Courses Section */}
                <Card className="courses-section-card" variant="default">
                    <CardHeader>
                        <CardTitle>
                            <Layers size={20} />
                            Department Courses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {coursesLoading ? (
                            <div className="courses-loading">
                                <RefreshCw className="spin" size={20} />
                                <span>Loading courses...</span>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="courses-empty">
                                <BookOpen size={36} />
                                <p>No courses assigned to your department yet</p>
                            </div>
                        ) : (
                            <>
                                <div className="courses-progress-bar">
                                    <div className="cp-stats">
                                        <span className="cp-stat cp-completed"><CheckCircle size={14} /> {courses.filter(c => c.studentStatus === 'completed').length} Completed</span>
                                        <span className="cp-stat cp-ongoing"><Clock size={14} /> {courses.filter(c => c.studentStatus === 'ongoing').length} Ongoing</span>
                                        <span className="cp-stat cp-notstarted"><Circle size={14} /> {courses.filter(c => c.studentStatus === 'not-started').length} Not Started</span>
                                    </div>
                                    <ProgressBar
                                        value={courses.filter(c => c.studentStatus === 'completed').length}
                                        max={courses.length}
                                        variant="secondary"
                                        size="sm"
                                    />
                                </div>
                                <div className="courses-list">
                                    {courses.map(course => (
                                        <div key={course.id} className={`course-item course-item-${course.studentStatus}`}>
                                            <div className="course-item-left">
                                                <div className="course-item-icon">
                                                    {course.studentStatus === 'completed' ? <CheckCircle size={18} /> :
                                                     course.studentStatus === 'ongoing' ? <Clock size={18} /> :
                                                     <Circle size={18} />}
                                                </div>
                                                <div className="course-item-info">
                                                    <h4 className="course-item-title">{course.title}</h4>
                                                    <div className="course-item-meta">
                                                        {course.code && <span><Hash size={12} />{course.code}</span>}
                                                        {course.semester && <span>Sem {course.semester}</span>}
                                                        <span>{course.credits} Credits</span>
                                                        <Badge variant={
                                                            course.category === 'Core' ? 'primary' :
                                                            course.category === 'Lab' ? 'warning' :
                                                            course.category === 'Elective' ? 'success' : 'secondary'
                                                        } size="sm">{course.category}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="course-item-right">
                                                <select
                                                    className={`course-status-select status-${course.studentStatus}`}
                                                    value={course.studentStatus}
                                                    onChange={(e) => updateCourseStatus(course.id, e.target.value)}
                                                    disabled={updatingCourseId === course.id}
                                                >
                                                    <option value="not-started">Not Started</option>
                                                    <option value="ongoing">Ongoing</option>
                                                    <option value="completed">Completed</option>
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}

export default Academics
