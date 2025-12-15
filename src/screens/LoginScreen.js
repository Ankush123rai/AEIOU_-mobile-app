import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { login, googleLogin, loading, message } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password');
      return;
    }
    try {
      await login(email.trim(), password);
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  const onGoogleLogin = async () => {
    try {
      await googleLogin();
    } catch (error) {
      // Error handled in AuthContext
    }
  };



  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.backgroundGradient} />

        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <View style={styles.logoContent}>
                <Text style={styles.logoAE}>AE</Text>
                <Text style={styles.logoI}>I</Text>
                <Text style={styles.logoU}>O</Text>
                <Text style={styles.logoU}>U</Text>
                <Text style={styles.copyright}>©</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.mainTitle}>Assessment Of English In Our Union</Text>
          <Text style={styles.mainSubtitle}>
            Assess your English skills through comprehensive assessment across listening, speaking, reading, and writing modules.
          </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Welcome Back</Text>
              {/* <Text style={styles.formSubtitle}>Sign in to continue your assessment</Text> */}
            </View>

            {message ? (
              <View style={[
                styles.messageContainer,
                message.includes('success') ? styles.successMessage : styles.errorMessage
              ]}>
                <Text style={styles.messageText}>{message}</Text>
              </View>
            ) : null}

            {/* Form */}
            <View style={styles.form}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TouchableOpacity 
                    style={styles.showPasswordBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.showPasswordText}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity 
                style={[styles.primaryBtn, loading && styles.disabledBtn]}
                onPress={onLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Google Button */}
              <TouchableOpacity 
                style={styles.googleBtn}
                onPress={onGoogleLogin}
                disabled={loading}
              >
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.googleBtnText}>Sign in with Google</Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.footerLink}> Create new account</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Features Section */}
         
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 10,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
    marginBottom: 12,
  },
  logoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoAE: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F97316',
    fontFamily: 'Poppins',
  },
  logoI: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
    fontFamily: 'Poppins',
  },
  indiaFlag: {
    width: 20,
    height: 20,
    marginHorizontal: 2,
  },
  logoU: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
    fontFamily: 'Poppins',
  },
  copyright: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 2,
  },
  logoSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    fontFamily: 'Inter',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  mainSubtitle: {
    fontSize: 10,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 17,
    fontFamily: 'Inter',
    maxWidth: 400,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    fontFamily: 'Inter',
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
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
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    fontFamily: 'Inter',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  showPasswordBtn: {
    padding: 8,
  },
  showPasswordText: {
    fontSize: 16,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 12,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  googleBtnText: {
    fontWeight: '600',
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
    fontFamily: 'Inter',
  },
  footerLink: {
    color: '#6366F1',
    fontWeight: '600',
    fontSize: 14,
  },
 
});