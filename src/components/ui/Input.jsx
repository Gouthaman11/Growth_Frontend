import './Input.css'

export default function Input({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    helperText,
    icon,
    required = false,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <div className={`input-wrapper ${error ? 'input-error' : ''} ${className}`}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <div className="input-container">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={type}
                    className={`input ${icon ? 'input-with-icon' : ''}`}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    required={required}
                    {...props}
                />
            </div>
            {(error || helperText) && (
                <span className={`input-helper ${error ? 'input-helper-error' : ''}`}>
                    {error || helperText}
                </span>
            )}
        </div>
    )
}

export function TextArea({
    label,
    placeholder,
    value,
    onChange,
    error,
    rows = 4,
    required = false,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <div className={`input-wrapper ${error ? 'input-error' : ''} ${className}`}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <textarea
                className="input textarea"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                rows={rows}
                {...props}
            />
            {error && <span className="input-helper input-helper-error">{error}</span>}
        </div>
    )
}

export function Select({
    label,
    options = [],
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    className = '',
    ...props
}) {
    return (
        <div className={`input-wrapper ${error ? 'input-error' : ''} ${className}`}>
            {label && (
                <label className="input-label">
                    {label}
                    {required && <span className="input-required">*</span>}
                </label>
            )}
            <select
                className="input select"
                value={value}
                onChange={onChange}
                disabled={disabled}
                required={required}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="input-helper input-helper-error">{error}</span>}
        </div>
    )
}
