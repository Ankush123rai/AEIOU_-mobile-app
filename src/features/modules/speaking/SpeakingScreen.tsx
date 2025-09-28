import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Camera, useCameraDevices, VideoFile } from 'react-native-vision-camera';
import { requestCameraMic } from '../../../config/permissions';
import { useCountdown } from '../../common/hooks/useCountdown';
import { saveRecordingTmp } from '../../../core/media/video';
// import { useAppDispatch } from '../../../state/store';
import { updateProgress } from '../../../state/slices/userSlice';

const TASKS = [
  { id:1, title:'Self Introduction', time:120, instruction:'Introduce yourself (name, background, interests).' },
  { id:2, title:'Describe a Picture', time:180, instruction:'Describe the image shown (people, objects, actions).' },
  { id:3, title:'Express Opinion', time:150, instruction:'Opinion on remote work with reasons.' },
];

export default function SpeakingScreen() {
  const devices = useCameraDevices();
  const device = devices.front || devices.back;
  const camRef = useRef<Camera>(null);
  const [taskIdx, setTaskIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [video, setVideo] = useState<VideoFile | null>(null);
  // const dispatch = useAppDispatch();

  const timeLeft = useCountdown(recording ? TASKS[taskIdx].time : Infinity, async () => {
    if (recording) await stopRec();
  });

  useEffect(() => { (async()=>{ try{ await requestCameraMic(); }catch(e){ Alert.alert('Permissions','Enable camera & mic'); } })(); }, []);

  async function startRec() {
    if (!camRef.current) return;
    const v = await camRef.current.startRecording({ onRecordingFinished: setVideo, onRecordingError: e => Alert.alert('Record error', String(e)) });
    setRecording(true);
  }
  async function stopRec() {
    if (!camRef.current) return;
    await camRef.current.stopRecording();
    setRecording(false);
  }

  async function nextTask() {
    if (video?.path) await saveRecordingTmp(video.path);
    if (taskIdx < TASKS.length - 1) {
      setTaskIdx(taskIdx+1); setVideo(null);
    } else finish();
  }
  function finish() {
    const progress = Math.round(((taskIdx+1)/TASKS.length)*100);
    // dispatch(updateProgress({ speaking: progress }));
  }

  if (!device) return null;

  return (
    <View style={s.container}>
      <Text style={s.h1}>Speaking Assessment</Text>
      <Text style={s.meta}>Task {taskIdx+1}/{TASKS.length} • {recording ? `Time ${timeLeft}s` : 'Ready'}</Text>

      <View style={s.card}><Text style={s.title}>{TASKS[taskIdx].title}</Text><Text>{TASKS[taskIdx].instruction}</Text></View>

      <View style={s.preview}>
        <Camera ref={camRef} style={s.camera} device={device} isActive={true} video={true} audio={true} />
      </View>

      <View style={s.row}>
        {!recording ? (
          <TouchableOpacity style={[s.btn, s.btnRed]} onPress={startRec}><Text style={s.btnTxt}>Start Recording</Text></TouchableOpacity>
        ) : (
          <TouchableOpacity style={[s.btn, s.btnGrey]} onPress={stopRec}><Text style={s.btnTxt}>Stop</Text></TouchableOpacity>
        )}
        <TouchableOpacity disabled={recording} style={[s.btn, recording? s.btnDisabled: s.btnPrimary]} onPress={nextTask}>
          <Text style={s.btnTxt}>{taskIdx === TASKS.length-1 ? 'Submit & Continue' : 'Next Task'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  container:{ padding:16, gap:12 },
  h1:{ fontSize:20, fontWeight:'700' },
  meta:{ color:'#4f46e5', fontWeight:'600' },
  card:{ backgroundColor:'#f8fafc', padding:12, borderRadius:12 },
  title:{ fontWeight:'700', marginBottom:4 },
  preview:{ height:260, borderRadius:16, overflow:'hidden', backgroundColor:'#000' },
  camera:{ flex:1 },
  row:{ flexDirection:'row', gap:12, marginTop:12 },
  btn:{ flex:1, padding:14, borderRadius:12, alignItems:'center' },
  btnPrimary:{ backgroundColor:'#0f172a' }, btnRed:{ backgroundColor:'#dc2626' }, btnGrey:{ backgroundColor:'#6b7280' },
  btnDisabled:{ backgroundColor:'#94a3b8' },
  btnTxt:{ color:'#fff', fontWeight:'700' },
});
