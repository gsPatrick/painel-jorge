"use client";

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Card from '@/components/ui/Card/Card';
import templateService from '@/services/template.service';
import userService from '@/services/user.service';
import { X, Save } from 'lucide-react';

export default function UserEditModal({ user, onClose, onSave }) {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [formData, setFormData] = useState({ name: user.name || '', email: user.email, password: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadTemplates();
        if (user.templates) {
            setSelectedTemplates(user.templates.map(t => t.id));
        }
    }, [user]);

    const loadTemplates = async () => {
        try {
            const data = await templateService.getActiveTemplates();
            setTemplates(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleTemplate = (templateId) => {
        if (selectedTemplates.includes(templateId)) {
            setSelectedTemplates(prev => prev.filter(id => id !== templateId));
        } else {
            setSelectedTemplates(prev => [...prev, templateId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Update User Info
            const updateData = { name: formData.name, email: formData.email };
            if (formData.password) updateData.password = formData.password;

            await userService.updateUser(user.id, updateData);

            // Update Templates
            await userService.assignTemplates(user.id, selectedTemplates);

            onSave();
        } catch (error) {
            alert('Erro ao salvar alterações');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
            <Card style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Editar Usuário</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Basic Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Dados de Acesso</h4>
                        <Input
                            label="Nome Completo"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                        <Input
                            label="Nova Senha (opcional)"
                            type="password"
                            placeholder="Deixe em branco para manter"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>

                    {/* Template Association */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--muted-foreground)' }}>Templates Permitidos</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: 'var(--radius)' }}>
                            {templates.map(t => (
                                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTemplates.includes(t.id)}
                                        onChange={() => handleToggleTemplate(t.id)}
                                    />
                                    {t.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" loading={loading}><Save size={18} /> Salvar</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
