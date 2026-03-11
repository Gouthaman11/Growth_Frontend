import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { groqAPI, userAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import * as pdfjsLib from 'pdfjs-dist'
import {
    FileText,
    Upload,
    RefreshCw,
    Trophy,
    Target,
    CheckCircle,
    XCircle,
    AlertCircle,
    Star,
    TrendingUp,
    Award,
    Users,
    Zap,
    ArrowUp,
    ArrowDown,
    Minus,
    Download,
    Eye,
    BookOpen,
    Briefcase,
    GraduationCap,
    Code2,
    User,
    ClipboardList,
    Shield,
    FileUp,
    Sparkles,
    BarChart3
} from 'lucide-react'
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Cell,
    Tooltip
} from 'recharts'
import './Resume.css'

const SECTION_ICONS = {
    contact: User,
    summary: ClipboardList,
    experience: Briefcase,
    education: GraduationCap,
    skills: Code2,
    projects: BookOpen
}

const PRIORITY_COLORS = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' }

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

async function extractTextFromPDF(arrayBuffer) {
    try {
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
        const textParts = []
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            const pageText = content.items.map(item => item.str).join(' ')
            textParts.push(pageText)
        }
        return textParts.join('\n\n').trim()
    } catch (err) {
        console.error('PDF.js extraction failed:', err)
        return ''
    }
}

function getScoreColor(score) {
    if (score >= 75) return '#10b981'
    if (score >= 50) return '#f59e0b'
    return '#ef4444'
}

function getScoreLabel(score) {
    if (score >= 80) return 'Excellent'
    if (score >= 65) return 'Good'
    if (score >= 50) return 'Average'
    if (score >= 35) return 'Below Average'
    return 'Poor'
}

function ScoreRing({ score, size = 160 }) {
    const radius = (size - 20) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference
    const color = getScoreColor(score)

    return (
        <div className="score-ring-container" style={{ width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                    cx={size / 2} cy={size / 2} r={radius} fill="none"
                    stroke={color} strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                />
            </svg>
            <div className="score-ring-inner">
                <span className="score-ring-number" style={{ color }}>{score}</span>
                <span className="score-ring-label">/100</span>
                <span className="score-ring-tag" style={{ color }}>{getScoreLabel(score)}</span>
            </div>
        </div>
    )
}

export default function Resume() {
    const { currentUser, userData } = useAuth()
    const [resumeText, setResumeText] = useState('')
    const [analysis, setAnalysis] = useState(null)
    const [loading, setLoading] = useState(false)
    const [leaderboard, setLeaderboard] = useState([])
    const [leaderboardLoading, setLeaderboardLoading] = useState(true)
    const [myRank, setMyRank] = useState(null)
    const [activeTab, setActiveTab] = useState('upload')
    const [dragOver, setDragOver] = useState(false)
    const [fileName, setFileName] = useState('')
    const [fileSize, setFileSize] = useState('')
    const fileInputRef = useRef(null)
    const [savedScore, setSavedScore] = useState(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [fileBase64, setFileBase64] = useState('')
    const [saveFailed, setSaveFailed] = useState(false)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadInitialData()
    }, [])

    const loadInitialData = async () => {
        try {
            setLeaderboardLoading(true)
            const lb = await groqAPI.getResumeLeaderboard()
            setLeaderboard(lb.leaderboard || [])

            const me = lb.leaderboard.find(s => s.id === currentUser?.uid || s.id === userData?.id)
            setMyRank(me || null)

            if (userData?.id || currentUser?.uid) {
                const user = await userAPI.getUser(userData?.id || currentUser?.uid)
                if (user?.resumeData?.atsScore != null) {
                    setSavedScore(user.resumeData)
                    if (!analysis) setAnalysis(user.resumeData)
                }
            }
        } catch (err) {
            console.error('Failed to load resume data:', err)
        } finally {
            setLeaderboardLoading(false)
        }
    }

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / 1048576).toFixed(1) + ' MB'
    }

    const handleFileUpload = useCallback((file) => {
        if (!file) return

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large. Maximum size is 5MB.')
            return
        }

        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            setUploadProgress(0)
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) { clearInterval(progressInterval); return 90 }
                    return prev + 10
                })
            }, 100)

            const reader = new FileReader()
            reader.onload = async (e) => {
                const arrayBuffer = e.target.result
                const text = await extractTextFromPDF(arrayBuffer)
                setResumeText(text || '')
                setFileName(file.name)
                setFileSize(formatFileSize(file.size))
                // Convert to base64 for server storage
                const bytes = new Uint8Array(arrayBuffer)
                let binary = ''
                for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
                setFileBase64(btoa(binary))
                clearInterval(progressInterval)
                setUploadProgress(100)
                setTimeout(() => setUploadProgress(0), 1500)
            }
            reader.readAsArrayBuffer(file)
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const reader = new FileReader()
            reader.onload = (e) => {
                const text = e.target.result
                setResumeText(text)
                setFileName(file.name)
                setFileSize(formatFileSize(file.size))
                // Store TXT file content as base64 for server storage
                const encoder = new TextEncoder()
                const bytes = encoder.encode(text)
                let binary = ''
                for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
                setFileBase64(btoa(binary))
            }
            reader.readAsText(file)
        } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            alert('DOCX files are not yet supported. Please convert to PDF and re-upload.')
        } else {
            alert('Please upload a PDF or TXT file.')
        }
    }, [])

    const handleDrop = useCallback((e) => {
        e.preventDefault()
        setDragOver(false)
        const file = e.dataTransfer.files[0]
        if (file) handleFileUpload(file)
    }, [handleFileUpload])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) handleFileUpload(file)
    }

    const handleRemoveFile = () => {
        setResumeText('')
        setFileName('')
        setFileSize('')
        setFileBase64('')
        setUploadProgress(0)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handleAnalyze = async () => {
        if (!resumeText.trim() || resumeText.length < 50) {
            alert('Could not extract enough text from the file. Please ensure the PDF contains selectable text.')
            return
        }
        setLoading(true)
        setSaveFailed(false)
        try {
            const studentId = userData?.id || currentUser?.uid
            const result = await groqAPI.analyzeResume(resumeText, studentId, fileBase64 || null, fileName || null)
            setAnalysis(result.analysis)
            setSavedScore(result.analysis)
            setActiveTab('results')
            if (!result.fileSaved) {
                setSaveFailed(true)
            }
            try {
                const lb = await groqAPI.getResumeLeaderboard()
                setLeaderboard(lb.leaderboard || [])
                const me = lb.leaderboard.find(s => s.id === studentId)
                setMyRank(me || null)
            } catch (_) { /* leaderboard fetch is non-critical */ }
        } catch (err) {
            console.error('Analysis failed:', err)
            alert('Analysis failed: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRetrySave = async () => {
        if (!analysis) return
        setSaving(true)
        try {
            const studentId = userData?.id || currentUser?.uid
            await groqAPI.saveResume(studentId, analysis, fileBase64 || null, fileName || null)
            setSaveFailed(false)
            alert('Resume saved successfully!')
        } catch (err) {
            console.error('Retry save failed:', err)
            alert('Save failed. Please check your connection and try again.')
        } finally {
            setSaving(false)
        }
    }

    const sectionData = analysis?.sections
        ? Object.entries(analysis.sections).map(([key, val]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            score: val.score || 0,
            found: val.found
        }))
        : []

    const radarData = sectionData.map(s => ({ subject: s.name, score: s.score, fullMark: 100 }))

    return (
        <DashboardLayout>
            <div className="resume-page">
                {/* Header */}
                <div className="resume-header">
                    <div className="resume-header-left">
                        <div className="resume-header-icon">
                            <FileText size={28} />
                        </div>
                        <div>
                            <h1 className="resume-title">Resume ATS Analyzer</h1>
                            <p className="resume-subtitle">Upload your resume and get AI-powered ATS score & ranking</p>
                        </div>
                    </div>
                    {savedScore?.atsScore != null && (
                        <div className="resume-header-score">
                            <span className="header-score-label">My ATS Score</span>
                            <span className="header-score-value" style={{ color: getScoreColor(savedScore.atsScore) }}>
                                {savedScore.atsScore}
                            </span>
                            {myRank && (
                                <span className="header-rank-badge">
                                    <Trophy size={12} /> #{myRank.rank}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="resume-tabs">
                    <button
                        className={`resume-tab ${activeTab === 'upload' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upload')}
                    >
                        <Upload size={16} /> Upload & Analyze
                    </button>
                    <button
                        className={`resume-tab ${activeTab === 'results' ? 'active' : ''}`}
                        onClick={() => setActiveTab('results')}
                        disabled={!analysis}
                    >
                        <Eye size={16} /> ATS Results
                    </button>
                    <button
                        className={`resume-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
                        onClick={() => setActiveTab('leaderboard')}
                    >
                        <Trophy size={16} /> Leaderboard
                    </button>
                </div>

                {/* Upload Tab */}
                {activeTab === 'upload' && (
                    <div className="resume-upload-section">
                        {/* Full-width Upload Drop Zone */}
                        <Card className="upload-card-full">
                            <CardHeader>
                                <CardTitle>
                                    <FileUp size={18} /> Upload Resume File
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`drop-zone-pro ${dragOver ? 'drag-over' : ''} ${fileName ? 'has-file' : ''}`}
                                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                                    onDragLeave={() => setDragOver(false)}
                                    onDrop={handleDrop}
                                    onClick={() => !fileName && fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.txt"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    {fileName ? (
                                        <div className="file-uploaded-view">
                                            <div className="file-icon-wrap">
                                                <FileText size={36} />
                                                <CheckCircle size={18} className="file-check-icon" />
                                            </div>
                                            <div className="file-details">
                                                <p className="file-name-text">{fileName}</p>
                                                <p className="file-size-text">{fileSize} &bull; Ready for analysis</p>
                                            </div>
                                            <div className="file-actions-row">
                                                <button className="file-action-btn replace" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
                                                    <RefreshCw size={14} /> Replace
                                                </button>
                                                <button className="file-action-btn remove" onClick={(e) => { e.stopPropagation(); handleRemoveFile() }}>
                                                    <XCircle size={14} /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="drop-zone-empty">
                                            <div className="upload-icon-circle">
                                                <Upload size={32} />
                                            </div>
                                            <p className="drop-zone-text">Drag & drop your resume here</p>
                                            <p className="drop-zone-hint">or click to browse files</p>
                                            <div className="drop-zone-formats">
                                                <span className="format-badge"><FileText size={12} /> PDF</span>
                                                <span className="format-badge"><FileText size={12} /> TXT</span>
                                            </div>
                                            <p className="drop-zone-limit">Maximum file size: 5MB</p>
                                        </div>
                                    )}
                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                        <div className="upload-progress-bar">
                                            <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tips */}
                        <Card className="tips-card">
                            <CardHeader>
                                <CardTitle><Sparkles size={16} /> ATS Optimization Tips</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="tips-grid">
                                    {[
                                        { icon: CheckCircle, text: 'Use standard section headers (Experience, Education, Skills)', color: '#10b981' },
                                        { icon: CheckCircle, text: 'Include relevant keywords from job descriptions', color: '#10b981' },
                                        { icon: CheckCircle, text: 'Use simple, clean formatting without tables or graphics', color: '#10b981' },
                                        { icon: CheckCircle, text: 'Quantify achievements with numbers and metrics', color: '#10b981' },
                                        { icon: AlertCircle, text: 'Avoid images, headers/footers, and complex layouts', color: '#f59e0b' },
                                        { icon: AlertCircle, text: 'Save as text-based PDF (not scanned image)', color: '#f59e0b' }
                                    ].map((tip, i) => (
                                        <div key={i} className="tip-item">
                                            <tip.icon size={14} style={{ color: tip.color, flexShrink: 0 }} />
                                            <span>{tip.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="analyze-btn-wrapper">
                            <Button
                                onClick={handleAnalyze}
                                disabled={loading || !fileName}
                                className="analyze-btn"
                                size="lg"
                            >
                                {loading ? (
                                    <><RefreshCw size={18} className="spin" /> Analyzing with AI...</>
                                ) : (
                                    <><Zap size={18} /> Analyze Resume</>
                                )}
                            </Button>
                            {!fileName && (
                                <p className="analyze-hint">Upload a resume file to enable analysis</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && analysis && (
                    <div className="resume-results">
                        {saveFailed && (
                            <div className="resume-save-warning" style={{
                                background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px',
                                padding: '14px 18px', marginBottom: '16px', display: 'flex',
                                alignItems: 'center', justifyContent: 'space-between', gap: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626' }}>
                                    <AlertCircle size={18} />
                                    <span style={{ fontSize: '14px', fontWeight: 500 }}>
                                        Resume data could not be saved to server. Your mentor won't be able to view it until saved.
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRetrySave}
                                    disabled={saving}
                                    style={{ whiteSpace: 'nowrap', borderColor: '#dc2626', color: '#dc2626' }}
                                >
                                    {saving ? <><RefreshCw size={14} className="spin" /> Saving...</> : 'Retry Save'}
                                </Button>
                            </div>
                        )}
                        {/* Score Overview */}
                        <div className="results-overview">
                            <Card className="score-hero-card">
                                <CardContent>
                                    <div className="score-hero">
                                        <ScoreRing score={analysis.atsScore || 0} size={180} />
                                        <div className="score-hero-info">
                                            <h2 className="score-verdict">{analysis.overallVerdict}</h2>
                                            <div className="score-meta-grid">
                                                <div className="score-meta-item">
                                                    <span className="meta-label">Formatting</span>
                                                    <span className="meta-value" style={{ color: getScoreColor(analysis.formatting?.score || 0) }}>
                                                        {analysis.formatting?.score || 0}/100
                                                    </span>
                                                </div>
                                                <div className="score-meta-item">
                                                    <span className="meta-label">Content</span>
                                                    <span className="meta-value" style={{ color: getScoreColor(analysis.content?.score || 0) }}>
                                                        {analysis.content?.score || 0}/100
                                                    </span>
                                                </div>
                                                {myRank && (
                                                    <div className="score-meta-item">
                                                        <span className="meta-label">My Rank</span>
                                                        <span className="meta-value rank-value">
                                                            <Trophy size={14} /> #{myRank.rank}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {analysis.lastAnalyzed && (
                                                <p className="last-analyzed">
                                                    Last analyzed: {new Date(analysis.lastAnalyzed).toLocaleString()}
                                                </p>
                                            )}
                                            <div className="reanalyze-btn-wrapper">
                                                <Button
                                                    onClick={() => setActiveTab('upload')}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <RefreshCw size={14} /> Re-analyze
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Section Scores */}
                            <Card className="sections-card">
                                <CardHeader>
                                    <CardTitle><Target size={16} /> Section Analysis</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="sections-list">
                                        {sectionData.map((sec) => {
                                            const Icon = SECTION_ICONS[sec.name.toLowerCase()] || FileText
                                            return (
                                                <div key={sec.name} className="section-item">
                                                    <div className="section-item-header">
                                                        <div className="section-item-left">
                                                            <Icon size={15} />
                                                            <span className="section-name">{sec.name}</span>
                                                            {sec.found
                                                                ? <CheckCircle size={13} className="found-icon" />
                                                                : <XCircle size={13} className="missing-icon" />
                                                            }
                                                        </div>
                                                        <span className="section-score" style={{ color: getScoreColor(sec.score) }}>
                                                            {sec.score}
                                                        </span>
                                                    </div>
                                                    <ProgressBar
                                                        value={sec.score}
                                                        max={100}
                                                        variant={sec.score >= 75 ? 'success' : sec.score >= 50 ? 'warning' : 'error'}
                                                        showValue={false}
                                                    />
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Radar & Bar Charts */}
                        <div className="charts-row">
                            <Card>
                                <CardHeader>
                                    <CardTitle><Star size={16} /> Section Radar</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="#e2e8f0" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                            <PolarRadiusAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                            <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle><BarChart3 size={16} /> Section Scores</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={sectionData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} />
                                            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                            <Tooltip
                                                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#1e293b', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                            />
                                            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                                {sectionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={getScoreColor(entry.score)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Keywords, Strengths, Suggestions */}
                        <div className="details-grid">
                            {/* Strengths */}
                            <Card>
                                <CardHeader>
                                    <CardTitle><Star size={16} /> Strengths</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="strengths-list">
                                        {(analysis.strengths || []).map((s, i) => (
                                            <div key={i} className="strength-item">
                                                <CheckCircle size={14} className="strength-icon" />
                                                <span>{s}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Keywords Found */}
                            <Card>
                                <CardHeader>
                                    <CardTitle><CheckCircle size={16} /> Keywords Found</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="keyword-cloud">
                                        {(analysis.keywords || []).map((kw, i) => (
                                            <span key={i} className="keyword-tag found">{kw}</span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Missing Keywords */}
                            <Card>
                                <CardHeader>
                                    <CardTitle><XCircle size={16} /> Missing Keywords</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="keyword-cloud">
                                        {(analysis.missingKeywords || []).map((kw, i) => (
                                            <span key={i} className="keyword-tag missing">{kw}</span>
                                        ))}
                                        {(!analysis.missingKeywords || analysis.missingKeywords.length === 0) && (
                                            <p className="no-missing">Great! No critical keywords missing.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Formatting & Content Feedback */}
                            <Card>
                                <CardHeader>
                                    <CardTitle><AlertCircle size={16} /> Detailed Feedback</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="feedback-list">
                                        {analysis.formatting && (
                                            <div className="feedback-item">
                                                <div className="feedback-header">
                                                    <span className="feedback-category">Formatting</span>
                                                    <span className="feedback-score" style={{ color: getScoreColor(analysis.formatting.score) }}>
                                                        {analysis.formatting.score}/100
                                                    </span>
                                                </div>
                                                <p className="feedback-text">{analysis.formatting.feedback}</p>
                                            </div>
                                        )}
                                        {analysis.content && (
                                            <div className="feedback-item">
                                                <div className="feedback-header">
                                                    <span className="feedback-category">Content</span>
                                                    <span className="feedback-score" style={{ color: getScoreColor(analysis.content.score) }}>
                                                        {analysis.content.score}/100
                                                    </span>
                                                </div>
                                                <p className="feedback-text">{analysis.content.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Improvement Suggestions */}
                        <Card className="suggestions-card">
                            <CardHeader>
                                <CardTitle><TrendingUp size={16} /> AI Improvement Suggestions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="suggestions-list">
                                    {(analysis.suggestions || []).map((sug, i) => (
                                        <div key={i} className={`suggestion-item priority-${sug.priority?.toLowerCase()}`}>
                                            <span
                                                className="suggestion-priority"
                                                style={{ background: PRIORITY_COLORS[sug.priority] || '#64748b' }}
                                            >
                                                {sug.priority}
                                            </span>
                                            <span className="suggestion-text">{sug.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* No results yet */}
                {activeTab === 'results' && !analysis && (
                    <div className="no-results">
                        <FileText size={60} className="no-results-icon" />
                        <h3>No Analysis Yet</h3>
                        <p>Upload your resume and click "Analyze Resume" to get your ATS score.</p>
                        <Button onClick={() => setActiveTab('upload')} size="sm">
                            <Upload size={14} /> Go to Upload
                        </Button>
                    </div>
                )}

                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <div className="resume-leaderboard">
                        {/* My Position Banner */}
                        {myRank && (
                            <Card className="my-rank-banner">
                                <CardContent>
                                    <div className="my-rank-content">
                                        <div className="my-rank-left">
                                            <Trophy size={24} className="trophy-icon" />
                                            <div>
                                                <p className="my-rank-title">Your Rank</p>
                                                <h2 className="my-rank-number">#{myRank.rank}</h2>
                                            </div>
                                        </div>
                                        <div className="my-rank-score">
                                            <span className="my-rank-score-value" style={{ color: getScoreColor(myRank.atsScore) }}>
                                                {myRank.atsScore}
                                            </span>
                                            <span className="my-rank-score-label">ATS Score</span>
                                        </div>
                                        <div className="my-rank-stats">
                                            <span>Top {leaderboard.length > 0 ? Math.ceil((myRank.rank / leaderboard.length) * 100) : 0}%</span>
                                            <span className="rank-percentile">of all students</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {leaderboardLoading ? (
                            <div className="lb-loading">
                                <RefreshCw size={24} className="spin" />
                                <p>Loading leaderboard...</p>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="lb-empty">
                                <Trophy size={50} />
                                <h3>No rankings yet</h3>
                                <p>Be the first to analyze your resume and claim the top spot!</p>
                                <Button onClick={() => setActiveTab('upload')} size="sm">
                                    <Upload size={14} /> Analyze My Resume
                                </Button>
                            </div>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        <Trophy size={16} /> ATS Score Rankings
                                        <span className="lb-total">{leaderboard.length} students ranked</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="leaderboard-table">
                                        <div className="lb-header-row">
                                            <span>Rank</span>
                                            <span>Student</span>
                                            <span>Department</span>
                                            <span>Year</span>
                                            <span>ATS Score</span>
                                            <span>Status</span>
                                        </div>
                                        {leaderboard.map((student) => {
                                            const isMe = student.id === (userData?.id || currentUser?.uid)
                                            const rankIcon = student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : null
                                            return (
                                                <div
                                                    key={student.id}
                                                    className={`lb-row ${isMe ? 'is-me' : ''}`}
                                                >
                                                    <span className="lb-rank">
                                                        {rankIcon || `#${student.rank}`}
                                                    </span>
                                                    <span className="lb-name">
                                                        {student.fullName}
                                                        {isMe && <span className="you-badge">You</span>}
                                                    </span>
                                                    <span className="lb-dept">{student.department || '—'}</span>
                                                    <span className="lb-year">{student.year || '—'}</span>
                                                    <span className="lb-score" style={{ color: getScoreColor(student.atsScore) }}>
                                                        <strong>{student.atsScore}</strong>/100
                                                    </span>
                                                    <span className="lb-status">
                                                        <Badge variant={student.atsScore >= 75 ? 'success' : student.atsScore >= 50 ? 'warning' : 'danger'}>
                                                            {getScoreLabel(student.atsScore)}
                                                        </Badge>
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
