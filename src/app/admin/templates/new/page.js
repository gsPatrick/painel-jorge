"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Card from '@/components/ui/Card/Card';
import VisualEditor from '@/components/features/Template/VisualEditor/VisualEditor';
import AdvancedVisualEditor from '@/components/features/Template/AdvancedVisualEditor/AdvancedVisualEditor';
import TextLayerEditor from '@/components/features/Template/TextLayerEditor/TextLayerEditor';
import templateService from '@/services/template.service';
import { Save, ArrowLeft, Wand2, PenTool, MousePointer2, Maximize, RotateCw, Mouse } from 'lucide-react';
import Link from 'next/link';

const CANVAS_PRESETS = [
    { label: 'A4 (210×297mm)', width: 210, height: 297 },
    { label: '10×15cm', width: 100, height: 150 },
    { label: 'Polaroid (88×107mm)', width: 88, height: 107 },
    { label: 'Quadrado (150×150mm)', width: 150, height: 150 },
    { label: 'Personalizado', width: 0, height: 0 },
];

export default function NewTemplatePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [config, setConfig] = useState({ x: 50, y: 50, width: 200, height: 200 });
    const [canvasSize, setCanvasSize] = useState({ width: 210, height: 297 });
    const [canvasPreset, setCanvasPreset] = useState('A4 (210×297mm)');
    const [textLayers, setTextLayers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdvancedMode, setIsAdvancedMode] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const url = URL.createObjectURL(selectedFile);
            setImagePreview(url);
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
        if (!name || !file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('file', file);
            formData.append('configJson', JSON.stringify({
                ...config,
                canvasSize,
                textLayers,
            }));

            await templateService.uploadTemplate(formData);
            router.push('/admin/templates');
        } catch (error) {
            console.error("Upload failed", error);
            alert("Erro ao salvar template");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100vh - 40px)', 
            margin: '-20px', 
            backgroundColor: '#f1f5f9'
        }}>
            {/* Professional Header */}
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
                        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Novo Template</h1>
                        <p style={{ color: '#64748b', fontSize: '0.75rem', margin: 0 }}>Configure as áreas de impressão</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button variant="outline" onClick={() => setIsAdvancedMode(!isAdvancedMode)} style={{ gap: '0.5rem' }}>
                        {isAdvancedMode ? <PenTool size={16} /> : <Wand2 size={16} />}
                        {isAdvancedMode ? 'Editor Simples' : 'Editor Avançado'}
                    </Button>
                    <Button onClick={handleSave} loading={loading} disabled={!name || !file} style={{ gap: '0.5rem' }}>
                        <Save size={18} />
                        Salvar Template
                    </Button>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                {/* Sidebar */}
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
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Informações Básicas</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <Input
                                label="Nome do Template"
                                placeholder="Ex: Evento Corporativo"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input
                                label="Imagem de Fundo"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                    </section>

                    <section style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem', color: '#1e293b' }}>Tamanho do Papel</h3>
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
                                    label="L (mm)"
                                    type="number"
                                    value={canvasSize.width}
                                    onChange={(e) => setCanvasSize(s => ({ ...s, width: parseInt(e.target.value) || 0 }))}
                                />
                                <Input
                                    label="A (mm)"
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

                {/* Main Editor Area */}
                <main style={{ 
                    flex: 1, 
                    backgroundColor: '#cbd5e1', 
                    overflow: 'hidden', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative'
                }}>
                    {/* Professional Tips Bar */}
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
                        border: '1px solid rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(8px)'
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
                        padding: '3rem',
                        overflow: 'auto'
                    }}>
                        <div style={{ 
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            backgroundColor: '#fff',
                            lineHeight: 0
                        }}>
                            {isAdvancedMode ? (
                                <AdvancedVisualEditor
                                    imageSrc={imagePreview}
                                    initialConfig={config}
                                    onChange={setConfig}
                                    canvasSize={canvasSize}
                                    textLayers={textLayers}
                                    onTextLayerChange={setTextLayers}
                                />
                            ) : (
                                <VisualEditor
                                    imageSrc={imagePreview}
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
