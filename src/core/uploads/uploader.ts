import RNFS from 'react-native-fs';
import axios from 'axios';
import { ENV } from '../../config/env';

export async function uploadImage(filePath: string, filename: string) {
  const form = new FormData();
  form.append('file', { uri: 'file://'+filePath, name: filename, type: 'image/jpeg' } as any);
  const res = await axios.post(`${ENV.MEDIA_UPLOAD_URL}/images`, form, { headers:{ 'Content-Type':'multipart/form-data' } });
  return res.data; // return { url: 'https://...' }
}
