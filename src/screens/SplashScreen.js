import React, {useEffect} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {useAuth} from '../context/AuthContext';

export default function SplashScreen({navigation}) {
  const {user, bootDone} = useAuth();

  useEffect(() => {
    if (!bootDone) return;
    const t = setTimeout(() => {
      if (user) navigation.replace('StudentHome');
      else navigation.replace('Login');
    }, 1200); 
    return () => clearTimeout(t);
  }, [bootDone, user, navigation]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.logo}>A(E)I(O)U</Text>
      <Text style={styles.subtitle}>Assessment Of English In Our Union</Text>
      <ActivityIndicator style={{marginTop: 24}} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {flex: 1, backgroundColor: '#111827', alignItems: 'center', justifyContent: 'center'},
  logo: {color: 'white', fontSize: 32, fontWeight: '800'},
  subtitle: {color: '#D1D5DB', marginTop: 6},
});
