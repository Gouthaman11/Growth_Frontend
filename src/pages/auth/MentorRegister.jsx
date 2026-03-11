import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Briefcase, Building, Clock, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import './Auth.css'

export default function MentorRegister() {
    const navigate = useNavigate()
    const { registerMentor } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [pendingApproval, setPendingApproval] = useState(false)

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        employeeId: '',
        password: '',
        confirmPassword: '',
        department: '',
        designation: '',
        specialization: ''
    })

    const departments = [
        { value: 'cse', label: 'Computer Science & Engineering' },
        { value: 'it', label: 'Information Technology' },
        { value: 'ece', label: 'Electronics & Communication' },
        { value: 'eee', label: 'Electrical & Electronics' },
        { value: 'mech', label: 'Mechanical Engineering' },
        { value: 'civil', label: 'Civil Engineering' },
    ]

    const designations = [
        { value: 'assistant_professor', label: 'Assistant Professor' },
        { value: 'associate_professor', label: 'Associate Professor' },
        { value: 'professor', label: 'Professor' },
        { value: 'hod', label: 'Head of Department' },
        { value: 'placement_officer', label: 'Placement Officer' },
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const response = await registerMentor(formData.email, formData.password, {
                fullName: formData.fullName,
                employeeId: formData.employeeId,
                department: formData.department,
                designation: formData.designation,
                specialization: formData.specialization
            })
            
            if (response.pending) {
                setPendingApproval(true)
            } else {
                navigate('/mentor/dashboard', { replace: true })
            }
        } catch (err) {
            console.error(err)
            if (err.code === 'auth/email-already-in-use') {
                setError('Email is already registered')
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email address')
            } else {
                setError('Failed to create account. Please try again.')
            }
        }

        setLoading(false)
    }

    return (
        <div className="auth-page">
            <div className="auth-bg">
                <div className="auth-gradient"></div>
                <div className="auth-pattern"></div>
            </div>

            {pendingApproval ? (
                <div className="auth-container">
                    <Link to="/" className="auth-logo">
                        <div className="auth-logo-icon">
                            <svg viewBox="0 0 40 40" fill="none">
                                <circle cx="20" cy="20" r="18" fill="url(#mentorLogoGradient2)" />
                                <path d="M12 22 L18 28 L28 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                <defs>
                                    <linearGradient id="mentorLogoGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#1a365d" />
                                        <stop offset="100%" stopColor="#10b981" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <span className="auth-logo-text">EduGrow<span className="auth-logo-plus">+</span></span>
                    </Link>

                    <div className="auth-content auth-form-container">
                        <div className="pending-approval-container">
                            <div className="pending-approval-icon">
                                <Clock size={48} />
                            </div>
                            <h1 className="auth-title">Registration Submitted!</h1>
                            <p className="pending-approval-message">
                                Your mentor account has been created successfully. It is now <strong>pending admin approval</strong>.
                            </p>
                            <p className="pending-approval-info">
                                An administrator will review your registration and approve your account. You will be able to log in once your account has been approved.
                            </p>
                            <div className="pending-approval-steps">
                                <div className="approval-step completed">
                                    <CheckCircle size={20} />
                                    <span>Account Created</span>
                                </div>
                                <div className="approval-step active">
                                    <Clock size={20} />
                                    <span>Waiting for Admin Approval</span>
                                </div>
                                <div className="approval-step">
                                    <Lock size={20} />
                                    <span>Login & Access Dashboard</span>
                                </div>
                            </div>
                            <Link to="/auth/login">
                                <Button variant="primary" size="lg" fullWidth>
                                    Go to Login
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
            <div className="auth-container auth-container-wide">
                <Link to="/" className="auth-logo">
                    <div className="auth-logo-icon">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" fill="url(#mentorLogoGradient)" />
                            <path d="M12 22 L18 28 L28 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 10 L20 18" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <circle cx="20" cy="8" r="2" fill="white" />
                            <defs>
                                <linearGradient id="mentorLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#1a365d" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="auth-logo-text">EduGrow<span className="auth-logo-plus">+</span></span>
                </Link>

                <div className="auth-content auth-form-container register-form">
                    <div className="auth-header">
                        <h1 className="auth-title">Mentor Registration</h1>
                        <p className="auth-subtitle">Join EduGrow+ to guide and mentor students</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <Input
                                label="Full Name"
                                type="text"
                                placeholder="Enter your full name"
                                icon={<User size={20} />}
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                required
                            />
                            <Input
                                label="Employee ID"
                                type="text"
                                placeholder="e.g., EMP-CSE-001"
                                icon={<Briefcase size={20} />}
                                value={formData.employeeId}
                                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                                required
                            />
                        </div>

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="your.email@university.edu"
                            icon={<Mail size={20} />}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />

                        <div className="form-grid">
                            <Select
                                label="Department"
                                options={departments}
                                placeholder="Select department"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                required
                            />
                            <Select
                                label="Designation"
                                options={designations}
                                placeholder="Select designation"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                required
                            />
                        </div>

                        <Input
                            label="Specialization"
                            type="text"
                            placeholder="e.g., Machine Learning, Web Development"
                            icon={<Building size={20} />}
                            value={formData.specialization}
                            onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        />

                        <div className="form-grid">
                            <div className="password-input-wrapper">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a password"
                                    icon={<Lock size={20} />}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <Input
                                label="Confirm Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm password"
                                icon={<Lock size={20} />}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>

                        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                            Create Mentor Account
                        </Button>
                    </form>

                    <p className="auth-footer-text">
                        Already have an account?{' '}
                        <Link to="/auth/login" className="auth-link">Log in</Link>
                    </p>
                    <p className="auth-footer-text">
                        Are you a student?{' '}
                        <Link to="/auth/register" className="auth-link">Register as Student</Link>
                    </p>
                </div>
            </div>
            )}
        </div>
    )
}
