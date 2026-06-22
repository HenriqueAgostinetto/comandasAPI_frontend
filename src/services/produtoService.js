import { API_ENDPOINTS } from '../config/apiConfig';
import api from './api';
const { PRODUTO } = API_ENDPOINTS;
export const produtoService = {
    list: async (params = {}) => {
        const { skip = 0, limit = 100, id, nome, descricao, valor, valor_min, valor_max } = params;
        const queryParams = new URLSearchParams();
        queryParams.append('skip', skip);
        queryParams.append('limit', limit);
        if (id !== undefined && id !== null) queryParams.append('id', id);
        if (nome !== undefined && nome !== null && nome !== '') queryParams.append('nome', nome);
        if (descricao !== undefined && descricao !== null && descricao !== '') queryParams.append('descricao', descricao);
        if (valor !== undefined && valor !== null) queryParams.append('valor', valor);
        if (valor_min !== undefined && valor_min !== null) queryParams.append('valor_min', valor_min);
        if (valor_max !== undefined && valor_max !== null) queryParams.append('valor_max', valor_max);
        const response = await api.get(`${PRODUTO.LIST}?${queryParams.toString()}`);
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(PRODUTO.GET.replace(':id', id));
        return response.data;
    },
    create: async (produtoData) => {
        const response = await api.post(PRODUTO.CREATE, produtoData);
        return response.data;
    },
    update: async (id, produtoData) => {
        const response = await api.put(PRODUTO.UPDATE.replace(':id', id), produtoData);
        return response.data;
    },
    delete: async (id) => {
        await api.delete(PRODUTO.DELETE.replace(':id', id));
        return { success: true };
    },
    listPublic: async (params = {}) => {
        const { skip = 0, limit = 100, id, nome, descricao, valor, valor_min, valor_max } = params;
        const queryParams = new URLSearchParams();
        queryParams.append('skip', skip);
        queryParams.append('limit', limit);
        if (id !== undefined && id !== null) queryParams.append('id', id);
        if (nome !== undefined && nome !== null && nome !== '') queryParams.append('nome', nome);
        if (descricao !== undefined && descricao !== null && descricao !== '') queryParams.append('descricao', descricao);
        if (valor !== undefined && valor !== null) queryParams.append('valor', valor);
        if (valor_min !== undefined && valor_min !== null) queryParams.append('valor_min', valor_min);
        if (valor_max !== undefined && valor_max !== null) queryParams.append('valor_max', valor_max);
        const response = await api.get(`${PRODUTO.PUBLIC}?${queryParams.toString()}`);
        return response.data;
    },
};
export default produtoService;
