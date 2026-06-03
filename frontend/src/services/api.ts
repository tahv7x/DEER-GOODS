import axios from 'axios';

// API Url (Backend dyalek)
const API_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Kayzid l'token f l'header dyal ay requête (ila kan m-connecté)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const updateProfile = async(formData: FormData) => {
  const response = await apiClient.put('/auth/profile',formData,{
    headers:{
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}
export default apiClient;