"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Image as ImageIcon, Users, LogOut, BarChart3 } from 'lucide-react';
import styles from './Sidebar.module.css';
import authService from '@/services/auth.service';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

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
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <span className={styles.logoText}>PrintShot Admin</span>
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
                        >
                            <Icon size={20} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className={styles.footer}>
                <button onClick={handleLogout} className={styles.link} style={{ width: '100%' }}>
                    <LogOut size={20} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
