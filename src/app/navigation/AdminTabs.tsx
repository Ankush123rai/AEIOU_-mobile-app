import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminOverview from '../../features/admin/screens/AdminOverview';
import AdminUsers from '../../features/admin/screens/AdminUsers';
import AdminQuestions from '../../features/admin/screens/AdminQuestions';
import AdminSettings from '../../features/admin/screens/AdminSettings';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Overview" component={AdminOverview} />
      <Tab.Screen name="Users" component={AdminUsers} />
      <Tab.Screen name="Questions" component={AdminQuestions} />
      <Tab.Screen name="Settings" component={AdminSettings} />
    </Tab.Navigator>
  );
}
