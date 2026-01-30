"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Card from '@/components/ui/Card/Card';
import VisualEditor from '@/components/features/Template/VisualEditor/VisualEditor';
import templateService from '@/services/template.service';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTemplatePage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [config, setConfig] = useState({ x: 50, y: 50, width: 200, height: 200 }); // Default
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            // Create preview URL
            const url = URL.createObjectURL(selectedFile);
            setImagePreview(url);
        }
    };

    const handleSave = async () => {
        if (!name || !file) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('file', file);
            formData.append('configJson', JSON.stringify(config));

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/admin/templates">
                        <Button variant="ghost" style={{ padding: '0.5rem' }}><ArrowLeft size={20} /></Button>
                    </Link>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Novo Template</h1>
                        <p style={{ color: 'var(--muted-foreground)' }}>Configure a área de impressão</p>
                    </div>
                </div>
                <Button onClick={handleSave} loading={loading} disabled={!name || !file}>
                    <Save size={20} />
                    Salvar Template
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
                    label="Imagem de Fundo (A4)"
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
