"use client";

import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Image as ImageIcon, Users, LogOut, BarChart3, Menu, X } from 'lucide-react';
import styles from './Sidebar.module.css';
import authService from '@/services/auth.service';
import { useRouter } from 'next/navigation';

// Context to share sidebar state
export const SidebarContext = createContext({ isOpen: false, setIsOpen: () => {} });

export function SidebarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar on route change (mobile)
    const pathname = usePathname();
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isOpen, setIsOpen } = useSidebar();

    const menuItems = [
        {
            label: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard
        },
        {
            label: 'Templates',
            href: '/admin/templates',
            icon: ImageIcon
        },
        {
            label: 'Fotógrafos',
            href: '/admin/users',
            icon: Users
        },
        {
            label: 'Relatórios',
            href: '/admin/reports',
            icon: BarChart3
        }
    ];

    const handleLogout = () => {
        authService.logout();
        router.push('/login');
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setIsOpen(false)}
                    aria-hidden="true"
                />
            )}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    <span className={styles.logoText}>Shottelling</span>
                    <button
                        className={styles.closeMobile}
                        onClick={() => setIsOpen(false)}
                        aria-label="Fechar menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className={styles.nav}>
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.link} ${isActive ? styles.active : ''}`}
                                onClick={() => setIsOpen(false)}
                            >
                                <Icon size={20} />
                                <span className={styles.linkLabel}>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.footer}>
                    <button onClick={handleLogout} className={styles.link} style={{ width: '100%' }}>
                        <LogOut size={20} />
                        <span className={styles.linkLabel}>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
