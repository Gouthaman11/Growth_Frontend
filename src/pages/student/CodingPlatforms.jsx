import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { codingDataAPI, userAPI } from '../../services/api'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { Github, Code2, RefreshCw, ExternalLink, Trophy, Star, GitBranch, GitCommit, Save, AlertCircle, Award } from 'lucide-react'
import './CodingPlatforms.css'

export default function CodingPlatforms() {
    const { currentUser, userData, refreshUserData } = useAuth()
    const [platformData, setPlatformData] = useState({
        github: null,
        leetcode: null,
        hackerrank: null
    })
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [profiles, setProfiles] = useState({
        github: '',
        leetcode: '',
        hackerrank: ''
    })
    const [saveStatus, setSaveStatus] = useState('')

    useEffect(() => {
        if (currentUser) {
            loadData()
        }
    }, [currentUser])

    useEffect(() => {
        if (userData?.codingProfiles) {
            setProfiles({
                github: userData.codingProfiles.github || '',
                leetcode: userData.codingProfiles.leetcode || '',
                hackerrank: userData.codingProfiles.hackerrank || ''
            })
        }
    }, [userData])

    const loadData = async () => {
        setLoading(true)
        try {
            const data = await codingDataAPI.get(currentUser.uid)
            if (data) {
                setPlatformData({
                    github: data.github,
                    leetcode: data.leetcode,
                    hackerrank: data.hackerrank
                })
            }
        } catch (error) {
            console.error('Error loading coding data:', error)
        }
        setLoading(false)
    }

    const handleSaveProfiles = async () => {
        setSaveStatus('saving')
        try {
            await userAPI.updateCodingProfiles(currentUser.uid, profiles)
            setSaveStatus('saved')
            setEditMode(false)
            if (refreshUserData) await refreshUserData()

            // Auto-sync after saving profiles
            setSyncing(true)
            try {
                const result = await codingDataAPI.syncAll(currentUser.uid)
                setPlatformData(prev => ({
                    github: result.github || prev.github,
                    leetcode: result.leetcode || prev.leetcode,
                    hackerrank: result.hackerrank || prev.hackerrank
                }))
            } catch (syncError) {
                console.error('Auto-sync error:', syncError)
            }
            setSyncing(false)

            setTimeout(() => setSaveStatus(''), 2000)
        } catch (error) {
            console.error('Error saving profiles:', error)
            setSaveStatus('error')
        }
    }

    const handleSyncAll = async () => {
        setSyncing(true)
        try {
            const result = await codingDataAPI.syncAll(currentUser.uid)
            setPlatformData(prev => ({
                github: result.github || prev.github,
                leetcode: result.leetcode || prev.leetcode,
                hackerrank: result.hackerrank || prev.hackerrank
            }))
        } catch (error) {
            console.error('Error syncing data:', error)
        }
        setSyncing(false)
    }

    const handleSyncPlatform = async (platform) => {
        if (!profiles[platform]) return

        setSyncing(true)
        try {
            let result
            switch (platform) {
                case 'github':
                    result = await codingDataAPI.fetchGithub(currentUser.uid, profiles.github)
                    if (result.github) setPlatformData(prev => ({ ...prev, github: result.github }))
                    break
                case 'leetcode':
                    result = await codingDataAPI.fetchLeetcode(currentUser.uid, profiles.leetcode)
                    if (result.leetcode) setPlatformData(prev => ({ ...prev, leetcode: result.leetcode }))
                    break
                case 'hackerrank':
                    result = await codingDataAPI.fetchHackerrank(currentUser.uid, profiles.hackerrank)
                    if (result.hackerrank) setPlatformData(prev => ({ ...prev, hackerrank: result.hackerrank }))
                    break
            }
        } catch (error) {
            console.error(`Error syncing ${platform}:`, error)
        }
        setSyncing(false)
    }

    const formatLastSync = (date) => {
        if (!date) return 'Never synced'
        const d = new Date(date)
        const now = new Date()
        const diff = Math.floor((now - d) / 60000)
        if (diff < 1) return 'Just now'
        if (diff < 60) return `${diff}m ago`
        if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
        return d.toLocaleDateString()
    }

    if (loading) {
        return (
            <DashboardLayout role="student">
                <div className="cp-loading">
                    <RefreshCw className="cp-spinning" size={32} />
                    <p>Loading coding platforms...</p>
                </div>
            </DashboardLayout>
        )
    }

    const github = platformData.github
    const leetcode = platformData.leetcode
    const hackerrank = platformData.hackerrank

    return (
        <DashboardLayout role="student">
            <div className="coding-platforms-page">
                {/* Header */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Coding Platforms</h1>
                        <p className="dashboard-subtitle">Track your progress across all coding platforms</p>
                    </div>
                    <div className="header-actions">
                        <Button
                            variant="secondary"
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? 'Cancel' : 'Edit Profiles'}
                        </Button>
                        <Button
                            variant="primary"
                            icon={<RefreshCw size={18} className={syncing ? 'cp-spinning' : ''} />}
                            onClick={handleSyncAll}
                            disabled={syncing}
                        >
                            {syncing ? 'Syncing...' : 'Sync All'}
                        </Button>
                    </div>
                </div>

                {/* Edit Profiles */}
                {editMode && (
                    <div className="profiles-editor">
                        <h3>Update Your Profile Usernames</h3>
                        <div className="profiles-editor-grid">
                            <div className="profile-input-group">
                                <label>
                                    <Github size={16} />
                                    GitHub Username
                                </label>
                                <Input
                                    value={profiles.github}
                                    onChange={(e) => setProfiles(prev => ({ ...prev, github: e.target.value }))}
                                    placeholder="e.g., octocat"
                                />
                            </div>
                            <div className="profile-input-group">
                                <label>
                                    <Code2 size={16} />
                                    LeetCode Username
                                </label>
                                <Input
                                    value={profiles.leetcode}
                                    onChange={(e) => setProfiles(prev => ({ ...prev, leetcode: e.target.value }))}
                                    placeholder="e.g., leetcoder123"
                                />
                            </div>
                            <div className="profile-input-group">
                                <label>
                                    <Code2 size={16} />
                                    HackerRank Username
                                </label>
                                <Input
                                    value={profiles.hackerrank}
                                    onChange={(e) => setProfiles(prev => ({ ...prev, hackerrank: e.target.value }))}
                                    placeholder="e.g., hacker_dev"
                                />
                            </div>
                        </div>
                        <div className="profiles-editor-actions">
                            <Button variant="primary" icon={<Save size={16} />} onClick={handleSaveProfiles}>
                                Save Profiles
                            </Button>
                            {saveStatus === 'saved' && <span className="save-feedback success">✓ Saved successfully!</span>}
                            {saveStatus === 'error' && <span className="save-feedback error">✗ Error saving</span>}
                        </div>
                    </div>
                )}

                {/* Platform Cards */}
                <div className="platform-grid">
                    {/* ===== GitHub ===== */}
                    <div className="cp-card github">
                        <div className="cp-card-header">
                            <div className="cp-card-identity">
                                <div className="cp-icon github">
                                    <Github size={22} />
                                </div>
                                <div>
                                    <h3>GitHub</h3>
                                    <p className="cp-username">{profiles.github ? `@${profiles.github}` : 'Not connected'}</p>
                                </div>
                            </div>
                            {github?.profileUrl && (
                                <a href={github.profileUrl} target="_blank" rel="noopener noreferrer" className="cp-external-link">
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>

                        {github ? (
                            <>
                                <div className="cp-stats">
                                    <div className="cp-stat">
                                        <span className="cp-stat-value">{github.publicRepos || 0}</span>
                                        <span className="cp-stat-label">Repos</span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-value">{github.totalCommits || github.contributions || 0}</span>
                                        <span className="cp-stat-label">Commits</span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-value">{github.totalStars || 0}</span>
                                        <span className="cp-stat-label">Stars</span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-value">{github.followers || 0}</span>
                                        <span className="cp-stat-label">Followers</span>
                                    </div>
                                </div>

                                <div className="cp-details">
                                    <div className="cp-detail-row">
                                        <GitCommit size={15} />
                                        <span>{github.recentCommits || 0} recent commits (last 90 days)</span>
                                    </div>
                                    <div className="cp-detail-row">
                                        <GitBranch size={15} />
                                        <span>{github.following || 0} following</span>
                                    </div>
                                </div>

                                {github.topLanguages?.length > 0 && (
                                    <div className="cp-languages">
                                        {github.topLanguages.slice(0, 5).map(l => (
                                            <span key={l.language} className="cp-lang-tag">{l.language}</span>
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="cp-empty">
                                <AlertCircle size={32} />
                                <p>Add your GitHub username and sync to see stats</p>
                            </div>
                        )}

                        <div className="cp-footer">
                            <div className="cp-sync-info">
                                <span className="cp-sync-dot"></span>
                                <span>{formatLastSync(github?.lastFetched)}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<RefreshCw size={14} className={syncing ? 'cp-spinning' : ''} />}
                                onClick={() => handleSyncPlatform('github')}
                                disabled={!profiles.github || syncing}
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* ===== LeetCode ===== */}
                    <div className="cp-card leetcode">
                        <div className="cp-card-header">
                            <div className="cp-card-identity">
                                <div className="cp-icon leetcode">
                                    <Code2 size={22} />
                                </div>
                                <div>
                                    <h3>LeetCode</h3>
                                    <p className="cp-username">{profiles.leetcode || 'Not connected'}</p>
                                </div>
                            </div>
                            {leetcode?.profileUrl && (
                                <a href={leetcode.profileUrl} target="_blank" rel="noopener noreferrer" className="cp-external-link">
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>

                        {leetcode ? (
                            <>
                                <div className="cp-stats">
                                    <div className="cp-stat">
                                        <span className="cp-stat-value">{leetcode.totalSolved || 0}</span>
                                        <span className="cp-stat-label">Solved</span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-value easy">{leetcode.easySolved || 0}</span>
                                        <span className="cp-stat-label">Easy</span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-value medium">{leetcode.mediumSolved || 0}</span>
                                        <span className="cp-stat-label">Medium</span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-value hard">{leetcode.hardSolved || 0}</span>
                                        <span className="cp-stat-label">Hard</span>
                                    </div>
                                </div>

                                <div className="cp-details">
                                    {leetcode.ranking > 0 && (
                                        <div className="cp-detail-row">
                                            <Trophy size={15} />
                                            <span>Ranking: #{leetcode.ranking.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {leetcode.acceptanceRate > 0 && (
                                        <div className="cp-detail-row">
                                            <Star size={15} />
                                            <span>Acceptance rate: {leetcode.acceptanceRate}%</span>
                                        </div>
                                    )}
                                    {leetcode.streak > 0 && (
                                        <div className="cp-detail-row">
                                            <Award size={15} />
                                            <span>{leetcode.streak} day streak</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="cp-empty">
                                <AlertCircle size={32} />
                                <p>Add your LeetCode username and sync to see stats</p>
                            </div>
                        )}

                        <div className="cp-footer">
                            <div className="cp-sync-info">
                                <span className="cp-sync-dot"></span>
                                <span>{formatLastSync(leetcode?.lastFetched)}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<RefreshCw size={14} className={syncing ? 'cp-spinning' : ''} />}
                                onClick={() => handleSyncPlatform('leetcode')}
                                disabled={!profiles.leetcode || syncing}
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* ===== HackerRank ===== */}
                    <div className="cp-card hackerrank">
                        <div className="cp-card-header">
                            <div className="cp-card-identity">
                                <div className="cp-icon hackerrank">
                                    <Code2 size={22} />
                                </div>
                                <div>
                                    <h3>HackerRank</h3>
                                    <p className="cp-username">{profiles.hackerrank || 'Not connected'}</p>
                                </div>
                            </div>
                            {hackerrank?.profileUrl && (
                                <a href={hackerrank.profileUrl} target="_blank" rel="noopener noreferrer" className="cp-external-link">
                                    <ExternalLink size={18} />
                                </a>
                            )}
                        </div>

                        {hackerrank ? (
                            <>
                                <div className="cp-stats">
                                    <div className="cp-stat">
                                        <span className="cp-stat-value">{hackerrank.solvedChallenges || 0}</span>
                                        <span className="cp-stat-label">Solved</span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-value">{hackerrank.badges || 0}</span>
                                        <span className="cp-stat-label">Badges</span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-value">{hackerrank.certificates || 0}</span>
                                        <span className="cp-stat-label">Certs</span>
                                    </div>
                                    <div className="cp-stat">
                                        <span className="cp-stat-value">{hackerrank.points || 0}</span>
                                        <span className="cp-stat-label">Points</span>
                                    </div>
                                </div>

                                <div className="cp-details">
                                    {hackerrank.goldBadges > 0 && (
                                        <div className="cp-detail-row">
                                            <Star size={15} />
                                            <span>{hackerrank.goldBadges} gold, {hackerrank.silverBadges || 0} silver, {hackerrank.bronzeBadges || 0} bronze badges</span>
                                        </div>
                                    )}
                                    {hackerrank.skills?.length > 0 && (
                                        <div className="cp-detail-row">
                                            <Award size={15} />
                                            <span>{hackerrank.skills.length} verified skills</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="cp-empty">
                                <AlertCircle size={32} />
                                <p>Add your HackerRank username and sync to see stats</p>
                            </div>
                        )}

                        <div className="cp-footer">
                            <div className="cp-sync-info">
                                <span className="cp-sync-dot"></span>
                                <span>{formatLastSync(hackerrank?.lastFetched)}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<RefreshCw size={14} className={syncing ? 'cp-spinning' : ''} />}
                                onClick={() => handleSyncPlatform('hackerrank')}
                                disabled={!profiles.hackerrank || syncing}
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>
                </div>

                {/* LeetCode Distribution */}
                {leetcode && (
                    <div className="lc-distribution">
                        <h3>
                            <Code2 size={18} />
                            LeetCode Problem Distribution
                        </h3>
                        <div className="lc-bars">
                            <div className="lc-bar-row">
                                <span className="lc-bar-label">Easy</span>
                                <div className="lc-bar-track">
                                    <div
                                        className="lc-bar-fill easy"
                                        style={{ width: `${Math.min(100, ((leetcode.easySolved || 0) / 800) * 100)}%` }}
                                    ></div>
                                </div>
                                <span className="lc-bar-count easy">{leetcode.easySolved || 0}</span>
                            </div>
                            <div className="lc-bar-row">
                                <span className="lc-bar-label">Medium</span>
                                <div className="lc-bar-track">
                                    <div
                                        className="lc-bar-fill medium"
                                        style={{ width: `${Math.min(100, ((leetcode.mediumSolved || 0) / 1700) * 100)}%` }}
                                    ></div>
                                </div>
                                <span className="lc-bar-count medium">{leetcode.mediumSolved || 0}</span>
                            </div>
                            <div className="lc-bar-row">
                                <span className="lc-bar-label">Hard</span>
                                <div className="lc-bar-track">
                                    <div
                                        className="lc-bar-fill hard"
                                        style={{ width: `${Math.min(100, ((leetcode.hardSolved || 0) / 750) * 100)}%` }}
                                    ></div>
                                </div>
                                <span className="lc-bar-count hard">{leetcode.hardSolved || 0}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
