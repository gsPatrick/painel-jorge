import styles from './Input.module.css';

export default function Input({ label, error, className = '', ...props }) {
    return (
        <div className={styles.container}>
            {label && <label className={styles.label}>{label}</label>}
            <input
                className={`${styles.input} ${className}`}
                {...props}
            />
            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
}
