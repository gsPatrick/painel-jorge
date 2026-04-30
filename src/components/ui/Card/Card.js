import styles from './Card.module.css';

export default function Card({ children, className = '', compact = false, hoverable = false, ...props }) {
    return (
        <div
            className={`${styles.card} ${compact ? styles.compact : ''} ${hoverable ? styles.hoverable : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}
