import axios from 'axios';
import axiosRetry from 'axios-retry';
import { ENV } from '../../config/env';

export const api = axios.create({ baseURL: ENV.API_BASE_URL, timeout: 15000 });
axiosRetry(api, { retries: 3, retryDelay: axiosRetry.exponentialDelay, retryCondition: e => !e.response || e.response.status>=500 });
