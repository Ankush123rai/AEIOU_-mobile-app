import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useCountdown } from '../../common/hooks/useCountdown';
// import { useAppDispatch } from '../../../state/store';
import { updateProgress } from '../../../state/slices/userSlice';

const PASSAGES = [
  { id:1, title:'The Future of Renewable Energy', text:`Renewable energy has emerged...`, questions:[
    { id:'p1q1', q:'What made renewable energy attractive recently?', options:['Regulations','Lower cost + efficiency','Higher fossil price','Campaigns'] },
    { id:'p1q2', q:'Key challenge?', options:['Locations','Public resistance','Storage + grid','Tech options'] },
    { id:'p1q3', q:'Success countries?', options:['Germany/Japan','Denmark/Costa Rica','Norway/Sweden','Canada/Australia'] },
  ]},
  { id:2, title:'Impact of Social Media', text:`Social media platforms have fundamentally...`, questions:[
    { id:'p2q1', q:'Positive aspect?', options:['Productivity','Global connectivity','Education','Physical health'] },
    { id:'p2q2', q:'Mental health?', options:['Only positive','No impact','Can harm but also support','Only older adults'] },
    { id:'p2q3', q:'Future?', options:['Disappear','Decrease','More regulation','All replaced'] },
  ]},
];

export default function ReadingScreen() {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string,string>>({});
  // const dispatch = useAppDispatch();
  const timeLeft = useCountdown(60*40, submit); // 40 mins
  const passage = PASSAGES[idx];

  function choose(id:string, opt:string){ setAnswers(p=>({ ...p, [id]:opt })); }
  const answeredCount = useMemo(() => passage.questions.filter(q=>answers[q.id]).length, [answers, idx]);

  function next() {
    if (idx < PASSAGES.length - 1) setIdx(idx+1);
    else submit();
  }

  function submit() {
    const totalQ = PASSAGES.reduce((a,p)=>a+p.questions.length,0);
    const done = Object.keys(answers).length;
    const progress = Math.round(done / totalQ * 100);
    // dispatch(updateProgress({ reading: progress }));
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.row}>
        <Text style={s.h1}>Reading Assessment</Text>
        <Text style={s.time}>Time left {Math.floor(timeLeft/60)}:{(timeLeft%60).toString().padStart(2,'0')}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.h2}>{passage.title}</Text>
        <Text style={s.text}>{passage.text}</Text>
      </View>

      <View style={s.card}>
        <Text style={s.h3}>Questions</Text>
        {passage.questions.map((q,i)=>(
          <View key={q.id} style={{ marginBottom:8 }}>
            <Text style={s.q}>{i+1}. {q.q}</Text>
            {q.options.map(opt=>(
              <TouchableOpacity key={opt} onPress={()=>choose(q.id,opt)} style={s.opt}>
                <View style={[s.radio, answers[q.id]===opt && s.radioOn]}/>
                <Text>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <View style={s.row}>
        <Text style={{ color:'#6b7280' }}>{answeredCount} / {passage.questions.length} answered</Text>
        <TouchableOpacity onPress={next} style={s.btn}>
          <Text style={s.btnTxt}>{idx === PASSAGES.length-1 ? 'Submit & Continue' : 'Next Passage'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container:{ padding:16, gap:12 },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  h1:{ fontSize:20, fontWeight:'700' }, h2:{ fontSize:18, fontWeight:'700', marginBottom:8 },
  h3:{ fontWeight:'700', marginBottom:8 }, time:{ color:'#4f46e5', fontWeight:'600' },
  card:{ backgroundColor:'#fff', borderRadius:12, padding:12, elevation:1 },
  text:{ color:'#111827' }, q:{ fontWeight:'600', marginTop:8 },
  opt:{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:6 },
  radio:{ width:16, height:16, borderRadius:8, borderWidth:2, borderColor:'#6b7280' },
  radioOn:{ backgroundColor:'#6366f1', borderColor:'#6366f1' },
  btn:{ backgroundColor:'#0f172a', paddingHorizontal:14, paddingVertical:10, borderRadius:10 },
  btnTxt:{ color:'#fff', fontWeight:'700' }
});
