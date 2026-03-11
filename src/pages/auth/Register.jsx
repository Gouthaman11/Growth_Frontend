import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, Github, Code2, Briefcase, Globe, CheckCircle2, RefreshCw, BookOpen, GraduationCap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Select } from '../../components/ui/Input'
import './Auth.css'

export default function Register() {
    const navigate = useNavigate()
    const { registerStudent } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        collegeEmail: '',
        rollNumber: '',
        password: '',
        confirmPassword: '',
        department: '',
        year: '',
        cgpa: '',
        sgpa: '',
        github: '',
        leetcode: '',
        hackerrank: '',
        linkedin: '',
        portfolio: '',
        consent: false
    })

    const departments = [
        { value: 'cse', label: 'Computer Science & Engineering' },
        { value: 'it', label: 'Information Technology' },
        { value: 'ece', label: 'Electronics & Communication' },
        { value: 'eee', label: 'Electrical & Electronics' },
        { value: 'mech', label: 'Mechanical Engineering' },
        { value: 'civil', label: 'Civil Engineering' },
    ]

    const years = [
        { value: '1', label: '1st Year' },
        { value: '2', label: '2nd Year' },
        { value: '3', label: '3rd Year' },
        { value: '4', label: '4th Year' },
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (currentStep === 1) {
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match')
                return
            }
            if (formData.password.length < 6) {
                setError('Password must be at least 6 characters')
                return
            }
            setCurrentStep(2)
            return
        }

        if (currentStep === 2) {
            setCurrentStep(3)
            return
        }

        // Final submission
        if (!formData.consent) {
            setError('Please accept the privacy policy')
            return
        }

        setLoading(true)

        try {
            await registerStudent(formData.email, formData.password, {
                fullName: formData.fullName,
                collegeEmail: formData.collegeEmail,
                rollNumber: formData.rollNumber,
                department: formData.department,
                year: formData.year,
                cgpa: parseFloat(formData.cgpa) || 0,
                sgpa: parseFloat(formData.sgpa) || 0,
                github: formData.github,
                leetcode: formData.leetcode,
                hackerrank: formData.hackerrank,
                linkedin: formData.linkedin,
                portfolio: formData.portfolio
            })
            navigate('/student/dashboard', { replace: true })
        } catch (err) {
            console.error(err)
            const errorMessage = err.message || err.toString()
            
            if (errorMessage.includes('already exists') || errorMessage.includes('already in use')) {
                setError('Email is already in use. Please use a different email or login.')
                setCurrentStep(1)
            } else if (errorMessage.includes('Invalid email')) {
                setError('Invalid email address')
                setCurrentStep(1)
            } else if (errorMessage.includes('password')) {
                setError('Password must be at least 6 characters')
                setCurrentStep(1)
            } else {
                setError(errorMessage || 'Failed to create account. Please try again.')
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

            <div className="auth-container auth-container-wide">
                <Link to="/" className="auth-logo">
                    <div className="auth-logo-icon">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" fill="url(#registerLogoGradient)" />
                            <path d="M12 22 L18 28 L28 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 10 L20 18" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <circle cx="20" cy="8" r="2" fill="white" />
                            <defs>
                                <linearGradient id="registerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                        <h1 className="auth-title">Student Registration</h1>
                        <p className="auth-subtitle">Join EduGrow+ to track your growth journey</p>
                    </div>

                    {/* Progress Steps */}
                    <div className="register-steps">
                        <div className={`register-step ${currentStep >= 1 ? 'active' : ''}`}>
                            <div className="register-step-number">1</div>
                            <span>Basic Info</span>
                        </div>
                        <div className="register-step-line"></div>
                        <div className={`register-step ${currentStep >= 2 ? 'active' : ''}`}>
                            <div className="register-step-number">2</div>
                            <span>Academics</span>
                        </div>
                        <div className="register-step-line"></div>
                        <div className={`register-step ${currentStep >= 3 ? 'active' : ''}`}>
                            <div className="register-step-number">3</div>
                            <span>Coding Profiles</span>
                        </div>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {/* Step 1: Basic Info */}
                        {currentStep === 1 && (
                            <div className="form-step animate-fade-in">
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
                                        label="Roll Number"
                                        type="text"
                                        placeholder="e.g., 7376231CS001"
                                        value={formData.rollNumber}
                                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Email Address"
                                    type="email"
                                    placeholder="your.email@gmail.com"
                                    icon={<Mail size={20} />}
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />

                                <Input
                                    label="College Email ID"
                                    type="email"
                                    placeholder="your.name@college.edu"
                                    icon={<Mail size={20} />}
                                    value={formData.collegeEmail}
                                    onChange={(e) => setFormData({ ...formData, collegeEmail: e.target.value })}
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
                                        label="Year"
                                        options={years}
                                        placeholder="Select year"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        required
                                    />
                                </div>

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

                                <Button type="submit" variant="primary" size="lg" fullWidth>
                                    Continue to Academics
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Academics */}
                        {currentStep === 2 && (
                            <div className="form-step animate-fade-in">
                                <p className="form-step-description">
                                    Enter your academic details to track your progress
                                </p>

                                <div className="form-grid">
                                    <Input
                                        label="Current CGPA"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        placeholder="e.g., 8.5"
                                        icon={<GraduationCap size={20} />}
                                        value={formData.cgpa}
                                        onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                                    />
                                    <Input
                                        label="Current SGPA"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="10"
                                        placeholder="e.g., 8.8"
                                        icon={<BookOpen size={20} />}
                                        value={formData.sgpa}
                                        onChange={(e) => setFormData({ ...formData, sgpa: e.target.value })}
                                    />
                                </div>

                                <div className="academic-info-box">
                                    <h4>📊 Why we need this?</h4>
                                    <p>Your academic scores help us calculate your overall growth score and provide personalized recommendations for improvement.</p>
                                </div>

                                <div className="form-actions">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setCurrentStep(1)}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" variant="primary" size="lg">
                                        Continue to Coding Profiles
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Coding Profiles */}
                        {currentStep === 3 && (
                            <div className="form-step animate-fade-in">
                                <p className="form-step-description">
                                    Connect your coding profiles to automatically track your progress
                                </p>

                                <div className="coding-profile-inputs">
                                    <div className="coding-profile-input">
                                        <div className="coding-profile-label">
                                            <Github size={20} />
                                            <span>GitHub Username</span>
                                        </div>
                                        <Input
                                            placeholder="e.g., johndoe (without github.com/)"
                                            value={formData.github}
                                            onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                                        />
                                    </div>

                                    <div className="coding-profile-input">
                                        <div className="coding-profile-label">
                                            <Code2 size={20} />
                                            <span>LeetCode Username</span>
                                        </div>
                                        <Input
                                            placeholder="e.g., john_doe"
                                            value={formData.leetcode}
                                            onChange={(e) => setFormData({ ...formData, leetcode: e.target.value })}
                                        />
                                    </div>

                                    <div className="coding-profile-input">
                                        <div className="coding-profile-label">
                                            <Code2 size={20} />
                                            <span>HackerRank Username</span>
                                        </div>
                                        <Input
                                            placeholder="e.g., johndoe_dev"
                                            value={formData.hackerrank}
                                            onChange={(e) => setFormData({ ...formData, hackerrank: e.target.value })}
                                        />
                                    </div>

                                    <div className="coding-profile-input">
                                        <div className="coding-profile-label">
                                            <Briefcase size={20} />
                                            <span>LinkedIn Profile URL</span>
                                        </div>
                                        <Input
                                            placeholder="e.g., linkedin.com/in/johndoe"
                                            value={formData.linkedin}
                                            onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                                        />
                                    </div>

                                    <div className="coding-profile-input">
                                        <div className="coding-profile-label">
                                            <Globe size={20} />
                                            <span>Portfolio Website</span>
                                        </div>
                                        <Input
                                            placeholder="e.g., johndoe.dev"
                                            value={formData.portfolio}
                                            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <label className="checkbox-wrapper consent-checkbox">
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        checked={formData.consent}
                                        onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
                                        required
                                    />
                                    <span className="checkbox-label">
                                        I agree to the <Link to="#" className="auth-link">Privacy Policy</Link> and consent to data collection from linked platforms
                                    </span>
                                </label>

                                <div className="form-actions">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setCurrentStep(2)}
                                    >
                                        Back
                                    </Button>
                                    <Button type="submit" variant="primary" size="lg" loading={loading}>
                                        Create Account
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>

                    <p className="auth-footer-text">
                        Already have an account?{' '}
                        <Link to="/auth/login" className="auth-link">Log in</Link>
                    </p>
                    <p className="auth-footer-text">
                        Are you a mentor?{' '}
                        <Link to="/auth/mentor-register" className="auth-link">Register as Mentor</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
