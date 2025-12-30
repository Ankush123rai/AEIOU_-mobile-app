import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import api from '../api/client';

const { width } = Dimensions.get('window');

const PaymentModal = ({ visible, onClose, onSuccess, amount = 10000, examId = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Creating payment order for exam:', examId);
      
      const orderResponse = await api.post('/api/payment/create-order', { 
        amount,
        currency: 'INR',
        examId: examId 
      });
      
      const { success, order, key } = orderResponse.data;

      if (!success) {
        throw new Error('Failed to create order');
      }

      console.log('Order created:', order.id);

      const options = {
        description: 'Assessment Unlock Payment',
        image: 'https://your-logo-url.com/logo.png',
        currency: 'INR',
        key: key, 
        amount: order.amount.toString(),
        name: 'AEIOU Assessment',
        order_id: order.id,
        prefill: {
          email: 'student@example.com',
          contact: '9999999999',
          name: 'Student',
        },
        theme: { color: '#4f46e5' },
      };

      console.log('Opening Razorpay checkout...');

      RazorpayCheckout.open(options)
        .then(async (data) => {
          console.log('Payment success data:', data);
          
          try {
            const verifyResponse = await api.post('/api/payment/verify-payment', {
              razorpay_payment_id: data.razorpay_payment_id,
              razorpay_order_id: data.razorpay_order_id,
              razorpay_signature: data.razorpay_signature,
            });

            if (verifyResponse.data.success) {
              console.log('Payment verified successfully:', verifyResponse.data);
              onSuccess();
            } else {
              setError('Payment verification failed');
              Alert.alert('Error', 'Payment verification failed. Please contact support.');
            }
          } catch (verifyError) {
            console.error('Verification error:', verifyError);
            setError('Failed to verify payment. Please contact support.');
            Alert.alert('Verification Error', 'Failed to verify payment. Please contact support.');
          }
        })
        .catch((error) => {
          console.log('Payment error:', error);
          
          if (error.code === 2) {
            setError('Payment was cancelled');
            Alert.alert('Cancelled', 'Payment was cancelled.');
          } else if (error.code === 4) {
            // Network error
            setError('Network error. Please check your connection.');
            Alert.alert('Network Error', 'Please check your internet connection.');
          } else {
            setError(error.description || 'Payment failed. Please try again.');
          }
        })
        .finally(() => {
          setLoading(false);
        });

    } catch (error) {
      console.error('Payment initiation error:', error);
      setError(error.message || 'Failed to initiate payment. Please try again.');
      setLoading(false);
      Alert.alert('Error', error.message || 'Failed to initiate payment.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.headerLogo}>
                <Text style={[styles.logoLetter, { color: '#F97316' }]}>A</Text>
                <Text style={[styles.logoLetter, { color: '#F97316' }]}>E</Text>
                <Text style={[styles.logoLetter, { color: '#3B82F6' }]}>I</Text>
                <Text style={[styles.logoLetter, { color: '#10B981' }]}>O</Text>
                <Text style={[styles.logoLetter, { color: '#10B981' }]}>U</Text>
              </View>
              <Text style={styles.headerTagline}>Assessment Of English In Our Union</Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={loading} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.paymentCard}>
              <Text style={styles.paymentTitle}>Unlock Full Assessment</Text>
              <Text style={styles.paymentSubtitle}>Get complete access to all modules</Text>
              
              <View style={styles.amountDisplay}>
                <Text style={styles.amountSymbol}>₹</Text>
                <Text style={styles.amountValue}>{amount / 100}</Text>
                <Text style={styles.amountText}>one-time payment</Text>
              </View>

              

              <TouchableOpacity
                style={[styles.payButton, loading && styles.payButtonDisabled]}
                onPress={initiatePayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <View style={styles.payButtonIcon}>
                      <Text style={styles.payButtonIconText}>₹</Text>
                    </View>
                    <Text style={styles.payButtonText}>
                      Pay ₹{amount / 100} Now
                    </Text>
                    <Text style={styles.payButtonArrow}>→</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>What you'll get:</Text>
              
              <View style={styles.benefitsGrid}>
                <View style={styles.benefitCard}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#E0F2FE' }]}>
                    <Text style={[styles.benefitIconText, { color: '#0369A1' }]}>✓</Text>
                  </View>
                  <Text style={styles.benefitCardTitle}>Full Access</Text>
                  <Text style={styles.benefitCardText}>All assessment modules unlocked</Text>
                </View>

                <View style={styles.benefitCard}>
                  <View style={[styles.benefitIcon, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.benefitIconText, { color: '#065F46' }]}>✓</Text>
                  </View>
                  <Text style={styles.benefitCardTitle}>Expert Feedback</Text>
                  <Text style={styles.benefitCardText}>Detailed evaluation & analysis</Text>
                </View>

              </View>
            </View>
            <View style={styles.securitySection}>
              <View style={styles.securityBadge}>
                <Text style={styles.securityIcon}>🔒</Text>
                <Text style={styles.securityText}>Secure Payment</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoLetter: {
    fontSize: 28,
    fontWeight: '800',
    marginHorizontal: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerTagline: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '400',
    marginTop: -2,
  },
  modalBody: {
    padding: 24,
  },
  paymentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  paymentTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  amountDisplay: {
    alignItems: 'center',
    marginBottom: 24,
  },
  amountSymbol: {
    fontSize: 20,
    color: '#4F46E5',
    fontWeight: '600',
    marginBottom: -8,
  },
  amountValue: {
    fontSize: 64,
    fontWeight: '800',
    color: '#4F46E5',
    lineHeight: 72,
    letterSpacing: -2,
  },
  amountText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: -4,
    letterSpacing: 1,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  errorIcon: {
    fontSize: 20,
    color: '#DC2626',
    marginRight: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    flex: 1,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
  },
  payButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  payButtonIconText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  payButtonArrow: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '300',
    marginLeft: 12,
    marginTop: 2,
  },
  benefitsSection: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  benefitCard: {
    width: (width - 88) / 2 - 6, // Account for padding and gaps
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    alignItems: 'center',
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitIconText: {
    fontSize: 24,
    fontWeight: '700',
  },
  benefitCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    textAlign: 'center',
  },
  benefitCardText: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 14,
  },
  securitySection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  securityNote: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
  },
});

export default PaymentModal;