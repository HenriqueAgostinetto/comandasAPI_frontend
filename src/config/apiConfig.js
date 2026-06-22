const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
  },
  FUNCIONARIO: {
    LIST: '/funcionario/',
    GET: '/funcionario/:id',
    CREATE: '/funcionario/',
    UPDATE: '/funcionario/:id',
    DELETE: '/funcionario/:id',
  },
  CLIENTE: {
    LIST: '/cliente/',
    GET: '/cliente/:id',
    CREATE: '/cliente/',
    UPDATE: '/cliente/:id',
    DELETE: '/cliente/:id',
  },
  PRODUTO: {
    PUBLIC: '/produto/publico',
    LIST: '/produto/',
    GET: '/produto/:id',
    CREATE: '/produto/',
    UPDATE: '/produto/:id',
    DELETE: '/produto/:id',
  },
  COMANDA: {
    LIST: '/comanda/',
    GET: '/comanda/:id',
    CREATE: '/comanda/',
    UPDATE: '/comanda/:id',
    DELETE: '/comanda/:id',
    CANCEL: '/comanda/:id/cancelar',
    ADD_ITEM: '/comanda/:id/produto',
    LIST_ITEMS: '/comanda/:id/produtos',
    UPDATE_ITEM: '/comanda/produto/:id',
    REMOVE_ITEM: '/comanda/produto/:id',
  },
  RECEBIMENTO: {
    DASHBOARD: '/recebimento/dashboard',
    LIST: '/recebimento/',
    DELETE: '/recebimento/:id',
    DETALHE: '/recebimento/comandas/detalhe/:ids',
    RECEBER: '/recebimento/completo',
    COMPROVANTE: '/recebimento/comprovante/:id',
  },
  AUDITORIA: {
    LIST: '/auditoria',
    ACOES: '/auditoria/acoes',
  },
};

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 15000;
export { API_ENDPOINTS };
