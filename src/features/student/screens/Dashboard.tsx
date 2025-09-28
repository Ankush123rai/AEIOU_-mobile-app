import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import ModuleCard from '../components/ModuleCard';

export default function Dashboard() {
  const user = useSelector((s: RootState) => s.user.user);
  if (!user) return null;

  const modules = [
    { id: 'listening',  name: 'Listening',  progress: user.progress.listening },
    { id: 'speaking',   name: 'Speaking',   progress: user.progress.speaking },
    { id: 'reading',    name: 'Reading',    progress: user.progress.reading },
    { id: 'writing',    name: 'Writing',    progress: user.progress.writing },
  ];

  const overall = useMemo(() =>
    Math.round((modules.reduce((a,m)=>a+m.progress,0) / modules.length)), [user.progress]);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.h1}>Welcome back{user.name ? `, ${user.name}` : ''}!</Text>
      <Text style={s.sub}>Continue your language assessment journey</Text>

      <View style={s.card}>
        <View style={s.row}>
          <Text style={s.h3}>Overall Progress</Text>
          <Text style={s.h3}>{overall}%</Text>
        </View>
        <View style={{ marginTop: 8 }}>
          <View style={s.pbOuter}>
            <View style={[s.pbInner, { width: `${overall}%` }]} />
          </View>
        </View>
      </View>

      <View style={s.grid}>
        {modules.map(m => <ModuleCard key={m.id} {...m}/>)}
      </View>

      <TouchableOpacity>
        <Text style={s.link}>Need help? View FAQ</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  container:{ padding:16, gap:16 },
  h1:{ fontSize:24, fontWeight:'700' },
  sub:{ color:'#6b7280' },
  card:{ backgroundColor:'#fff', borderRadius:16, padding:16, elevation:1 },
  h3:{ fontWeight:'700', fontSize:16 },
  row:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  pbOuter:{ height:10, backgroundColor:'#e5e7eb', borderRadius:8 },
  pbInner:{ height:'100%', backgroundColor:'#6366f1', borderRadius:8 },
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:12 },
  link:{ textAlign:'center', color:'#4f46e5', fontWeight:'600', marginVertical:16 },
});
