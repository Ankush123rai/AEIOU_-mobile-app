import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function OtpVerifyScreen({ route, navigation }) {
  const { email } = route.params;
  const { verifyEmail, loading, message } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputs = useRef([]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.split('').slice(0, 6);
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (i < 6) newOtp[i] = char;
      });
      setOtp(newOtp);
      
      // Focus last input
      const lastIndex = Math.min(5, pastedOtp.length - 1);
      inputs.current[lastIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const onVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter all 6 digits');
      return;
    }
    try {
      await verifyEmail(email, otpString);
      navigation.replace('StudentHome');
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  const maskedEmail = email.replace(/(.{2})(.*)(?=@)/, (match, p1, p2) => {
    return p1 + '*'.repeat(p2.length);
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Background Gradient */}
        <View style={styles.backgroundGradient} />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.mainTitle}>Verify Your Email</Text>
            <Text style={styles.mainSubtitle}>We sent a code to {maskedEmail}</Text>
          </View>
        </View>

        {/* OTP Container */}
        <View style={styles.otpContainer}>
          {/* Message Alert */}
          {message ? (
            <View style={[
              styles.messageContainer,
              message.includes('success') ? styles.successMessage : styles.errorMessage
            ]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          {/* OTP Inputs */}
          <View style={styles.otpInputsContainer}>
            <Text style={styles.otpLabel}>Enter 6-digit code</Text>
            <View style={styles.otpInputs}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => inputs.current[index] = ref}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={index === 0 ? 6 : 1}
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity 
            style={[styles.primaryBtn, loading && styles.disabledBtn]}
            onPress={onVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>Verify & Continue</Text>
            )}
          </TouchableOpacity>

          {/* Resend Code */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity>
              <Text style={styles.resendLink}>Resend code</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>📩</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Check your inbox</Text>
              <Text style={styles.infoDescription}>
                We've sent a 6-digit verification code to your email address. 
                The code will expire in 10 minutes.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  headerContent: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  mainSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontFamily: 'Inter',
  },
  otpContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    marginBottom: 24,
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  errorMessage: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
  },
  successMessage: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter',
    color: '#FFFFFF',
  },
  otpInputsContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  otpLabel: {
    fontSize: 16,
    color: '#E2E8F0',
    marginBottom: 20,
    fontFamily: 'Inter',
  },
  otpInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  otpInput: {
    width: 50,
    height: 60,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  otpInputFilled: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  primaryBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 8,
  },
  resendText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter',
  },
  resendLink: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 14,
  },
  infoSection: {
    marginHorizontal: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  infoDescription: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Inter',
    lineHeight: 20,
  },
});