import './ProgressBar.css'

export default function ProgressBar({
    value = 0,
    max = 100,
    label,
    showValue = true,
    variant = 'primary',
    size = 'md',
    animated = true,
    className = ''
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
        <div className={`progress-wrapper ${className}`}>
            {(label || showValue) && (
                <div className="progress-header">
                    {label && <span className="progress-label">{label}</span>}
                    {showValue && (
                        <span className="progress-value">{Math.round(percentage)}%</span>
                    )}
                </div>
            )}
            <div className={`progress-bar progress-bar-${size}`}>
                <div
                    className={`progress-fill progress-fill-${variant} ${animated ? 'progress-animated' : ''}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
