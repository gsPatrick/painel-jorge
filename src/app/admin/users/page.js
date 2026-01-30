"use client";

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Card from '@/components/ui/Card/Card';
import userService from '@/services/user.service';
import { Plus, User, MoreHorizontal, CheckCircle, XCircle, Trash2, Edit } from 'lucide-react';
import styles from './users.module.css';
import UserEditModal from './UserEditModal';
import UserCreateModal from './UserCreateModal';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [newUser, setNewUser] = useState({ email: '', password: '' });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            // Filter out admins from the list
            setUsers(data.filter(u => u.role !== 'admin'));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await userService.createUser({ ...newUser, role: 'photographer' });
            setIsCreating(false);
            setNewUser({ email: '', password: '' });
            fetchUsers();
        } catch (error) {
            alert('Erro ao criar usuário');
        }
    };

    const toggleStatus = async (user) => {
        try {
            await userService.updateUserStatus(user.id, !user.isActive);
            fetchUsers();
        } catch (error) {
            alert('Erro ao atualizar status');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Deseja excluir este usuário permanentemente?')) return;
        try {
            await userService.deleteUser(id);
            fetchUsers();
        } catch (error) {
            alert('Erro ao excluir usuário');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>Fotógrafos</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Gerencie o acesso ao aplicativo</p>
                </div>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus size={20} />
                    Novo Usuário
                </Button>
            </div>

            {/* Modals */}
            {isCreating && (
                <UserCreateModal
                    onClose={() => setIsCreating(false)}
                    onSave={() => {
                        setIsCreating(false);
                        fetchUsers();
                    }}
                />
            )}

            <Card style={{ padding: 0, overflow: 'hidden' }}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Status</th>
                            <th>Templates</th>
                            <th style={{ textAlign: 'right' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <User size={16} />
                                        </div>
                                        <div>
                                            <span style={{ fontWeight: 500, display: 'block' }}>{user.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span style={{
                                        display: 'inline-flex', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                                        backgroundColor: user.isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: user.isActive ? '#22c55e' : '#ef4444'
                                    }}>
                                        {user.isActive ? 'Ativo' : 'Inativo'}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                    {user.templates?.length || 0} associados
                                </td>
                                <td style={{ textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setEditingUser(user)}
                                        title="Editar"
                                    >
                                        <Edit size={16} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleStatus(user)}
                                        title={user.isActive ? "Bloquear" : "Desbloquear"}
                                    >
                                        {user.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(user.id)}
                                        title="Excluir"
                                        style={{ color: 'var(--destructive)' }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Edit Modal */}
            {editingUser && (
                <UserEditModal
                    user={editingUser}
                    onClose={() => setEditingUser(null)}
                    onSave={() => {
                        setEditingUser(null);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
}
