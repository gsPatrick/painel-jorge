import api from './api';

const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

const updateUserStatus = async (id, isActive) => {
    const response = await api.put(`/users/${id}/status`, { isActive });
    return response.data;
};

const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

const updateUser = async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
};

const assignTemplates = async (id, templateIds) => {
    const response = await api.post(`/users/${id}/templates`, { templateIds });
    return response.data;
};

const userService = {
    getAllUsers,
    createUser,
    updateUserStatus,
    deleteUser,
    updateUser,
    assignTemplates,
};

export default userService;
