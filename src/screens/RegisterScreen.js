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
  Dimensions
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const { register, googleLogin, loading, message } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing fields', 'Please fill all fields');
      return;
    }
    try {
      await register(name.trim(), email.trim(), password);
      navigation.navigate('OtpVerify', { email });
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

    const FeatureCard = ({ icon, title, description, color }) => (
      <View style={[styles.featureCard, { borderColor: `${color}30` }]}>
        <View style={[styles.featureIcon, { backgroundColor: `${color}20` }]}>
          <Text style={[styles.featureIconText, { color }]}>{icon}</Text>
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </View>
      </View>
    );

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
            <Text style={styles.mainTitle}>Create Account</Text>
            <Text style={styles.mainSubtitle}>Start your English assessment journey</Text>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Message Alert */}
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
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor="#94A3B8"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>
            </View>

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

            {/* Register Button */}
            <TouchableOpacity 
              style={[styles.primaryBtn, loading && styles.disabledBtn]}
              onPress={onRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Create Account</Text>
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
              <Text style={styles.googleBtnText}>Sign up with Google</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}> Sign in instead</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

         <View style={styles.featuresSection}>
                    <Text style={styles.featuresTitle}>Comprehensive English Assessment</Text>
                    
                    <FeatureCard
                      icon="🎧"
                      title="Four Core Modules"
                      description="Complete assessment across Listening, Speaking, Reading, and Writing skills"
                      color="#3B82F6"
                    />
                    
                    <FeatureCard
                      icon="⏱️"
                      title="Time Management"
                      description="Each module has optimized time limits to test your efficiency"
                      color="#8B5CF6"
                    />
                    
                    <FeatureCard
                      icon="💾"
                      title="Auto-Save Progress"
                      description="Your progress is automatically saved across all devices"
                      color="#10B981"
                    />
                    
                    <FeatureCard
                      icon="📊"
                      title="Detailed Analytics"
                      description="Get comprehensive insights and personalized feedback"
                      color="#F59E0B"
                    />
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
    paddingBottom: 32,
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
  formContainer: {
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
    marginBottom: 20,
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
    marginTop: 8,
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
  benefitsSection: {
    marginHorizontal: 20,
    gap: 16,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  benefitIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  benefitDescription: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Inter',
    lineHeight: 20,
  },
  featuresSection: {
    gap: 16,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIconText: {
    fontSize: 18,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  featureDescription: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Inter',
    lineHeight: 20,
  },
});