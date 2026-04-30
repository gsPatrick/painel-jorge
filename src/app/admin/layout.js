import Sidebar, { SidebarProvider } from '@/components/layout/Sidebar/Sidebar';
import Header from '@/components/layout/Header/Header';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
    return (
        <SidebarProvider>
            <div className={styles.container}>
                <Sidebar />
                <div className={styles.main}>
                    <Header />
                    <main className={styles.content}>
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
}
