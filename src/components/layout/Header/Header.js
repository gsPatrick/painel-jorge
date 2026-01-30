"use client";

import { useEffect, useState } from 'react';
import styles from './Header.module.css';
import authService from '@/services/auth.service';

export default function Header() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    return (
        <header className={styles.header}>
            {user && (
                <div className={styles.user}>
                    <span className={styles.email}>{user.email}</span>
                    <div className={styles.avatar}>
                        {user.email.charAt(0).toUpperCase()}
                    </div>
                </div>
            )}
        </header>
    );
}
