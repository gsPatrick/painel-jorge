"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import templateService from '@/services/template.service';
import { Plus, Image as ImageIcon, Trash2, HelpCircle, Download } from 'lucide-react';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            const data = await templateService.getActiveTemplates();
            setTemplates(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Tem certeza que deseja excluir este template?')) return;
        try {
            await templateService.deleteTemplate(id);
            fetchTemplates();
        } catch (error) {
            alert('Erro ao excluir template');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Templates</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Gerencie as molduras de impressão</p>
                </div>
                <Link href="/admin/templates/new">
                    <Button>
                        <Plus size={20} />
                        Novo Template
                    </Button>
                </Link>
            </div>

            {/* Didactic / Help Section */}
            <Card style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <HelpCircle size={24} color="var(--primary)" style={{ marginTop: '0.25rem' }} />
                    <div>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Como criar seus templates?</h3>
                        <p style={{ marginBottom: '1rem', lineHeight: '1.5', color: 'var(--foreground)' }}>
                            Para garantir a melhor qualidade, crie seus arquivos (PNG) no tamanho <strong>A4</strong> (ou proporcional).
                            Deixe uma área transparente onde a foto será encaixada.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="/template-example.psd" download style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
                                <Download size={16} />
                                Baixar Exemplo (PSD)
                            </a>
                            <a href="/template-example.png" download style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 500 }}>
                                <Download size={16} />
                                Baixar Exemplo (PNG)
                            </a>
                        </div>
                    </div>
                </div>
            </Card>

            {loading ? (
                <Card>Carregando...</Card>
            ) : templates.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '3rem' }}>
                    <ImageIcon size={48} style={{ margin: '0 auto 1rem', color: 'var(--muted-foreground)' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum template encontrado</h3>
                    <p style={{ color: 'var(--muted-foreground)' }}>Crie o primeiro template para começar.</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {templates.map((template) => (
                        <Card key={template.id} style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                            <div style={{ height: '300px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {/* Mock preview or real image if accessible. 
                                    Assuming template.fileName is relative or we need a base URL. 
                                    For now just showing icon as placeholder or we could fetch the image. 
                                */}
                                <ImageIcon size={48} color="var(--muted-foreground)" />
                            </div>
                            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{template.name}</h3>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                        {template.isActive ? 'Ativo' : 'Inativo'}
                                    </p>
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(template.id)} style={{ padding: '0.5rem' }}>
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
