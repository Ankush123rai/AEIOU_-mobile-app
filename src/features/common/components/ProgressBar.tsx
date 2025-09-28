import React from 'react';
import { View } from 'react-native';

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <View style={{ height: 8, backgroundColor: '#e5e7eb', borderRadius: 6 }}>
      <View style={{
        width: `${Math.max(0, Math.min(100, progress))}%`,
        height: '100%',
        backgroundColor: '#5b6cff',
        borderRadius: 6
      }}/>
    </View>
  );
}
