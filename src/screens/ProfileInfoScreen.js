import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function ProfileInfoScreen({ navigation, route }) {
  const { user } = useAuth();
  const { forceComplete = false } = route.params || {};

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    age: '',
    gender: '',
    motherTongue: '',
    languages: '',
    qualification: '',
    section: '',
    residence: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    const requiredFields = ['fullName', 'age', 'gender', 'motherTongue', 'languages', 'qualification', 'residence'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      setError("Please fill in all required fields.");
      return false;
    }
    
    const age = parseInt(formData.age);
    if (age < 1 || age > 120) {
      setError("Please enter a valid age between 1 and 120.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        fullname: formData.fullName,
        age: parseInt(formData.age),
        gender: formData.gender,
        motherTongue: [{ name: formData.motherTongue }],
        languagesKnown: formData.languages.split(',').map(lang => ({ name: lang.trim() })),
        highestQualification: formData.qualification,
        section: formData.section,
        residence: formData.residence,
      };

      await api.post('/api/users/create-detail', payload);
      
      Alert.alert(
        'Profile Completed!',
        'Your profile has been saved successfully. You can now start the test.',
        [
          {
            text: 'Start Test',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'StudentHome' }]
            })
          }
        ]
      );
    } catch (error) {
      console.error('Profile submission error:', error);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            {forceComplete 
              ? "Please provide your details to begin the assessment"
              : "Tell us more about yourself"
            }
          </Text>
        </View>

        {forceComplete && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              📋 Profile required to start test
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.fullName}
              onChangeText={(value) => handleChange('fullName', value)}
              placeholder="Enter your full name"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Age and Gender Row */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(value) => handleChange('age', value)}
                placeholder="Age"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Gender *</Text>
              <TextInput
                style={styles.input}
                value={formData.gender}
                onChangeText={(value) => handleChange('gender', value)}
                placeholder="Gender"
                placeholderTextColor="#94A3B8"
              />
            </View>
          </View>

          {/* Mother Tongue */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mother Tongue *</Text>
            <TextInput
              style={styles.input}
              value={formData.motherTongue}
              onChangeText={(value) => handleChange('motherTongue', value)}
              placeholder="E.g., Hindi, Tamil, Bengali"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Languages Known */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Languages Known *</Text>
            <TextInput
              style={styles.input}
              value={formData.languages}
              onChangeText={(value) => handleChange('languages', value)}
              placeholder="E.g., English, Hindi, French (comma separated)"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Qualification */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Qualification *</Text>
            <TextInput
              style={styles.input}
              value={formData.qualification}
              onChangeText={(value) => handleChange('qualification', value)}
              placeholder="Enter your qualification"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Section</Text>
            <TextInput
              style={styles.input}
              value={formData.section}
              onChangeText={(value) => handleChange('section', value)}
              placeholder="E.g., A / B / C"
              placeholderTextColor="#94A3B8"
            />
          </View>

          {/* Residence */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Place of Residence (As per Aadhaar) *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.residence}
              onChangeText={(value) => handleChange('residence', value)}
              placeholder="Enter your complete address"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {forceComplete ? 'Save Profile & Start Test' : 'Save Profile'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.requiredText}>
            * Required fields must be filled to proceed with the test
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  warningBanner: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  warningText: {
    color: '#92400E',
    textAlign: 'center',
    fontWeight: '600',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  requiredText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
  },
});
