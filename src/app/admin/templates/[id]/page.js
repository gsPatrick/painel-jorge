"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Card from '@/components/ui/Card/Card';
import AdvancedVisualEditor from '@/components/features/Template/AdvancedVisualEditor/AdvancedVisualEditor';
import TextLayerEditor from '@/components/features/Template/TextLayerEditor/TextLayerEditor';
import templateService from '@/services/template.service';
import { Save, ArrowLeft, MousePointer2, Maximize, RotateCw, Layers, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';
import styles from './edit.module.css';

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
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Auto-collapse sidebar on mobile
    useEffect(() => {
        const checkWidth = () => {
            if (window.innerWidth <= 768) {
                setSidebarOpen(false);
            }
        };
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, []);

    useEffect(() => {
        if (id) fetchTemplate();
    }, [id]);

    const fetchTemplate = async () => {
        try {
            const data = await templateService.getTemplateById(id);
            setName(data.name);

            const cfg = data.configJson || {};
            setConfig({ x: cfg.x || 50, y: cfg.y || 50, width: cfg.width || 200, height: cfg.height || 200, unit: cfg.unit,
                overlayX: cfg.overlayX, overlayY: cfg.overlayY, overlayWidth: cfg.overlayWidth, overlayHeight: cfg.overlayHeight, overlayRotation: cfg.overlayRotation
            });

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

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '0.75rem', color: 'var(--muted-foreground)' }}>
                <Loader2 size={24} className="animate-spin" />
                Carregando template...
            </div>
        );
    }

    return (
        <div className={styles.editorRoot}>
            {/* Header */}
            <header className={styles.editorHeader}>
                <div className={styles.headerLeft}>
                    <Link href="/admin/templates">
                        <Button variant="ghost" style={{ padding: '0.5rem' }}><ArrowLeft size={20} /></Button>
                    </Link>
                    <div className={styles.headerTitle}>
                        <h1>{name || 'Editar Template'}</h1>
                        <p>ID: {id}</p>
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className={styles.sidebarToggle}
                    >
                        <Layers size={16} />
                        <span className={styles.hideOnMobile}>Painel</span>
                    </Button>
                    <Button onClick={handleSave} loading={saving} disabled={!name} style={{ gap: '0.4rem' }}>
                        <Save size={18} />
                        <span className={styles.hideOnMobile}>Salvar</span>
                    </Button>
                </div>
            </header>

            <div className={styles.editorBody}>
                {/* Sidebar */}
                <aside className={`${styles.editorSidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
                    <div className={styles.sidebarScroll}>
                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Informações Gerais</h3>
                            <div className={styles.sectionContent}>
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

                                <div className={styles.fieldGroup}>
                                    <label className={styles.fieldLabel}>Moldura (Overlay PNG)</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <input
                                            type="file"
                                            accept="image/png"
                                            onChange={handleOverlayFileChange}
                                            style={{ fontSize: '0.75rem', flex: 1, minWidth: 0 }}
                                        />
                                        {overlayPreview && (
                                            <button
                                                onClick={() => {
                                                    setOverlayFile(null);
                                                    setOverlayPreview(null);
                                                    setConfig(prev => ({ ...prev, removeOverlay: true }));
                                                }}
                                                className={styles.removeBtn}
                                            >
                                                Remover
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Dimensões (Canvas)</h3>
                            <div className={styles.presetGrid}>
                                {CANVAS_PRESETS.map((preset) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => handleCanvasPreset(preset.label)}
                                        className={`${styles.presetBtn} ${canvasPreset === preset.label ? styles.presetActive : ''}`}
                                    >
                                        {preset.label}
                                    </button>
                                ))}
                            </div>

                            {canvasPreset === 'Personalizado' && (
                                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
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

                        <section className={styles.section}>
                            <h3 className={styles.sectionTitle}>Camadas de Texto</h3>
                            <TextLayerEditor layers={textLayers} onChange={setTextLayers} />
                        </section>
                    </div>
                </aside>

                {/* Main Workspace */}
                <main className={styles.workspace}>
                    {/* Floating Tips */}
                    <div className={styles.floatingTips}>
                        <div className={styles.tip}>
                            <MousePointer2 size={14} color="#3b82f6" />
                            <span><b>Arraste</b> p/ mover</span>
                        </div>
                        <div className={styles.tip}>
                            <Maximize size={14} color="#10b981" />
                            <span><b>Cantos</b> p/ redimensionar</span>
                        </div>
                        <div className={styles.tip}>
                            <RotateCw size={14} color="#f59e0b" />
                            <span><b>Alça</b> p/ girar</span>
                        </div>
                    </div>

                    <div className={styles.canvasContainer}>
                        <div className={styles.canvasWrapper}>
                            <AdvancedVisualEditor
                                imageSrc={imagePreview}
                                overlaySrc={overlayPreview}
                                initialConfig={config}
                                onChange={setConfig}
                                canvasSize={canvasSize}
                                textLayers={textLayers}
                                onTextLayerChange={setTextLayers}
                            />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
