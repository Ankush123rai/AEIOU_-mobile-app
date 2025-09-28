import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthGate } from '../../features/auth/useAuthGate';
import StudentTabs from './StudentTabs';
import AdminTabs from './AdminTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { loading, isAdmin } = useAuthGate();

  if (loading) return null; // splash screen placeholder

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* {isAdmin ? (
        <Stack.Screen name="Admin" component={AdminTabs} />
      ) : ( */}
        <Stack.Screen name="Student" component={StudentTabs} />
      {/* )} */}
    </Stack.Navigator>
  );
}
