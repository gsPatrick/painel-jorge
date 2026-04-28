"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Card from '@/components/ui/Card/Card';
import VisualEditor from '@/components/features/Template/VisualEditor/VisualEditor';
import AdvancedVisualEditor from '@/components/features/Template/AdvancedVisualEditor/AdvancedVisualEditor';
import TextLayerEditor from '@/components/features/Template/TextLayerEditor/TextLayerEditor';
import templateService from '@/services/template.service';
import { Save, ArrowLeft, Wand2, PenTool, MousePointer2, Maximize, RotateCw, Mouse } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

const CANVAS_PRESETS = [
    { label: 'A4 (210×297mm)', width: 210, height: 297 },
    { label: '10×15cm', width: 100, height: 150 },
    { label: 'Polaroid (88×107mm)', width: 88, height: 107 },
    { label: 'Quadrado (150×150mm)', width: 150, height: 150 },
    { label: 'Personalizado', width: 0, height: 0 },
];

export default function EditTemplatePage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [overlayFile, setOverlayFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [overlayPreview, setOverlayPreview] = useState(null);
    const [config, setConfig] = useState({ x: 50, y: 50, width: 200, height: 200 });
    const [canvasSize, setCanvasSize] = useState({ width: 210, height: 297 });
    const [canvasPreset, setCanvasPreset] = useState('A4 (210×297mm)');
    const [textLayers, setTextLayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    useEffect(() => {
        if (id) fetchTemplate();
    }, [id]);

    const fetchTemplate = async () => {
        try {
            const data = await templateService.getTemplateById(id);
            setName(data.name);

            const cfg = data.configJson || {};
            setConfig({ x: cfg.x || 50, y: cfg.y || 50, width: cfg.width || 200, height: cfg.height || 200, unit: cfg.unit });

            if (cfg.canvasSize) {
                setCanvasSize(cfg.canvasSize);
                const match = CANVAS_PRESETS.find(p => p.width === cfg.canvasSize.width && p.height === cfg.canvasSize.height);
                setCanvasPreset(match ? match.label : 'Personalizado');
            }

            if (cfg.textLayers) {
                setTextLayers(cfg.textLayers);
            }

            const imageUrl = `${api.defaults.baseURL.replace('/api', '')}/uploads/${data.fileName}`;
            setImagePreview(imageUrl);

            if (data.overlayFileName) {
                const overlayUrl = `${api.defaults.baseURL.replace('/api', '')}/uploads/${data.overlayFileName}`;
                setOverlayPreview(overlayUrl);
            }
        } catch (error) {
            console.error("Failed to fetch template", error);
            alert("Erro ao carregar template");
            router.push('/admin/templates');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setImagePreview(url);
        }
    };

    const handleOverlayFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setOverlayFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setOverlayPreview(url);
        }
    };

    const handleCanvasPreset = (presetLabel) => {
        setCanvasPreset(presetLabel);
        const preset = CANVAS_PRESETS.find(p => p.label === presetLabel);
        if (preset && preset.width > 0) {
            setCanvasSize({ width: preset.width, height: preset.height });
        }
    };

    const handleSave = async () => {
        if (!name) return;

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (file) formData.append('file', file);
            if (overlayFile) formData.append('overlayFile', overlayFile);
            formData.append('configJson', JSON.stringify({
                ...config,
                canvasSize,
                textLayers,
            }));

            await templateService.updateTemplate(id, formData);
            router.push('/admin/templates');
        } catch (error) {
            console.error("Update failed", error);
            alert("Erro ao atualizar template");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Carregando...</div>;

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100vh - 40px)', 
            margin: '-20px', // Offset default padding if any
            backgroundColor: '#f1f5f9'
        }}>
            {/* Sticky Header */}
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '1rem 2rem', 
                backgroundColor: '#fff', 
                borderBottom: '1px solid #e2e8f0',
                zIndex: 50
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/admin/templates">
                        <Button variant="ghost" style={{ padding: '0.5rem' }}><ArrowLeft size={20} /></Button>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{name || 'Novo Template'}</h1>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>ID: {id === 'new' ? 'Novo' : id}</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button variant="outline" onClick={() => setIsAdvancedMode(!isAdvancedMode)} style={{ gap: '0.5rem' }}>
                        {isAdvancedMode ? <PenTool size={16} /> : <Wand2 size={16} />}
                        {isAdvancedMode ? 'Editor Simples' : 'Editor Avançado'}
                    </Button>
                    <Button onClick={handleSave} loading={saving} disabled={!name} style={{ gap: '0.5rem' }}>
                        <Save size={18} />
                        Salvar
                    </Button>
                </div>
            </header>

            <div style={{ 
                display: 'flex', 
                flex: 1, 
                overflow: 'hidden', 
                flexDirection: 'row',
                flexWrap: 'wrap'
            }}>
                {/* Sidebar Settings */}
                <aside style={{ 
                    width: '350px', 
                    backgroundColor: '#fff', 
                    borderRight: '1px solid #e2e8f0', 
                    padding: '1.5rem', 
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                }}>
                    <section>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Informações Gerais</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input
                                label="Nome do Template"
                                placeholder="Ex: Casamento João e Maria"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input
                                label="Fundo (Background)"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Moldura (Overlay PNG)</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                        type="file" 
                                        accept="image/png" 
                                        onChange={handleOverlayFileChange}
                                        style={{ fontSize: '0.75rem', flex: 1 }}
                                    />
                                    {overlayPreview && (
                                        <button 
                                            onClick={() => {
                                                setOverlayFile(null);
                                                setOverlayPreview(null);
                                                setConfig(prev => ({ ...prev, removeOverlay: true }));
                                            }}
                                            style={{ backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem' }}
                                        >
                                            Remover
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Dimensões (Canvas)</h3>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                            {CANVAS_PRESETS.map((preset) => (
                                <button
                                    key={preset.label}
                                    onClick={() => handleCanvasPreset(preset.label)}
                                    style={{
                                        padding: '0.4rem 0.75rem',
                                        borderRadius: '0.375rem',
                                        border: '1px solid',
                                        borderColor: canvasPreset === preset.label ? '#3b82f6' : '#e2e8f0',
                                        background: canvasPreset === preset.label ? '#eff6ff' : '#fff',
                                        color: canvasPreset === preset.label ? '#2563eb' : '#64748b',
                                        cursor: 'pointer',
                                        fontSize: '0.7rem',
                                        fontWeight: 500,
                                    }}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        {canvasPreset === 'Personalizado' && (
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <Input
                                    label="W (mm)"
                                    type="number"
                                    value={canvasSize.width}
                                    onChange={(e) => setCanvasSize(s => ({ ...s, width: parseInt(e.target.value) || 0 }))}
                                />
                                <Input
                                    label="H (mm)"
                                    type="number"
                                    value={canvasSize.height}
                                    onChange={(e) => setCanvasSize(s => ({ ...s, height: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        )}
                    </section>

                    <section style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Camadas de Texto</h3>
                        <TextLayerEditor layers={textLayers} onChange={setTextLayers} />
                    </section>
                </aside>

                {/* Main Workspace */}
                <main style={{ 
                    flex: 1, 
                    position: 'relative', 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: '#cbd5e1', // Darker gray for workspace background
                    overflow: 'hidden'
                }}>
                    {/* Command Legend */}
                    <div style={{ 
                        position: 'absolute', 
                        top: '1.5rem', 
                        left: '50%', 
                        transform: 'translateX(-50%)', 
                        zIndex: 20,
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        padding: '0.6rem 1.25rem',
                        borderRadius: '99px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.5rem',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                            <MousePointer2 size={14} color="#3b82f6" /> 
                            <span><b>Arraste</b> p/ mover</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                            <Maximize size={14} color="#10b981" /> 
                            <span><b>Cantos</b> p/ redimensionar</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                            <RotateCw size={14} color="#f59e0b" /> 
                            <span><b>Alça</b> p/ girar</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#475569' }}>
                            <Mouse size={14} color="#8b5cf6" /> 
                            <span><b>Duplo clique</b> p/ selecionar</span>
                        </div>
                    </div>

                    <div style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        padding: '2rem',
                        overflow: 'auto'
                    }}>
                        <div style={{ 
                            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                            backgroundColor: '#fff',
                            lineHeight: 0
                        }}>
                            {isAdvancedMode ? (
                                <AdvancedVisualEditor
                                    imageSrc={imagePreview}
                                    overlaySrc={overlayPreview}
                                    initialConfig={config}
                                    onChange={setConfig}
                                    canvasSize={canvasSize}
                                    textLayers={textLayers}
                                    onTextLayerChange={setTextLayers}
                                />
                            ) : (
                                <VisualEditor
                                    imageSrc={imagePreview}
                                    overlaySrc={overlayPreview}
                                    initialConfig={config}
                                    onChange={setConfig}
                                    canvasSize={canvasSize}
                                />
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
