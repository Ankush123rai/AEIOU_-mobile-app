import TrackPlayer, { Capability } from 'react-native-track-player';

export async function setupPlayer() {
  await TrackPlayer.setupPlayer();
  await TrackPlayer.updateOptions({
    capabilities: [Capability.Play, Capability.Pause, Capability.Stop, Capability.SeekTo],
  });
}

export async function loadListeningTrack(uri: string) {
  await TrackPlayer.reset();
  await TrackPlayer.add({ id:'listening-audio', url: uri, title:'Listening Test' });
}
