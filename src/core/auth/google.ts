import { GoogleSignin, statusCodes, User } from '@react-native-google-signin/google-signin';
import EncryptedStorage from 'react-native-encrypted-storage';
import { ENV } from '../../config/env';

export function initGoogle() {
  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
}

export async function signInWithGoogle(): Promise<User> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const userInfo = await GoogleSignin.signIn();
  await EncryptedStorage.setItem('auth', JSON.stringify(userInfo));
  return userInfo.user as unknown as User;
}

export async function getStoredUser(): Promise<User | null> {
  const raw = await EncryptedStorage.getItem('auth');
  return raw ? (JSON.parse(raw).user as User) : null;
}

export async function signOut() {
  await GoogleSignin.signOut();
  await EncryptedStorage.removeItem('auth');
}
