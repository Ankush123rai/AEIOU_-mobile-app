import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity } from 'react-native';
import { useCountdown } from '../../common/hooks/useCountdown';
import { AppDispatch } from '../../../state/store';
// import { updateProgress } from '../../../state/slices/userSlice';
import { setupPlayer, loadListeningTrack } from '../../../core/media/audio';

const QUESTIONS = [
  { id:1, q:'What is the main topic of the conversation?', options:['Planning a vacation','Discussing work schedules','Talking about the weather','Organizing a meeting'] },
  { id:2, q:'When does the meeting take place?', options:['Next Monday at 9 AM','Tomorrow at 2 PM','This Friday at 3 PM','Next week Thursday'] },
  { id:3, q:'How many people will attend?', options:['5','7','10','12'] },
];

export default function ListeningScreen() {
  // const dispatch = AppDispatch();
  const [answers, setAnswers] = useState<Record<number,string>>({});
  const timeLeft = useCountdown(60*30, handleSubmit); // 30 mins

  useEffect(() => {
    (async()=>{
      await setupPlayer();
      await loadListeningTrack('https://cdn.yourdomain.com/audio/listening-test.mp3');
    })();
  }, []);

  function selectAns(i:number, opt:string){ setAnswers(p=>({ ...p, [i]:opt })); }
  function handleSubmit() {
    const progress = Math.round(Object.keys(answers).length / QUESTIONS.length * 100);
    // dispatch(updateProgress({ listening: progress }));
  }

  return (
    <View style={s.container}>
      <Text style={s.h1}>Listening Assessment</Text>
      <Text style={s.time}>Time left: {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</Text>
      <View style={{height:12}}/>
      <Button title="Play / Pause in OS controls" onPress={()=>{}} />
      <View style={{height:16}}/>
      {QUESTIONS.map((q, idx)=>(
        <View key={q.id} style={s.card}>
          <Text style={s.q}>{idx+1}. {q.q}</Text>
          {q.options.map(opt=>(
            <TouchableOpacity key={opt} onPress={()=>selectAns(idx, opt)} style={s.opt}>
              <View style={[s.radio, answers[idx]===opt && s.radioOn]} />
              <Text style={s.optText}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <TouchableOpacity onPress={handleSubmit} style={s.submit}>
        <Text style={s.submitTxt}>Submit & Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
const s = StyleSheet.create({
  container:{ padding:16 },
  h1:{ fontSize:22, fontWeight:'700' },
  time:{ color:'#4f46e5', fontWeight:'600', marginTop:4 },
  card:{ backgroundColor:'#f8fafc', borderRadius:12, padding:12, marginVertical:8 },
  q:{ fontWeight:'600' },
  opt:{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:6 },
  radio:{ width:16, height:16, borderRadius:8, borderWidth:2, borderColor:'#6b7280' },
  radioOn:{ backgroundColor:'#6366f1', borderColor:'#6366f1' },
  optText:{ fontSize:14 },
  submit:{ backgroundColor:'#0f172a', borderRadius:12, padding:14, marginTop:8, alignItems:'center' },
  submitTxt:{ color:'#fff', fontWeight:'700' }
});
