import styles from './Skeleton.module.css';

export default function Skeleton({ className = '', width, height, ...props }) {
    return (
        <div
            className={`${styles.skeleton} ${className}`}
            style={{ width, height }}
            {...props}
        />
    );
}
