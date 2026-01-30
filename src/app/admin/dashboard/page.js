import Card from '@/components/ui/Card/Card';
import { Users, Image as ImageIcon, Activity } from 'lucide-react';

export default function DashboardPage() {
    // Mock data for MVP
    const stats = [
        {
            label: 'Total de Usuários',
            value: '12',
            icon: Users,
            trend: '+2 novos esta semana'
        },
        {
            label: 'Templates Ativos',
            value: '8',
            icon: ImageIcon,
            trend: '3 categorias'
        },
        {
            label: 'Impressões Hoje',
            value: '142',
            icon: Activity,
            trend: '+12% vs ontem'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Visão geral do sistema PrintShot</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={stat.label}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>
                                    {stat.label}
                                </span>
                                <Icon size={20} color="var(--muted-foreground)" />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                                {stat.value}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                {stat.trend}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Placeholder for future chart or recent activity */}
            <Card style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Gráfico de Atividade (Em Breve)</span>
            </Card>
        </div>
    );
}
