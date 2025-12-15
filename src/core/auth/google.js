import {GoogleSignin} from '@react-native-google-signin/google-signin';
import EncryptedStorage from 'react-native-encrypted-storage';
import {ENV} from '../../config/env';

export function initGoogle() {
  GoogleSignin.configure({
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  });
}

export async function signInWithGoogle() {
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  const userInfo = await GoogleSignin.signIn();
  await EncryptedStorage.setItem('auth', JSON.stringify(userInfo));
  return userInfo.user;
}



export async function getStoredUser() {
  const raw = await EncryptedStorage.getItem('auth');
  return raw ? JSON.parse(raw).user : null;
}

export async function signOutGoogle() {
  await GoogleSignin.signOut();
  await EncryptedStorage.removeItem('auth');
}
