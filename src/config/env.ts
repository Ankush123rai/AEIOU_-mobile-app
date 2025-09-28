import { Platform } from 'react-native';
export const ENV = {
  GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID!,
  API_BASE_URL: process.env.API_BASE_URL!,
  ADMIN_EMAILS: (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase()),
  MEDIA_UPLOAD_URL: process.env.MEDIA_UPLOAD_URL!,
  IS_IOS: Platform.OS === 'ios',
};
