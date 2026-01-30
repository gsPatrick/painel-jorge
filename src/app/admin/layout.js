import Sidebar from '@/components/layout/Sidebar/Sidebar';
import Header from '@/components/layout/Header/Header';

export default function AdminLayout({ children }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
            <Sidebar />
            <div style={{ flex: 1, marginLeft: '16rem', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <main style={{ flex: 1, padding: '2rem' }}>
                    {children}
                </main>
            </div>
        </div>
    );
}
