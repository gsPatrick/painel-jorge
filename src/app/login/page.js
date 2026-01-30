"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth.service';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        email: 'admin@printshot.com',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await authService.login(formData.email, formData.password);

            if (user.role !== 'admin') {
                setError('Acesso restrito a administradores.');
                setLoading(false);
                return;
            }

            router.push('/admin/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Falha ao realizar login.');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            {/* Left Panel - Hero Image */}
            <div className={styles.leftPanel}>
                {/* Image handled via CSS background */}
            </div>

            {/* Right Panel - Form */}
            <div className={styles.rightPanel}>
                <div className={styles.authBox}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Bem-vindo</h1>
                        <p className={styles.subtitle}>Entre com suas credenciais de administrador.</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="exemplo@printshot.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <Input
                            label="Senha"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {error && (
                            <div className="text-red-500 text-sm bg-red-500/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                            size="lg"
                        >
                            Acessar Painel
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
