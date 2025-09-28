import RNFS from 'react-native-fs';

export async function saveRecordingTmp(uri: string) {
  const dest = `${RNFS.TemporaryDirectoryPath}/speaking_${Date.now()}.mp4`;
  await RNFS.copyFile(uri, dest);
  return dest;
}
