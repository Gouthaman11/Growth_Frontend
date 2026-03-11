import { Link } from 'react-router-dom'
import {
    ArrowRight,
    BarChart3,
    BookOpen,
    Code2,
    GraduationCap,
    MessageSquare,
    Shield,
    Target,
    TrendingUp,
    Users,
    CheckCircle2,
    Sparkles
} from 'lucide-react'
import './LandingPage.css'

const features = [
    {
        icon: Code2,
        title: 'Coding Platform Tracking',
        description: 'Monitor your LeetCode, CodeChef, and other coding platform progress in one unified dashboard.',
        color: 'primary'
    },
    {
        icon: BookOpen,
        title: 'Academic Progress',
        description: 'Track CGPA, semester performance, and academic milestones to stay on top of your studies.',
        color: 'secondary'
    },
    {
        icon: Target,
        title: 'Goal Management',
        description: 'Set, track, and achieve your career and learning goals with structured milestones.',
        color: 'accent'
    },
    {
        icon: MessageSquare,
        title: 'Mentor Feedback',
        description: 'Receive personalized guidance and feedback from mentors to accelerate your growth.',
        color: 'warning'
    },
    {
        icon: BarChart3,
        title: 'Progress Reports',
        description: 'Visualize your journey with detailed analytics and comprehensive progress reports.',
        color: 'info'
    },
    {
        icon: TrendingUp,
        title: 'Growth Analytics',
        description: 'AI-powered insights and recommendations to help you improve continuously.',
        color: 'error'
    }
]

const roles = [
    {
        id: 'student',
        icon: GraduationCap,
        title: 'For Students',
        description: 'Track your coding journey, academics, and career readiness all in one place.',
        features: [
            'Unified coding platform dashboard',
            'Academic progress tracking',
            'Goal setting & milestones',
            'Personalized mentor feedback'
        ]
    },
    {
        id: 'mentor',
        icon: Users,
        title: 'For Mentors',
        description: 'Guide your students effectively with powerful monitoring and feedback tools.',
        features: [
            'Student progress overview',
            'Structured feedback system',
            'Performance analytics',
            'Group & individual insights'
        ]
    },
    {
        id: 'admin',
        icon: Shield,
        title: 'For Admins',
        description: 'Manage the platform, users, and integrations with comprehensive admin tools.',
        features: [
            'User management dashboard',
            'Platform integrations',
            'System announcements',
            'Analytics & reporting'
        ]
    }
]

export default function LandingPage() {
    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-nav-logo">
                    <div className="landing-nav-logo-icon">
                        <svg viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" fill="url(#landingLogoGradient)" />
                            <path d="M12 22 L18 28 L28 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M20 10 L20 18" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                            <circle cx="20" cy="8" r="2" fill="white" />
                            <defs>
                                <linearGradient id="landingLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#1a365d" />
                                    <stop offset="100%" stopColor="#10b981" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="landing-nav-logo-text">EduGrow<span className="landing-nav-logo-plus">+</span></span>
                </div>

                <div className="landing-nav-links">
                    <a href="#features" className="landing-nav-link">Features</a>
                    <a href="#roles" className="landing-nav-link">Roles</a>
                    <Link to="/auth/login" className="landing-nav-link">Log In</Link>
                    <Link to="/auth/select-role" className="landing-nav-btn">Get Started</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-bg"></div>
                <div className="landing-hero-pattern"></div>
                <div className="landing-hero-content">
                    <div className="landing-hero-badge">
                        <Sparkles size={16} />
                        Student Growth Platform
                    </div>
                    <h1 className="landing-hero-title">
                        Track, Grow & Excel with{' '}
                        <span className="landing-hero-title-highlight">EduGrow+</span>
                    </h1>
                    <p className="landing-hero-subtitle">
                        Your all-in-one platform to monitor coding progress, academic performance,
                        and career readiness. Get mentored, set goals, and grow consistently.
                    </p>
                    <div className="landing-hero-actions">
                        <Link to="/auth/select-role" className="landing-hero-btn-primary">
                            Get Started Free <ArrowRight size={18} />
                        </Link>
                        <Link to="/auth/login" className="landing-hero-btn-secondary">
                            Sign In
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="landing-features" id="features">
                <div className="landing-section-header">
                    <span className="landing-section-label">Features</span>
                    <h2 className="landing-section-title">Everything You Need to Grow</h2>
                    <p className="landing-section-desc">
                        Powerful tools designed to help students track progress, mentors guide effectively,
                        and admins manage seamlessly.
                    </p>
                </div>

                <div className="landing-features-grid">
                    {features.map((feature) => (
                        <div key={feature.title} className="landing-feature-card">
                            <div className={`landing-feature-icon landing-feature-icon-${feature.color}`}>
                                <feature.icon size={24} />
                            </div>
                            <h3 className="landing-feature-title">{feature.title}</h3>
                            <p className="landing-feature-desc">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Roles Section */}
            <section className="landing-roles" id="roles">
                <div className="landing-section-header">
                    <span className="landing-section-label">Built For Everyone</span>
                    <h2 className="landing-section-title">One Platform, Multiple Roles</h2>
                    <p className="landing-section-desc">
                        Whether you're a student, mentor, or admin — EduGrow+ has the tools you need.
                    </p>
                </div>

                <div className="landing-roles-grid">
                    {roles.map((role) => (
                        <div key={role.id} className={`landing-role-card landing-role-card-${role.id}`}>
                            <div className={`landing-role-icon landing-role-icon-${role.id}`}>
                                <role.icon size={28} />
                            </div>
                            <h3 className="landing-role-title">{role.title}</h3>
                            <p className="landing-role-desc">{role.description}</p>
                            <ul className="landing-role-features">
                                {role.features.map((feat) => (
                                    <li key={feat} className="landing-role-feature">
                                        <CheckCircle2 size={16} className="landing-role-feature-icon" />
                                        {feat}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="landing-cta">
                <div className="landing-cta-content">
                    <h2 className="landing-cta-title">Ready to Start Your Growth Journey?</h2>
                    <p className="landing-cta-desc">
                        Join EduGrow+ today and take control of your academic and professional development
                        with powerful tracking tools and expert mentorship.
                    </p>
                    <Link to="/auth/select-role" className="landing-cta-btn">
                        Create Your Account <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <p className="landing-footer-text">
                    &copy; {new Date().getFullYear()} <span className="landing-footer-brand">EduGrow+</span>. All rights reserved.
                </p>
            </footer>
        </div>
    )
}
