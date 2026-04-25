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

// Admin list might need a different endpoint if we implement "getAll" vs "getActive"
// For now using getActive as per MVP API structure, or we can add getAll to API if needed.
// Assuming getActive is enough for now or we add an admin endpoint later.

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

const templateService = {
    uploadTemplate,
    getActiveTemplates,
    getTemplateById,
    updateTemplate,
    deleteTemplate,
};

export default templateService;
