import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ProgressBar from '../../common/components/ProgressBar';
import { useNavigation } from '@react-navigation/native';

export default function ModuleCard({ id, name, progress }:{
  id: 'listening'|'speaking'|'reading'|'writing'; name: string; progress: number;
}) {
  const nav = useNavigation<any>();
  const isCompleted = progress === 100;
  const label = isCompleted ? 'Review' : progress > 0 ? 'Continue' : 'Start';
  return (
    <View style={s.card}>
      <View style={{ alignItems:'center', gap:8 }}>
        <Text style={s.title}>{name}</Text>
        <View style={{ width:100 }}><ProgressBar progress={progress}/></View>
        <Text style={s.status}>{isCompleted ? 'Completed' : progress>0 ? `${progress}% Complete` : 'Not Started'}</Text>
        <TouchableOpacity style={[s.btn, isCompleted ? s.btnGreen : s.btnPrimary]}
          onPress={()=>nav.navigate(name)}>
          <Text style={s.btnText}>{label}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  card:{ width:'48%', backgroundColor:'#fff', borderRadius:16, padding:16, elevation:1 },
  title:{ fontWeight:'700', fontSize:16 },
  status:{ color:'#6b7280', fontSize:12 },
  btn:{ paddingVertical:10, paddingHorizontal:16, borderRadius:12, marginTop:8 },
  btnPrimary:{ backgroundColor:'#0f172a' },
  btnGreen:{ backgroundColor:'#16a34a' },
  btnText:{ color:'#fff', fontWeight:'700' }
});
