import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker';
import { uploadImage } from '../../../core/uploads/uploader';
// import { AppDispatch } from '../../../state/store';
import { updateProgress } from '../../../state/slices/userSlice';

const PROMPT = `Write ~250-300 words: "Technology has significantly changed how people work and communicate..."`;

export default function WritingScreen() {
  const [mode, setMode] = useState<'text'|'photo'|'drive'>('text');
  const [text, setText] = useState('');
  const [img, setImg] = useState<{ uri:string, name:string }|null>(null);
  const [drive, setDrive] = useState('');
  const [uploading, setUploading] = useState(false);
  // const dispatch = AppDispatch();

  const words = text.trim().split(/\s+/).filter(Boolean).length;

  async function pickImage() {
    const opts: ImageLibraryOptions = { mediaType:'photo', selectionLimit:1, quality:0.8 };
    const res = await launchImageLibrary(opts);
    const a = res.assets?.[0];
    if (a?.uri) setImg({ uri: a.uri, name: a.fileName || `writing_${Date.now()}.jpg` });
  }

  async function submit() {
    if (mode==='text' && words<30) { Alert.alert('Short response','Please write more.'); return; }
    if (mode==='photo' && !img) { Alert.alert('Missing photo','Upload handwritten response photo.'); return; }
    if (mode==='drive' && !drive) { Alert.alert('Drive link required','Paste your viewable Drive link.'); return; }

    try {
      setUploading(true);
      if (mode==='photo' && img) {
        await uploadImage(img.uri.replace('file://',''), img.name);
      }
      // send payload (mode,text,drive,imageUrl) to backend if needed
      // dispatch(updateProgress({ writing: 100 }));
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={s.container}>
      <Text style={s.h1}>Writing Assessment</Text>
      <View style={s.card}><Text style={s.h3}>Task</Text><Text>{PROMPT}</Text></View>

      <View style={s.row}>
        {(['text','photo','drive'] as const).map(m=>(
          <TouchableOpacity key={m} onPress={()=>setMode(m)} style={[s.mode, mode===m && s.modeOn]}>
            <Text style={{ fontWeight:'700' }}>{m.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode==='text' && (
        <View style={s.card}>
          <View style={s.row}><Text style={s.h3}>Your Response</Text><Text>{words}/300</Text></View>
          <TextInput multiline numberOfLines={12} style={s.ta} value={text} onChangeText={setText} placeholder="Begin typing..." />
        </View>
      )}

      {mode==='photo' && (
        <View style={s.card}>
          <Text style={s.h3}>Upload Photo</Text>
          {img ? <Image source={{ uri: img.uri }} style={{ height:160, borderRadius:12, marginVertical:8 }}/> : null}
          <TouchableOpacity style={s.btn} onPress={pickImage}><Text style={s.btnTxt}>{img?'Replace Photo':'Choose Photo'}</Text></TouchableOpacity>
        </View>
      )}

      {mode==='drive' && (
        <View style={s.card}>
          <Text style={s.h3}>Google Drive Link</Text>
          <TextInput value={drive} onChangeText={setDrive} style={s.input} placeholder="https://drive.google.com/..." />
          <Text style={{ color:'#6b7280' }}>Ensure link is viewable by anyone with link.</Text>
        </View>
      )}

      <TouchableOpacity disabled={uploading} onPress={submit} style={[s.btn, uploading && { opacity:0.6 }]}>
        <Text style={s.btnTxt}>{uploading? 'Uploading...' : 'Submit & Complete Test'}</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  container:{ padding:16, gap:12 },
  h1:{ fontSize:20, fontWeight:'700' },
  card:{ backgroundColor:'#fff', borderRadius:12, padding:12, elevation:1, gap:8 },
  h3:{ fontWeight:'700' },
  row:{ flexDirection:'row', gap:8 },
  mode:{ flex:1, backgroundColor:'#e5e7eb', padding:12, borderRadius:10, alignItems:'center' },
  modeOn:{ backgroundColor:'#c7d2fe' },
  ta:{ backgroundColor:'#f3f4f6', padding:12, borderRadius:10, textAlignVertical:'top' },
  input:{ backgroundColor:'#f3f4f6', padding:12, borderRadius:10 },
  btn:{ backgroundColor:'#0f172a', padding:14, borderRadius:12, alignItems:'center' },
  btnTxt:{ color:'#fff', fontWeight:'700' },
});
