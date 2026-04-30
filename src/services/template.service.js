import api from './api';

const uploadTemplate = async (formData) => {
    // Expects FormData with 'name', 'configJson', and 'file'
    const response = await api.post('/templates', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const getActiveTemplates = async () => {
    const response = await api.get('/templates/active');
    return response.data;
};

const getAllTemplates = async () => {
    const response = await api.get('/templates');
    return response.data;
};

const getTemplateById = async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
};

const updateTemplate = async (id, formData) => {
    const response = await api.put(`/templates/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

const deleteTemplate = async (id) => {
    const response = await api.delete(`/templates/${id}`);
    return response.data;
};

const duplicateTemplate = async (id) => {
    const response = await api.post(`/templates/${id}/duplicate`);
    return response.data;
};

const toggleTemplateStatus = async (id, isActive) => {
    const response = await api.put(`/templates/${id}/status`, { isActive });
    return response.data;
};

const templateService = {
    uploadTemplate,
    getActiveTemplates,
    getAllTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    toggleTemplateStatus,
};

export default templateService;
