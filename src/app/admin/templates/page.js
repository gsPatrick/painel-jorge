"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button/Button';
import Card from '@/components/ui/Card/Card';
import templateService from '@/services/template.service';
import { Plus, Image as ImageIcon, Trash2, HelpCircle, Download, Edit, Play, Copy, Filter, Eye, EyeOff } from 'lucide-react';
import TemplateTestModal from './TemplateTestModal';

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [testingTemplate, setTestingTemplate] = useState(null);
    const [showInactive, setShowInactive] = useState(false);

    useEffect(() => {
        fetchTemplates();
    }, [showInactive]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            let data;
            if (showInactive) {
                data = await templateService.getAllTemplates();
            } else {
                data = await templateService.getActiveTemplates();
            }
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

    const handleDuplicate = async (id) => {
        try {
            await templateService.duplicateTemplate(id);
            fetchTemplates();
        } catch (error) {
            alert('Erro ao duplicar template');
        }
    };

    const handleToggleStatus = async (template) => {
        try {
            await templateService.toggleTemplateStatus(template.id, !template.isActive);
            fetchTemplates();
        } catch (error) {
            alert('Erro ao alterar status');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.25rem' }}>Templates</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Gerencie as molduras de impressão</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                        variant={showInactive ? 'primary' : 'outline'}
                        size="sm"
                        onClick={() => setShowInactive(!showInactive)}
                        style={{ gap: '0.4rem' }}
                    >
                        <Filter size={14} />
                        {showInactive ? 'Todos' : 'Somente Ativos'}
                    </Button>
                    <Link href="/admin/templates/new">
                        <Button>
                            <Plus size={18} />
                            Novo Template
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Help Section */}
            <Card style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <HelpCircle size={24} color="var(--primary)" style={{ marginTop: '0.25rem', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9375rem' }}>Como criar seus templates?</h3>
                        <p style={{ marginBottom: '1rem', lineHeight: '1.5', color: 'var(--foreground)', fontSize: '0.875rem' }}>
                            Crie seus arquivos (PNG) no tamanho <strong>A4</strong> (ou proporcional).
                            Deixe uma área transparente onde a foto será encaixada.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <a href="/template-example.psd" download style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>
                                <Download size={14} />
                                Baixar Exemplo (PSD)
                            </a>
                            <a href="/template-example.png" download style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 500 }}>
                                <Download size={14} />
                                Baixar Exemplo (PNG)
                            </a>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Template Grid */}
            {loading ? (
                <Card>Carregando...</Card>
            ) : templates.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '3rem' }}>
                    <ImageIcon size={48} style={{ margin: '0 auto 1rem', color: 'var(--muted-foreground)' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Nenhum template encontrado</h3>
                    <p style={{ color: 'var(--muted-foreground)' }}>Crie o primeiro template para começar.</p>
                </Card>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onDelete={handleDelete}
                            onDuplicate={handleDuplicate}
                            onTest={setTestingTemplate}
                            onToggleStatus={handleToggleStatus}
                        />
                    ))}
                </div>
            )}

            {testingTemplate && (
                <TemplateTestModal
                    template={testingTemplate}
                    onClose={() => setTestingTemplate(null)}
                />
            )}
        </div>
    );
}

function TemplateCard({ template, onDelete, onDuplicate, onTest, onToggleStatus }) {
    const [imgError, setImgError] = useState(false);

    return (
        <Card hoverable style={{ padding: 0, overflow: 'hidden', position: 'relative', opacity: template.isActive ? 1 : 0.7 }}>
            {/* Status Badge */}
            {!template.isActive && (
                <div style={{
                    position: 'absolute', top: '0.5rem', left: '0.5rem', zIndex: 5,
                    backgroundColor: 'rgba(239, 68, 68, 0.9)', color: '#fff',
                    padding: '0.2rem 0.5rem', borderRadius: '0.375rem',
                    fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase'
                }}>
                    Inativo
                </div>
            )}
            <div style={{ aspectRatio: '210/297', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {!imgError ? (
                    <img
                        src={`https://geral-apijorge.r954jc.easypanel.host/uploads/${template.fileName}`}
                        alt={template.name}
                        style={{ width: '100%', height: '100%', objectFit: 'fill' }}
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                        <ImageIcon size={48} />
                        <span style={{ fontSize: '0.75rem' }}>Imagem não encontrada</span>
                    </div>
                )}
            </div>
            <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: '0.15rem', fontSize: '0.9375rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{template.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: template.isActive ? '#22c55e' : '#ef4444' }}>
                        {template.isActive ? 'Ativo' : 'Inativo'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', flexShrink: 0 }}>
                    <Button variant="ghost" size="sm" style={{ padding: '0.35rem' }} title="Testar" onClick={() => onTest(template)}>
                        <Play size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" style={{ padding: '0.35rem' }} title="Duplicar" onClick={() => onDuplicate(template.id)}>
                        <Copy size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" style={{ padding: '0.35rem' }} title={template.isActive ? "Desativar" : "Ativar"} onClick={() => onToggleStatus(template)}>
                        {template.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                    </Button>
                    <Link href={`/admin/templates/${template.id}`}>
                        <Button variant="ghost" size="sm" style={{ padding: '0.35rem' }} title="Editar">
                            <Edit size={14} />
                        </Button>
                    </Link>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(template.id)} style={{ padding: '0.35rem' }} title="Excluir">
                        <Trash2 size={14} />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
