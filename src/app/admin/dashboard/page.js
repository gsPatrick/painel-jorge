"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card/Card';
import api from '@/services/api';
import { Users, printer, Image as ImageIcon, Activity, Printer } from 'lucide-react'; // printer might not exist, use Printer
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard/stats');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem' }}>Carregando dados...</div>;
    }

    if (!stats) return null;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
                <p style={{ color: 'var(--muted-foreground)' }}>Visão geral do sistema</p>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <StatsCard
                    title="Fotógrafos"
                    value={stats.cards.photographers}
                    icon={<Users size={24} color="var(--primary)" />}
                    desc="Cadastrados no sistema"
                />
                <StatsCard
                    title="Templates Ativos"
                    value={stats.cards.activeTemplates}
                    icon={<ImageIcon size={24} color="var(--secondary)" />}
                    desc="Disponíveis para uso"
                />
                <StatsCard
                    title="Total de Impressões"
                    value={stats.cards.totalPrints}
                    icon={<Printer size={24} color="#10b981" />}
                    desc="Desde o início"
                />
                <StatsCard
                    title="Eventos Ativos"
                    value={stats.cards.activeEvents}
                    icon={<Activity size={24} color="#f59e0b" />}
                    desc="Ocorrendo agora"
                />
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
                <Card>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem' }}>Atividade Semanal de Impressões</h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.charts.activity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar
                                    dataKey="prints"
                                    fill="var(--primary)"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, desc }) {
    return (
        <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--muted-foreground)' }}>{title}</span>
                <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'var(--background)' }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                {value}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                {desc}
            </p>
        </Card>
    );
}
