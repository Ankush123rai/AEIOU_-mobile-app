
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StudentHomeScreen from '../screens/StudentHomeScreen';
import ExamListScreen from '../screens/ExamListScreen';
import TakeModuleScreen from '../screens/TakeModuleScreen';
import ProfileInfoScreen from '../screens/ProfileInfoScreen';
import SplashScreen from '../screens/SplashScreen';
import MyResultsScreen from '../screens/MyResultsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
      initialRouteName="StudentHome"
    >
    <Stack.Screen 
        name="Splash" 
        component={SplashScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
      <Stack.Screen name="Exams" component={ExamListScreen} />
      <Stack.Screen name="TakeModule" component={TakeModuleScreen} />
      <Stack.Screen name="ProfileInfo" component={ProfileInfoScreen} />
      <Stack.Screen name="result" component={MyResultsScreen} />
    </Stack.Navigator>
  );
}