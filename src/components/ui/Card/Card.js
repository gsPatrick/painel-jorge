import styles from './Card.module.css';

export default function Card({ children, className = '', compact = false, ...props }) {
    return (
        <div
            className={`${styles.card} ${compact ? styles.compact : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
