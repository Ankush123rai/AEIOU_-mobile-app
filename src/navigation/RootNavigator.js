import React from 'react';
import { useAuth } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import { View } from 'react-native';
import LoadingLogo from '../components/LoadingLogo';

export default function RootNavigator() {
  const { user, bootDone } = useAuth();

  if (!bootDone) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1E293B' }}>
        <LoadingLogo />
      </View>
    );
  }

  return user ? <AppNavigator /> : <AuthNavigator />;
}