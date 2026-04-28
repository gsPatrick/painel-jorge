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
import { Save, ArrowLeft, Wand2, PenTool } from 'lucide-react';
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/admin/templates">
                        <Button variant="ghost" style={{ padding: '0.5rem' }}><ArrowLeft size={20} /></Button>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Editar Template</h1>
                        <p style={{ color: 'var(--muted-foreground)' }}>Atualizar configurações</p>
                    </div>
                </div>
                <Button onClick={handleSave} loading={saving} disabled={!name}>
                    <Save size={20} />
                    Salvar Alterações
                </Button>
            </div>

            <Card style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Input
                    label="Nome do Template"
                    placeholder="Ex: Casamento João e Maria"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <Input
                    label="Alterar Imagem de Fundo (Opcional)"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            label="Imagem de Sobreposição / Moldura (PNG Transparente)"
                            type="file"
                            accept="image/png"
                            onChange={handleOverlayFileChange}
                        />
                    </div>
                    {overlayPreview && (
                        <Button 
                            variant="danger" 
                            onClick={() => {
                                setOverlayFile(null);
                                setOverlayPreview(null);
                                // Set a flag or clear the field so the update knows to remove it
                                setConfig(prev => ({ ...prev, removeOverlay: true }));
                            }}
                            style={{ 
                                marginBottom: '0.5rem',
                                backgroundColor: '#ef4444',
                                color: '#fff',
                                padding: '0.5rem 1rem',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem'
                            }}
                        >
                            Remover
                        </Button>
                    )}
                </div>

                {/* Canvas Size Selector */}
                <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '0.5rem' }}>
                        Tamanho do Canvas
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {CANVAS_PRESETS.map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => handleCanvasPreset(preset.label)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: canvasPreset === preset.label ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    background: canvasPreset === preset.label ? 'var(--primary)' : 'var(--background)',
                                    color: canvasPreset === preset.label ? '#FFF' : 'var(--foreground)',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    fontWeight: 500,
                                    transition: 'all 0.15s',
                                }}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>

                    {canvasPreset === 'Personalizado' && (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                            <Input
                                label="Largura (mm)"
                                type="number"
                                value={canvasSize.width}
                                onChange={(e) => setCanvasSize(s => ({ ...s, width: parseInt(e.target.value) || 0 }))}
                            />
                            <Input
                                label="Altura (mm)"
                                type="number"
                                value={canvasSize.height}
                                onChange={(e) => setCanvasSize(s => ({ ...s, height: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                    )}
                </div>
            </Card>

            {/* Editor Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', display: 'flex', gap: '1rem' }}>
                    <span>🖱️ <b>Arraste</b> para mover</span>
                    <span>📐 <b>Cantos</b> para redimensionar</span>
                    <span>🔄 <b>Alça superior</b> para girar</span>
                    <span>🖱️🖱️ <b>Clique duplo</b> p/ selecionar</span>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                    style={{ gap: '0.5rem' }}
                >
                    {isAdvancedMode ? <PenTool size={16} /> : <Wand2 size={16} />}
                    {isAdvancedMode ? 'Mudar para Editor Simples' : 'Mudar para Editor Avançado'}
                </Button>
            </div>

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

            <Card>
                <TextLayerEditor layers={textLayers} onChange={setTextLayers} />
            </Card>

            {/* Debug Info */}
            <Card style={{ backgroundColor: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                <strong>Configuração (JSON):</strong> {JSON.stringify({ ...config, canvasSize, textLayers }, null, 2)}
            </Card>
        </div>
    );
}
