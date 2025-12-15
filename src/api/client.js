import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'https://api.aeiou.org.in'; 
// http://localhost:8080

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user', 'userDetails']);
    }
    return Promise.reject(error);
  }
);

export default api;