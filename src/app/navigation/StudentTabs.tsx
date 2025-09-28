import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Dashboard from '../../features/student/screens/Dashboard';
import ListeningScreen from '../../features/modules/listening/ListeningScreen';
import ReadingScreen from '../../features/modules/reading/ReadingScreen';
import SpeakingScreen from '../../features/modules/speaking/SpeakingScreen';
import WritingScreen from '../../features/modules/writing/WritingScreen';

const Tab = createBottomTabNavigator();

export default function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Listening" component={ListeningScreen} />
      <Tab.Screen name="Speaking" component={SpeakingScreen} />
      <Tab.Screen name="Reading" component={ReadingScreen} />
      <Tab.Screen name="Writing" component={WritingScreen} />
    </Tab.Navigator>
  );
}
