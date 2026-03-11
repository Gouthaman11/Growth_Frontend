import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, userAPI, codingDataAPI } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext)
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null) // Auth Object (with token)
    const [userData, setUserData] = useState(null)       // Detailed User Profile
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuthStatus()
    }, [])

    async function checkAuthStatus() {
        const token = localStorage.getItem('token')
        if (token) {
            try {
                // Verify token by fetching profile
                const profile = await authAPI.getProfile()
                setCurrentUser({ uid: profile.id, ...profile }) // mimic Firebase structure
                setUserData(profile)
            } catch (error) {
                console.error('Session expired', error)
                localStorage.removeItem('token')
                setCurrentUser(null)
                setUserData(null)
            }
        }
        setLoading(false)
    }

    // Register Student
    async function registerStudent(email, password, studentData) {
        const reqData = {
            email,
            password,
            role: 'student',
            fullName: studentData.fullName,
            collegeEmail: studentData.collegeEmail || '',
            rollNumber: studentData.rollNumber,
            department: studentData.department,
            year: studentData.year,
            codingProfiles: {
                github: studentData.github || '',
                leetcode: studentData.leetcode || '',
                hackerrank: studentData.hackerrank || '',
                linkedin: studentData.linkedin || '',
                portfolio: studentData.portfolio || ''
            },
            academics: {
                cgpa: parseFloat(studentData.cgpa) || 0,
                sgpa: parseFloat(studentData.sgpa) || 0,
                attendance: 0
            },
            growthScore: 0
        }

        const response = await authAPI.register(reqData)

        // Save token and set state
        localStorage.setItem('token', response.token)
        setCurrentUser({ uid: response.id, ...response })
        setUserData(response)

        // Trigger initial coding data sync in background (non-blocking)
        // This ensures that platform data is available when the dashboard loads
        const hasProfiles = studentData.github || studentData.leetcode || studentData.hackerrank
        if (hasProfiles) {
            codingDataAPI.syncAll(response.id).then(() => {
                console.log('✅ Initial coding data sync completed after registration')
            }).catch(err => {
                console.log('Initial sync skipped:', err.message)
            })
        }

        return response
    }

    // Register Mentor
    async function registerMentor(email, password, mentorData) {
        const reqData = {
            email,
            password,
            role: 'mentor',
            fullName: mentorData.fullName,
            employeeId: mentorData.employeeId,
            department: mentorData.department,
            designation: mentorData.designation,
            specialization: mentorData.specialization,
            assignedStudents: []
        }

        const response = await authAPI.register(reqData)

        // If mentor is pending approval, don't set token/user
        if (response.pending) {
            return response
        }

        // Save token and set state
        localStorage.setItem('token', response.token)
        setCurrentUser({ uid: response.id, ...response })
        setUserData(response)

        return response
    }

    // Login
    async function login(email, password) {
        const response = await authAPI.login({ email, password })

        // Save token and set state immediately
        localStorage.setItem('token', response.token)
        const userObj = { uid: response.id, ...response }
        setCurrentUser(userObj)
        setUserData(response)

        // For students, trigger background sync
        if (response.role === 'student') {
            const hasProfiles = response.codingProfiles &&
                (response.codingProfiles.github || response.codingProfiles.leetcode || response.codingProfiles.hackerrank)

            if (hasProfiles) {
                // Non-blocking sync
                codingDataAPI.syncAll(response.id).then(() => {
                    console.log('✅ Background data sync completed after login')
                }).catch(err => {
                    console.log('Background sync skipped:', err.message)
                })
            }
        }

        return response
    }

    // Logout
    function logout() {
        localStorage.removeItem('token')
        setCurrentUser(null)
        setUserData(null)
        return Promise.resolve()
    }

    // Get user data (Already done via state mostly, but can fetch fresh)
    async function getUserData(uid) {
        const data = await userAPI.getUser(uid)
        return data
    }

    // Get all students (for mentors)
    async function getAllStudents() {
        return await userAPI.getAllStudents()
    }

    // Get assigned students (for mentors)
    async function getAssignedStudents(mentorId) {
        return await userAPI.getAssignedStudents(mentorId)
    }

    // Update student coding profiles
    async function updateCodingProfiles(uid, profiles) {
        await userAPI.updateCodingProfiles(uid, profiles)
        // Refresh local state if needed
        const updated = await getUserData(uid)
        if (currentUser && currentUser.id === uid) setUserData(updated)
    }

    // Update student academics
    async function updateAcademics(uid, academics) {
        await userAPI.updateAcademics(uid, academics)
        const updated = await getUserData(uid)
        if (currentUser && currentUser.id === uid) setUserData(updated)
    }

    // Save coding platform data
    async function saveCodingPlatformData(uid, platform, data) {
        if (platform === 'github') {
            await codingDataAPI.updateGithub(uid, data)
        } else if (platform === 'leetcode') {
            await codingDataAPI.updateLeetcode(uid, data)
        } else if (platform === 'hackerrank') {
            await codingDataAPI.updateHackerrank(uid, data)
        }
    }

    // Refresh current user data
    async function refreshUserData() {
        if (currentUser?.uid) {
            const updated = await userAPI.getUser(currentUser.uid)
            if (updated) setUserData(updated)
        }
    }

    const value = {
        currentUser,
        userData,
        loading,
        registerStudent,
        registerMentor,
        login,
        logout,
        getUserData,
        getAllStudents,
        getAssignedStudents,
        updateCodingProfiles,
        updateAcademics,
        saveCodingPlatformData,
        refreshUserData
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
