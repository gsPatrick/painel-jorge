"use client";

import { useState } from 'react';
import { Plus, X, Type, Clock, Hash } from 'lucide-react';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';

const VARIABLE_PRESETS = [
    { label: 'Data', value: '{date}', icon: Clock },
    { label: 'Hora', value: '{time}', icon: Clock },
    { label: 'Contador', value: '{counter}', icon: Hash },
];

export default function TextLayerEditor({ layers = [], onChange }) {
    const addLayer = () => {
        const newLayer = {
            id: Date.now(),
            content: '{date} | {time}',
            x: 5,
            y: 90,
            size: 14,
            color: '#FFFFFF',
        };
        onChange([...layers, newLayer]);
    };

    const updateLayer = (index, field, value) => {
        const updated = [...layers];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const removeLayer = (index) => {
        const updated = layers.filter((_, i) => i !== index);
        onChange(updated);
    };

    const insertVariable = (index, variable) => {
        const updated = [...layers];
        updated[index] = {
            ...updated[index],
            content: updated[index].content + ' ' + variable,
        };
        onChange(updated);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                    <Type size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Camadas de Texto
                </h3>
                <Button variant="outline" size="sm" onClick={addLayer}>
                    <Plus size={14} style={{ marginRight: '0.25rem' }} />
                    Adicionar Texto
                </Button>
            </div>

            {layers.length === 0 && (
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem' }}>
                    Nenhuma camada de texto. Clique em "Adicionar Texto" para inserir data, hora ou texto fixo.
                </p>
            )}

            {layers.map((layer, index) => (
                <div
                    key={layer.id || index}
                    style={{
                        backgroundColor: 'var(--muted)',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        position: 'relative',
                    }}
                >
                    <button
                        onClick={() => removeLayer(index)}
                        style={{
                            position: 'absolute',
                            top: '0.5rem',
                            right: '0.5rem',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: 'var(--muted-foreground)',
                        }}
                    >
                        <X size={16} />
                    </button>

                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>
                        TEXTO #{index + 1}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 500 }}>Conteúdo</label>
                        <textarea
                            placeholder="Ex: {date} | {time} | Foto #{counter}"
                            value={layer.content}
                            onChange={(e) => updateLayer(index, 'content', e.target.value)}
                            style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '0.5rem',
                                borderRadius: '0.5rem',
                                border: '1px solid var(--border)',
                                background: 'var(--background)',
                                color: 'var(--foreground)',
                                fontSize: '0.875rem',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                            }}
                        />
                    </div>

                    {/* Variable insert buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {VARIABLE_PRESETS.map((preset) => (
                            <button
                                key={preset.value}
                                onClick={() => insertVariable(index, preset.value)}
                                style={{
                                    fontSize: '0.7rem',
                                    padding: '0.25rem 0.5rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    color: 'var(--foreground)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                }}
                            >
                                <preset.icon size={10} />
                                {preset.label}: <code>{preset.value}</code>
                            </button>
                        ))}
                    </div>

                    {/* Position & Style */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>X (%)</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={layer.x}
                                onChange={(e) => updateLayer(index, 'x', parseFloat(e.target.value) || 0)}
                                style={{
                                    width: '100%',
                                    padding: '0.35rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    color: 'var(--foreground)',
                                    fontSize: '0.8rem',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Y (%)</label>
                            <input
                                type="number"
                                min={0}
                                max={100}
                                value={layer.y}
                                onChange={(e) => updateLayer(index, 'y', parseFloat(e.target.value) || 0)}
                                style={{
                                    width: '100%',
                                    padding: '0.35rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    color: 'var(--foreground)',
                                    fontSize: '0.8rem',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Tamanho</label>
                            <input
                                type="number"
                                min={8}
                                max={72}
                                value={layer.size}
                                onChange={(e) => updateLayer(index, 'size', parseInt(e.target.value) || 14)}
                                style={{
                                    width: '100%',
                                    padding: '0.35rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid var(--border)',
                                    background: 'var(--background)',
                                    color: 'var(--foreground)',
                                    fontSize: '0.8rem',
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Cor</label>
                            <input
                                type="color"
                                value={layer.color}
                                onChange={(e) => updateLayer(index, 'color', e.target.value)}
                                style={{
                                    width: '100%',
                                    height: '32px',
                                    padding: 0,
                                    border: '1px solid var(--border)',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
