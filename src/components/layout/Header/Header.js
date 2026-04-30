"use client";

import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import styles from './Header.module.css';
import authService from '@/services/auth.service';
import { useSidebar } from '../Sidebar/Sidebar';

export default function Header() {
    const [user, setUser] = useState(null);
    const { setIsOpen } = useSidebar();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    return (
        <header className={styles.header}>
            <button
                className={styles.hamburger}
                onClick={() => setIsOpen(true)}
                aria-label="Abrir menu"
            >
                <Menu size={22} />
            </button>

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
