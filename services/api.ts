import axios from 'axios';

// Configuração base do Axios
// Em produção, a URL base é relativa (o Nginx faz o proxy para o backend)
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para adicionar Token JWT (se existir)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sie_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para redirecionar se 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sie_auth_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Serviços por Módulo
export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const userService = {
  getAll: () => api.get('/users'),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  create: (data: any) => api.post('/users', data),
  uploadFile: (formData: FormData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadAvatar: (formData: FormData) => api.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export const financialService = {
  getAll: () => api.get('/financials'),
  create: (data: any) => api.post('/financials', data),
  getSummary: () => api.get('/financials/summary'),
  getDashboardStats: () => api.get('/dashboard/stats'),
};

export const billingService = {
    getBills: () => api.get('/bills'),
    generateBills: (monthRef: string, dueDate: string) => api.post('/bills/generate', { monthRef, dueDate })
};

export const systemService = {
  getInfo: () => api.get('/settings/system'),
  updateInfo: (data: any) => api.put('/settings/system', data),
  getTemplates: () => api.get('/settings/templates'),
  saveTemplates: (templates: any[]) => api.put('/settings/templates', templates)
};

export const aiService = {
  analyzeDocument: (formData: FormData) => api.post('/ai/analyze-doc', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  generateDocument: (prompt: string, referenceText?: string) => api.post('/ai/generate-document', { prompt, referenceText })
};

export const operationsService = {
    getReservations: () => api.get('/reservations'),
    createReservation: (data: any) => api.post('/reservations', data),
    getIncidents: () => api.get('/incidents'),
    createIncident: (data: any) => api.post('/incidents', data),
    getVisitors: () => api.get('/visitors')
};

export const communicationService = {
  getAlerts: () => api.get('/alerts'),
  sendAlert: (data: any) => api.post('/alerts', data),
  getNotices: () => api.get('/notices'),
  sendNotice: (data: any) => api.post('/notices', data),
};

export const surveyService = {
    getAll: () => api.get('/surveys'),
    create: (data: any) => api.post('/surveys', data),
    getResults: (id: string) => api.get(`/surveys/${id}/results`),
    submitResponse: (surveyId: string, answers: any) => api.post(`/surveys/${surveyId}/response`, { answers })
};

export const agendaService = {
    getAll: () => api.get('/agenda'),
    create: (data: any) => api.post('/agenda', data),
};

export const documentService = {
    getAll: () => api.get('/documents'),
    create: (data: any) => api.post('/documents', data),
    update: (id: string, data: any) => api.put(`/documents/${id}`, data),
    delete: (id: string) => api.delete(`/documents/${id}`)
};

export default api;