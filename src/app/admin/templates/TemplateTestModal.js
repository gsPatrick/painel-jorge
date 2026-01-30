"use client";

import { useState, useRef } from 'react';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button/Button';
import { Upload, X, ZoomIn, ZoomOut } from 'lucide-react';

export default function TemplateTestModal({ template, onClose }) {
    const [testImage, setTestImage] = useState(null);
    const [zoom, setZoom] = useState(1);
    const fileInputRef = useRef(null);

    // Parse config
    let config = template.configJson;
    if (typeof config === 'string') {
        try {
            config = JSON.parse(config);
        } catch (e) {
            config = { x: 0, y: 0, width: 100, height: 100 };
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setTestImage(url);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <Card style={{ width: '90%', maxWidth: '500px', padding: '1.5rem', position: 'relative' }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Testar Template: {template.name}</h2>
                <p style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                    Carregue uma foto para simular como ficaria na moldura.
                </p>

                {/* Preview Area - Aspect Ratio A4-ish or flexible */}
                {/* Preview Area */}
                <div style={{
                    width: '100%',
                    position: 'relative',
                    marginBottom: '1.5rem',
                    border: '1px solid #ccc',
                    backgroundColor: '#eee',
                    overflow: 'hidden'
                }}>
                    {/* Template Layer (Background) */}
                    <img
                        src={`https://geral-apijorge.r954jc.easypanel.host/uploads/${template.fileName}`}
                        alt="Template"
                        style={{
                            display: 'block',
                            width: '100%',
                            height: 'auto',
                            pointerEvents: 'none'
                        }}
                    />

                    {/* User Photo Layer (Overlay) */}
                    {testImage && config && (
                        <div
                            style={{
                                position: 'absolute',
                                left: config.unit === '%' ? `${config.x}%` : config.x,
                                top: config.unit === '%' ? `${config.y}%` : config.y,
                                width: config.unit === '%' ? `${config.width}%` : config.width,
                                height: config.unit === '%' ? `${config.height}%` : config.height,
                                overflow: 'hidden',
                                zIndex: 10, // On top of template
                                backgroundColor: 'white' // Ensure background for photo
                            }}
                        >
                            <img
                                src={testImage}
                                alt="Teste"
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    transform: `scale(${zoom})`,
                                    transition: 'transform 0.1s'
                                }}
                            />
                        </div>
                    )}

                    {!testImage && (
                        <div style={{
                            position: 'absolute', inset: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#999', pointerEvents: 'none',
                            zIndex: 20
                        }}>
                            Nenhuma foto selecionada
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current.click()}>
                            <Upload size={16} style={{ marginRight: '0.5rem' }} />
                            Carregar Foto
                        </Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>

                    {testImage && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}>
                                <ZoomOut size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setZoom(z => z + 0.1)}>
                                <ZoomIn size={16} />
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
