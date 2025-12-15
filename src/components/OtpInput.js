import React, { useRef } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';

export default function OtpInput({ otp, setOtp }) {
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = otp.split('');
    newOtp[index] = text;
    setOtp(newOtp.join(''));
    if (text && index < 5) inputs.current[index + 1].focus();
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <TextInput
          key={i}
          ref={(ref) => (inputs.current[i] = ref)}
          value={otp[i] || ''}
          onChangeText={(t) => handleChange(t, i)}
          maxLength={1}
          keyboardType="number-pad"
          style={styles.box}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 20 },
  box: {
    width: 48,
    height: 48,
    textAlign: 'center',
    fontSize: 20,
    borderWidth: 1.5,
    borderColor: '#6366F1',
    borderRadius: 10,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
});
