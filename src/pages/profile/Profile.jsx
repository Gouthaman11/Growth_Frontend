import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import {
    User,
    Mail,
    Phone,
    Lock,
    Save,
    GraduationCap,
    Briefcase,
    MapPin,
    Github,
    Code2,
    Award,
    Globe,
    Linkedin,
    Eye,
    EyeOff,
    CheckCircle,
    AlertCircle,
    RefreshCw
} from 'lucide-react'
import './Profile.css'

export default function Profile() {
    const { currentUser, userData, refreshUserData } = useAuth()
    const [activeTab, setActiveTab] = useState('general')
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState(null) // { type: 'success'|'error', text: '' }

    // General info form
    const [generalForm, setGeneralForm] = useState({
        fullName: '',
        collegeEmail: '',
        department: '',
        year: '',
        rollNumber: '',
        phone: '',
    })

    // Coding profiles form
    const [profilesForm, setProfilesForm] = useState({
        github: '',
        leetcode: '',
        hackerrank: '',
        linkedin: '',
        portfolio: '',
    })

    // Password form
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    })

    // Load user data into forms
    useEffect(() => {
        if (userData) {
            setGeneralForm({
                fullName: userData.fullName || '',
                collegeEmail: userData.collegeEmail || '',
                department: userData.department || '',
                year: userData.year || '',
                rollNumber: userData.rollNumber || '',
                phone: userData.phone || '',
            })
            setProfilesForm({
                github: userData.codingProfiles?.github || '',
                leetcode: userData.codingProfiles?.leetcode || '',
                hackerrank: userData.codingProfiles?.hackerrank || '',
                linkedin: userData.codingProfiles?.linkedin || '',
                portfolio: userData.codingProfiles?.portfolio || '',
            })
        }
    }, [userData])

    const showMessage = (type, text) => {
        setMessage({ type, text })
        setTimeout(() => setMessage(null), 4000)
    }

    const handleGeneralSave = async () => {
        setSaving(true)
        try {
            await userAPI.updateUser(currentUser.uid, {
                fullName: generalForm.fullName,
                collegeEmail: generalForm.collegeEmail,
                department: generalForm.department,
                year: generalForm.year,
                rollNumber: generalForm.rollNumber,
                phone: generalForm.phone,
            })
            if (refreshUserData) await refreshUserData()
            showMessage('success', 'Profile updated successfully!')
        } catch (error) {
            showMessage('error', error.message || 'Failed to update profile')
        }
        setSaving(false)
    }

    const handleProfilesSave = async () => {
        setSaving(true)
        try {
            await userAPI.updateCodingProfiles(currentUser.uid, profilesForm)
            if (refreshUserData) await refreshUserData()
            showMessage('success', 'Coding profiles updated successfully!')
        } catch (error) {
            showMessage('error', error.message || 'Failed to update profiles')
        }
        setSaving(false)
    }

    const handlePasswordSave = async () => {
        if (passwordForm.newPassword.length < 6) {
            showMessage('error', 'New password must be at least 6 characters')
            return
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showMessage('error', 'New passwords do not match')
            return
        }
        setSaving(true)
        try {
            await userAPI.changePassword(currentUser.uid, {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            })
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
            showMessage('success', 'Password changed successfully!')
        } catch (error) {
            showMessage('error', error.message || 'Failed to change password')
        }
        setSaving(false)
    }

    const getUserInitials = () => {
        if (userData?.fullName) {
            const names = userData.fullName.split(' ')
            return names.length > 1
                ? `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`
                : names[0].charAt(0)
        }
        return 'U'
    }

    const role = userData?.role || 'student'

    const tabs = [
        { id: 'general', label: 'General', icon: User },
        ...(role === 'student' ? [{ id: 'profiles', label: 'Coding Profiles', icon: Code2 }] : []),
        { id: 'security', label: 'Security', icon: Lock },
    ]

    return (
        <DashboardLayout role={role}>
            <div className="profile-page">
                {/* Toast Message */}
                {message && (
                    <div className={`profile-toast ${message.type}`}>
                        {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-header-left">
                        <div className="profile-avatar-lg">
                            <span>{getUserInitials()}</span>
                        </div>
                        <div className="profile-header-info">
                            <h1 className="profile-name">{userData?.fullName || 'User'}</h1>
                            <p className="profile-email">{currentUser?.email || ''}</p>
                            <div className="profile-meta">
                                <span className="profile-role-badge">{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                                {userData?.department && <span className="profile-dept">{userData.department}</span>}
                                {userData?.rollNumber && <span className="profile-roll">#{userData.rollNumber}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="profile-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="profile-content">

                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="profile-section">
                            <div className="profile-section-header">
                                <h2>Personal Information</h2>
                                <p>Update your account details and personal information</p>
                            </div>
                            <div className="profile-form">
                                <div className="profile-form-grid">
                                    <div className="profile-field">
                                        <label>
                                            <User size={14} />
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={generalForm.fullName}
                                            onChange={e => setGeneralForm({ ...generalForm, fullName: e.target.value })}
                                            placeholder="Enter your full name"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label>
                                            <Mail size={14} />
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={currentUser?.email || ''}
                                            disabled
                                            className="disabled"
                                        />
                                        <span className="field-hint">Email cannot be changed</span>
                                    </div>
                                    <div className="profile-field">
                                        <label>
                                            <Mail size={14} />
                                            College Email ID
                                        </label>
                                        <input
                                            type="email"
                                            value={generalForm.collegeEmail}
                                            onChange={e => setGeneralForm({ ...generalForm, collegeEmail: e.target.value })}
                                            placeholder="your.name@college.edu"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label>
                                            <Phone size={14} />
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={generalForm.phone}
                                            onChange={e => setGeneralForm({ ...generalForm, phone: e.target.value })}
                                            placeholder="Enter your phone number"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label>
                                            <MapPin size={14} />
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            value={generalForm.department}
                                            onChange={e => setGeneralForm({ ...generalForm, department: e.target.value })}
                                            placeholder="e.g., Computer Science"
                                        />
                                    </div>
                                    {role === 'student' && (
                                        <>
                                            <div className="profile-field">
                                                <label>
                                                    <GraduationCap size={14} />
                                                    Year
                                                </label>
                                                <input
                                                    type="text"
                                                    value={generalForm.year}
                                                    onChange={e => setGeneralForm({ ...generalForm, year: e.target.value })}
                                                    placeholder="e.g., 3rd Year"
                                                />
                                            </div>
                                            <div className="profile-field">
                                                <label>
                                                    <Briefcase size={14} />
                                                    Roll Number
                                                </label>
                                                <input
                                                    type="text"
                                                    value={generalForm.rollNumber}
                                                    onChange={e => setGeneralForm({ ...generalForm, rollNumber: e.target.value })}
                                                    placeholder="Enter roll number"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="profile-form-actions">
                                    <button className="profile-save-btn" onClick={handleGeneralSave} disabled={saving}>
                                        {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Coding Profiles Tab */}
                    {activeTab === 'profiles' && role === 'student' && (
                        <div className="profile-section">
                            <div className="profile-section-header">
                                <h2>Coding Profiles</h2>
                                <p>Connect your coding platform usernames for data tracking</p>
                            </div>
                            <div className="profile-form">
                                <div className="profile-form-grid">
                                    <div className="profile-field">
                                        <label>
                                            <Github size={14} />
                                            GitHub Username
                                        </label>
                                        <input
                                            type="text"
                                            value={profilesForm.github}
                                            onChange={e => setProfilesForm({ ...profilesForm, github: e.target.value })}
                                            placeholder="e.g., octocat"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label>
                                            <Code2 size={14} />
                                            LeetCode Username
                                        </label>
                                        <input
                                            type="text"
                                            value={profilesForm.leetcode}
                                            onChange={e => setProfilesForm({ ...profilesForm, leetcode: e.target.value })}
                                            placeholder="e.g., leetcoder123"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label>
                                            <Award size={14} />
                                            HackerRank Username
                                        </label>
                                        <input
                                            type="text"
                                            value={profilesForm.hackerrank}
                                            onChange={e => setProfilesForm({ ...profilesForm, hackerrank: e.target.value })}
                                            placeholder="e.g., hacker_rank_user"
                                        />
                                    </div>
                                    <div className="profile-field">
                                        <label>
                                            <Linkedin size={14} />
                                            LinkedIn URL
                                        </label>
                                        <input
                                            type="text"
                                            value={profilesForm.linkedin}
                                            onChange={e => setProfilesForm({ ...profilesForm, linkedin: e.target.value })}
                                            placeholder="e.g., linkedin.com/in/yourname"
                                        />
                                    </div>
                                    <div className="profile-field full-width">
                                        <label>
                                            <Globe size={14} />
                                            Portfolio Website
                                        </label>
                                        <input
                                            type="text"
                                            value={profilesForm.portfolio}
                                            onChange={e => setProfilesForm({ ...profilesForm, portfolio: e.target.value })}
                                            placeholder="e.g., https://yourportfolio.com"
                                        />
                                    </div>
                                </div>
                                <div className="profile-form-actions">
                                    <button className="profile-save-btn" onClick={handleProfilesSave} disabled={saving}>
                                        {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
                                        {saving ? 'Saving...' : 'Save Profiles'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="profile-section">
                            <div className="profile-section-header">
                                <h2>Change Password</h2>
                                <p>Update your account password to keep your account secure</p>
                            </div>
                            <div className="profile-form">
                                <div className="profile-form-grid single-col">
                                    <div className="profile-field">
                                        <label>
                                            <Lock size={14} />
                                            Current Password
                                        </label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showPasswords.current ? 'text' : 'password'}
                                                value={passwordForm.currentPassword}
                                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                placeholder="Enter current password"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                            >
                                                {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="profile-field">
                                        <label>
                                            <Lock size={14} />
                                            New Password
                                        </label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showPasswords.new ? 'text' : 'password'}
                                                value={passwordForm.newPassword}
                                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                placeholder="Enter new password (min 6 characters)"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                            >
                                                {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="profile-field">
                                        <label>
                                            <Lock size={14} />
                                            Confirm New Password
                                        </label>
                                        <div className="password-input-wrapper">
                                            <input
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                value={passwordForm.confirmPassword}
                                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                placeholder="Re-enter new password"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                            >
                                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="profile-form-actions">
                                    <button
                                        className="profile-save-btn"
                                        onClick={handlePasswordSave}
                                        disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                                    >
                                        {saving ? <RefreshCw size={16} className="spin" /> : <Lock size={16} />}
                                        {saving ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}
