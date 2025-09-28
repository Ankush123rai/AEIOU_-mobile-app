import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminOverview(){
  return (
    <View style={s.container}>
      <Text style={s.h1}>System Overview</Text>
      <View style={s.grid}>
        <Stat label="Total Students" value="1284" color="#0ea5e9"/>
        <Stat label="Teachers" value="16" color="#22c55e"/>
        <Stat label="Pending Approvals" value="42" color="#f59e0b"/>
        <Stat label="Active Questions" value="230" color="#6366f1"/>
      </View>
    </View>
  );
}
function Stat({label,value,color}:{label:string;value:string;color:string}) {
  return <View style={[s.stat,{ backgroundColor: `${color}22`, borderColor: color }]}>
    <Text style={[s.val,{ color }]}>{value}</Text>
    <Text style={{ color }}>{label}</Text>
  </View>;
}
const s = StyleSheet.create({
  container:{ padding:16, gap:12 },
  h1:{ fontSize:20, fontWeight:'700' },
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:12 },
  stat:{ width:'47%', borderRadius:12, padding:12, borderWidth:1 },
  val:{ fontSize:22, fontWeight:'800' },
});
