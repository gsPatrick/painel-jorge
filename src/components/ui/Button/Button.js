import styles from './Button.module.css';
import { Loader2 } from 'lucide-react';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    loading = false,
    disabled,
    className = '',
    ...props
}) {
    // Construct class names manually to avoid external libs if prefered, or simplest concat
    const classes = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.full : '',
        className
    ].join(' ');

    return (
        <button
            className={classes}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <Loader2 className="animate-spin" size={16} />}
            {children}
        </button>
    );
}
