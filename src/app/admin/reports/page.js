"use client";

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card/Card';
import api from '@/services/api';
import { BarChart, Users, Trophy, CalendarRange } from 'lucide-react';
import Input from '@/components/ui/Input/Input';

export default function ReportsPage() {
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchRanking = async () => {
        setLoading(true);
        try {
            let url = '/reports/photographers';
            const params = new URLSearchParams();
            if (dateFrom) params.append('from', dateFrom);
            if (dateTo) params.append('to', dateTo);
            if (params.toString()) url += `?${params.toString()}`;

            const res = await api.get(url);
            setRanking(res.data);
        } catch (error) {
            console.error('Failed to fetch ranking', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRanking();
    }, []);

    const handleFilter = () => {
        fetchRanking();
    };

    const maxPrints = ranking.length > 0 ? Math.max(...ranking.map(r => parseInt(r.totalPrints) || 0)) : 1;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>
                        <Trophy size={28} style={{ display: 'inline', marginRight: '0.75rem', verticalAlign: 'middle', color: '#f59e0b' }} />
                        Ranking de Fotógrafos
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                        Performance de impressões por fotógrafo
                    </p>
                </div>
            </div>

            {/* Date Filters */}
            <Card style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarRange size={18} style={{ color: 'var(--muted-foreground)' }} />
                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>Período:</span>
                </div>
                <Input
                    label="De"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    style={{ maxWidth: '180px' }}
                />
                <Input
                    label="Até"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    style={{ maxWidth: '180px' }}
                />
                <button
                    onClick={handleFilter}
                    style={{
                        padding: '0.5rem 1.25rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: 'var(--primary)',
                        color: '#FFF',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        height: '38px',
                    }}
                >
                    Filtrar
                </button>
            </Card>

            {/* Ranking Table */}
            <Card>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                        Carregando dados...
                    </div>
                ) : ranking.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                        <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p>Nenhuma impressão registrada no período.</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={thStyle}>#</th>
                                <th style={{ ...thStyle, textAlign: 'left' }}>Fotógrafo</th>
                                <th style={thStyle}>Impressões</th>
                                <th style={{ ...thStyle, textAlign: 'left' }}>Barra</th>
                                <th style={thStyle}>Última</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranking.map((item, index) => {
                                const prints = parseInt(item.totalPrints) || 0;
                                const barWidth = maxPrints > 0 ? (prints / maxPrints) * 100 : 0;
                                const medals = ['🥇', '🥈', '🥉'];
                                const lastPrint = item.lastPrint
                                    ? new Date(item.lastPrint).toLocaleDateString('pt-BR')
                                    : '—';

                                return (
                                    <tr key={item.userId} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: '1.25rem' }}>
                                            {index < 3 ? medals[index] : index + 1}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ fontWeight: 600 }}>{item.user?.name || 'Sem nome'}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{item.user?.email}</div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                                            {prints}
                                        </td>
                                        <td style={{ ...tdStyle, minWidth: '150px' }}>
                                            <div style={{
                                                height: '8px',
                                                borderRadius: '4px',
                                                background: 'var(--muted)',
                                                overflow: 'hidden',
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${barWidth}%`,
                                                    borderRadius: '4px',
                                                    background: index === 0 ? '#f59e0b' : index === 1 ? '#94a3b8' : index === 2 ? '#cd7f32' : 'var(--primary)',
                                                    transition: 'width 0.5s ease',
                                                }} />
                                            </div>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: 'center', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                            {lastPrint}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </Card>
        </div>
    );
}

const thStyle = {
    padding: '0.75rem 1rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: 'var(--muted-foreground)',
    textAlign: 'center',
};

const tdStyle = {
    padding: '0.75rem 1rem',
};
