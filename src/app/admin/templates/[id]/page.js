"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation'; // useParams for ID
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Card from '@/components/ui/Card/Card';
import VisualEditor from '@/components/features/Template/VisualEditor/VisualEditor';
import templateService from '@/services/template.service';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/services/api';

export default function EditTemplatePage() {
    const router = useRouter();
    const params = useParams(); // Get ID from URL
    const { id } = params;

    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [config, setConfig] = useState({ x: 50, y: 50, width: 200, height: 200 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) {
            fetchTemplate();
        }
    }, [id]);

    const fetchTemplate = async () => {
        try {
            const data = await templateService.getTemplateById(id);
            setName(data.name);
            setConfig(data.configJson);
            // Set preview to existing image on server
            // Use the baseURL from api service or env if needed, but here we can rely on absolute path if we know it
            // Or better, just construct it.
            const imageUrl = `${api.defaults.baseURL.replace('/api', '')}/uploads/${data.fileName}`;
            setImagePreview(imageUrl);
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

    const handleSave = async () => {
        if (!name) return; // File is optional on update

        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (file) {
                formData.append('file', file);
            }
            formData.append('configJson', JSON.stringify(config));

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
            </Card>

            <VisualEditor
                imageSrc={imagePreview}
                initialConfig={config}
                onChange={setConfig}
            />

            {/* Debug Info */}
            <Card style={{ backgroundColor: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                <strong>Configuração (JSON):</strong> {JSON.stringify(config)}
            </Card>
        </div>
    );
}
