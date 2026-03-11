import './StatCard.css'

export default function StatCard({
    title,
    value,
    change,
    changeType = 'neutral',
    icon,
    iconColor = 'primary',
    trend,
    className = '',
    onClick,
    style
}) {
    return (
        <div
            className={`stat-card ${className} ${onClick ? 'stat-card-clickable' : ''}`}
            onClick={onClick}
            style={style}
        >
            <div className="stat-card-header">
                <div className={`stat-card-icon stat-card-icon-${iconColor}`}>
                    {icon}
                </div>
                {change !== undefined && (
                    <span className={`stat-card-change stat-card-change-${changeType}`}>
                        {changeType === 'positive' && '↑'}
                        {changeType === 'negative' && '↓'}
                        {change}
                    </span>
                )}
            </div>
            <div className="stat-card-body">
                <h3 className="stat-card-value">{value}</h3>
                <p className="stat-card-title">{title}</p>
            </div>
            {trend && (
                <div className="stat-card-trend">
                    {trend}
                </div>
            )}
        </div>
    )
}
