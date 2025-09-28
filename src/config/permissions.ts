import { Camera } from 'react-native-vision-camera';
import { Platform } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export async function requestCameraMic() {
  const cam = await Camera.requestCameraPermission();
  const mic = await Camera.requestMicrophonePermission();
  if (cam !== 'granted' || mic !== 'granted') throw new Error('Permissions denied');
  if (Platform.OS === 'android') {
    await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
  }
}
