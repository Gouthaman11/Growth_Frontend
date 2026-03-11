import { Link } from 'react-router-dom'
import { Github, Twitter, Linkedin, Mail } from 'lucide-react'
import './Footer.css'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const footerLinks = {
        Product: [
            { label: 'Features', href: '#features' },
            { label: 'Integrations', href: '#integrations' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Changelog', href: '#' },
        ],
        Company: [
            { label: 'About', href: '#' },
            { label: 'Blog', href: '#' },
            { label: 'Careers', href: '#' },
            { label: 'Contact', href: '#' },
        ],
        Resources: [
            { label: 'Documentation', href: '#' },
            { label: 'Help Center', href: '#' },
            { label: 'API Reference', href: '#' },
            { label: 'Status', href: '#' },
        ],
        Legal: [
            { label: 'Privacy Policy', href: '#' },
            { label: 'Terms of Service', href: '#' },
            { label: 'Cookie Policy', href: '#' },
        ],
    }

    const socialLinks = [
        { icon: Github, href: '#', label: 'GitHub' },
        { icon: Twitter, href: '#', label: 'Twitter' },
        { icon: Linkedin, href: '#', label: 'LinkedIn' },
        { icon: Mail, href: '#', label: 'Email' },
    ]

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-top">
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <div className="footer-logo-icon">
                                <svg viewBox="0 0 40 40" fill="none">
                                    <circle cx="20" cy="20" r="18" fill="url(#footerLogoGradient)" />
                                    <path d="M12 22 L18 28 L28 16" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M20 10 L20 18" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                                    <circle cx="20" cy="8" r="2" fill="white" />
                                    <defs>
                                        <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#1a365d" />
                                            <stop offset="100%" stopColor="#10b981" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                            <span className="footer-logo-text">EduGrow<span className="footer-logo-plus">+</span></span>
                        </Link>
                        <p className="footer-description">
                            Empowering students and institutions with intelligent growth monitoring and career readiness insights.
                        </p>
                        <div className="footer-social">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="footer-social-link"
                                    aria-label={social.label}
                                >
                                    <social.icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="footer-links">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category} className="footer-column">
                                <h4 className="footer-column-title">{category}</h4>
                                <ul className="footer-column-links">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            <a href={link.href} className="footer-link">{link.label}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copyright">
                        © {currentYear} EduGrow+. All rights reserved.
                    </p>
                    <p className="footer-tagline">
                        Built with 💚 for the future of education
                    </p>
                </div>
            </div>
        </footer>
    )
}
