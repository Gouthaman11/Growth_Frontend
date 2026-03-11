// API service for communicating with PostgreSQL backend
// Use environment variable for API URL, fallback to relative path for Vercel
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Helper to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token')
    return token ? { 'Authorization': `Bearer ${token}` } : {}
}

const handleResponse = async (response) => {
    if (!response.ok) {
        if (response.status === 401) {
            // Token expired or invalid - let AuthContext handle logout if needed
            // localStorage.removeItem('token') 
        }
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || response.statusText)
    }
    return response.json()
}

// Auth API
export const authAPI = {
    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        return handleResponse(response)
    },

    async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        })
        return handleResponse(response)
    },

    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    }
}

// User API
export const userAPI = {
    async getUser(uid) {
        const response = await fetch(`${API_BASE_URL}/users/${uid}`, {
            headers: getAuthHeader()
        })
        // Special case for our app logic: return null if 404
        if (response.status === 404) return null
        return handleResponse(response)
    },

    async updateUser(uid, data) {
        const response = await fetch(`${API_BASE_URL}/users/${uid}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    async getAllStudents() {
        const response = await fetch(`${API_BASE_URL}/users?role=student`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async getGrowthBreakdown(uid) {
        const response = await fetch(`${API_BASE_URL}/users/${uid}/growth-breakdown`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async getGrowthRankings(department) {
        const query = department ? `?department=${encodeURIComponent(department)}` : ''
        const response = await fetch(`${API_BASE_URL}/users/rankings/growth${query}`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async changePassword(uid, data) {
        const response = await fetch(`${API_BASE_URL}/users/${uid}/change-password`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    async getAssignedStudents(mentorId) {
        const response = await fetch(`${API_BASE_URL}/users/${mentorId}/assigned-students`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async approveMentor(uid) {
        const response = await fetch(`${API_BASE_URL}/users/${uid}/approve`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        })
        return handleResponse(response)
    },

    async rejectMentor(uid) {
        const response = await fetch(`${API_BASE_URL}/users/${uid}/reject`, {
            method: 'DELETE',
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async updateCodingProfiles(uid, profiles) {
        const response = await fetch(`${API_BASE_URL}/users/${uid}/coding-profiles`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(profiles)
        })
        return handleResponse(response)
    },

    async updateAcademics(uid, academics) {
        const response = await fetch(`${API_BASE_URL}/users/${uid}/academics`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(academics)
        })
        return handleResponse(response)
    },

    async getAllUsers() {
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async getAllMentors() {
        const response = await fetch(`${API_BASE_URL}/users?role=mentor`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async deleteUser(uid) {
        const response = await fetch(`${API_BASE_URL}/users/${uid}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async createUser(data) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    async assignStudents(mentorId, studentIds) {
        const response = await fetch(`${API_BASE_URL}/users/${mentorId}/assign-students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ studentIds })
        })
        return handleResponse(response)
    }
}

// Feedback API
export const feedbackAPI = {
    async create(feedbackData) {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(feedbackData)
        })
        return handleResponse(response)
    },

    async getByStudent(studentId) {
        const response = await fetch(`${API_BASE_URL}/feedback/student/${studentId}`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async getByMentor(mentorId) {
        const response = await fetch(`${API_BASE_URL}/feedback/mentor/${mentorId}`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    }
}

// Goals API
export const goalsAPI = {
    async create(goalData) {
        const response = await fetch(`${API_BASE_URL}/goals`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(goalData)
        })
        return handleResponse(response)
    },

    async getByStudent(studentId) {
        const response = await fetch(`${API_BASE_URL}/goals/student/${studentId}`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async updateProgress(goalId, progress) {
        const response = await fetch(`${API_BASE_URL}/goals/${goalId}/progress`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ progress })
        })
        return handleResponse(response)
    },

    async complete(goalId) {
        const response = await fetch(`${API_BASE_URL}/goals/${goalId}/complete`, {
            method: 'PATCH',
            headers: getAuthHeader()
        })
        return handleResponse(response)
    }
}

// Milestones API
export const milestonesAPI = {
    async getByStudent(studentId) {
        const response = await fetch(`${API_BASE_URL}/milestones/student/${studentId}`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async create(milestoneData) {
        const response = await fetch(`${API_BASE_URL}/milestones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(milestoneData)
        })
        return handleResponse(response)
    }
}

// Coding Data API
export const codingDataAPI = {
    async get(studentId) {
        const response = await fetch(`${API_BASE_URL}/coding-data/${studentId}`, {
            headers: getAuthHeader()
        })
        if (response.status === 404) return null
        return handleResponse(response)
    },

    async syncAll(studentId) {
        const response = await fetch(`${API_BASE_URL}/coding-data/${studentId}/sync`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            }
        })
        return handleResponse(response)
    },

    async fetchGithub(studentId, username) {
        const response = await fetch(`${API_BASE_URL}/coding-data/${studentId}/fetch/github`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ username })
        })
        return handleResponse(response)
    },

    async fetchLeetcode(studentId, username) {
        const response = await fetch(`${API_BASE_URL}/coding-data/${studentId}/fetch/leetcode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ username })
        })
        return handleResponse(response)
    },

    async fetchHackerrank(studentId, username) {
        const response = await fetch(`${API_BASE_URL}/coding-data/${studentId}/fetch/hackerrank`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ username })
        })
        return handleResponse(response)
    },

    async updateGithub(studentId, data) {
        const response = await fetch(`${API_BASE_URL}/coding-data/${studentId}/github`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    async updateLeetcode(studentId, data) {
        const response = await fetch(`${API_BASE_URL}/coding-data/${studentId}/leetcode`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    async updateHackerrank(studentId, data) {
        const response = await fetch(`${API_BASE_URL}/coding-data/${studentId}/hackerrank`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    }
}

// Progress History API
export const progressAPI = {
    async getHistory(studentId, days = 30) {
        const response = await fetch(`${API_BASE_URL}/progress/${studentId}?days=${days}`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async getWeeklyComparison(studentId) {
        const response = await fetch(`${API_BASE_URL}/progress/${studentId}/weekly-comparison`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async getMonthlySummary(studentId) {
        const response = await fetch(`${API_BASE_URL}/progress/${studentId}/monthly-summary`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async recordProgress(studentId) {
        const response = await fetch(`${API_BASE_URL}/progress/${studentId}/record`, {
            method: 'POST',
            headers: getAuthHeader()
        })
        return handleResponse(response)
    }
}

// Academics API (BIP Portal Integration)
export const academicsAPI = {
    // Test BIP portal connection
    async testConnection() {
        const response = await fetch(`${API_BASE_URL}/academics/test-connection`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    // Get BIP portal status (URL, SSO info)
    async getBipStatus(userId) {
        const response = await fetch(`${API_BASE_URL}/academics/${userId}/bip-status`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    // Get academic data
    async getData(userId) {
        const response = await fetch(`${API_BASE_URL}/academics/${userId}/data`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    // Update academic data (manual entry)
    async updateData(userId, data) {
        const response = await fetch(`${API_BASE_URL}/academics/${userId}/data`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    // Quick update for basic fields (CGPA, SGPA, attendance)
    async quickUpdate(userId, data) {
        const response = await fetch(`${API_BASE_URL}/academics/${userId}/quick-update`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    // Add/update semester data
    async addSemester(userId, semesterData) {
        const response = await fetch(`${API_BASE_URL}/academics/${userId}/semesters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(semesterData)
        })
        return handleResponse(response)
    }
}

// Groq AI Analysis API
export const groqAPI = {
    async analyzeGrowth(studentData) {
        const response = await fetch(`${API_BASE_URL}/groq/analyze-growth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ studentData })
        })
        return handleResponse(response)
    },

    async analyzeResume(resumeText, studentId, resumeFileBase64, resumeFileName) {
        const response = await fetch(`${API_BASE_URL}/groq/analyze-resume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ resumeText, studentId, resumeFileBase64, resumeFileName })
        })
        return handleResponse(response)
    },

    async getResumeLeaderboard() {
        const response = await fetch(`${API_BASE_URL}/groq/resume-leaderboard`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async getResumeFile(studentId) {
        const response = await fetch(`${API_BASE_URL}/groq/resume-file/${studentId}`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async saveResume(studentId, analysis, resumeFileBase64, resumeFileName) {
        const response = await fetch(`${API_BASE_URL}/groq/save-resume`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ studentId, analysis, resumeFileBase64, resumeFileName })
        })
        return handleResponse(response)
    }
}

// Course API
export const courseAPI = {
    async getCourses(department) {
        const query = department ? `?department=${encodeURIComponent(department)}` : ''
        const response = await fetch(`${API_BASE_URL}/courses${query}`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async createCourse(data) {
        const response = await fetch(`${API_BASE_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    async updateCourse(id, data) {
        const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    async deleteCourse(id) {
        const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async getStudentCourses(studentId) {
        const response = await fetch(`${API_BASE_URL}/courses/student/${studentId}`, {
            headers: getAuthHeader()
        })
        return handleResponse(response)
    },

    async updateStudentStatus(studentId, courseId, status) {
        const response = await fetch(`${API_BASE_URL}/courses/student-status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify({ studentId, courseId, status })
        })
        return handleResponse(response)
    }
}

export default {
    authAPI,
    userAPI,
    feedbackAPI,
    goalsAPI,
    milestonesAPI,
    codingDataAPI,
    progressAPI,
    academicsAPI,
    groqAPI,
    courseAPI
}
