import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import api from '../api/client';

const PaymentModal = ({ visible, onClose, onSuccess, amount = 10000 }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const initiatePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const orderResponse = await api.post('/api/payment/create-order', { 
        amount,
        currency: 'INR'
      });
      
      const { success, order, key } = orderResponse.data;

      if (!success) {
        throw new Error('Failed to create order');
      }

      console.log('Order created:', order.id);

      const options = {
        description: 'Unlock Assessment Modules',
        image: 'https://your-logo-url.com/logo.png',
        currency: 'INR',
        key: key, 
        amount: order.amount.toString(),
        name: 'Assessment Platform',
        order_id: order.id,
        prefill: {
          email: 'user@example.com',
          contact: '9999999999',
          name: 'Student',
        },
        theme: { color: '#4f46e5' },
      };

      console.log('Opening Razorpay checkout...');

      RazorpayCheckout.open(options)
        .then(async (data) => {
          console.log('Payment success:', data);
          
          const verifyResponse = await api.post('/api/payment/verify-payment', {
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
          });

          if (verifyResponse.data.success) {
            onSuccess();
            Alert.alert('Success', 'Payment verified successfully!');
          } else {
            setError('Payment verification failed');
            Alert.alert('Error', 'Payment verification failed');
          }
        })
        .catch((error) => {
          console.log('Payment error:', error);
          
          if (error.code === 2) {
            setError('Payment was cancelled');
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Unlock Assessment</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <Text style={styles.closeButton}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>🔓</Text>
            </View>
            
            <Text style={styles.paymentTitle}>Complete Payment</Text>
            <Text style={styles.paymentDescription}>
              Pay ₹{amount / 100} to unlock all 4 assessment modules
            </Text>


            <View style={styles.paymentDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assessment Fee</Text>
                <Text style={styles.detailAmount}>₹{amount / 100}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailNote}>Includes all 4 modules</Text>
                <Text style={styles.detailBenefit}>One-time payment</Text>
              </View>
            </View>

            {/* {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null} */}

            <View style={styles.buttonContainer}>
              {/* Real Razorpay Payment */}
              <TouchableOpacity
                style={[styles.paymentButton, styles.primaryButton]}
                onPress={initiatePayment}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Pay ₹{amount / 100}</Text>
                )}
              </TouchableOpacity>

            </View>

            <View style={styles.securityNote}>
              <Text style={styles.securityText}>
                🔒 Secure payment powered by Razorpay
              </Text>
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What you get:</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitText}>• Full access to all 4 assessment modules</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitText}>• Expert evaluation and detailed feedback</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitText}>• Lifetime access to your results</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#EEF2FF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 24,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  devModeBanner: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  devModeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },
  paymentDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailNote: {
    fontSize: 12,
    color: '#6B7280',
  },
  detailBenefit: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 16,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
  },
  mockButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  securityNote: {
    alignItems: 'center',
    marginBottom: 20,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
  },
  benefitsContainer: {
    gap: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 12,
    color: '#6B7280',
  },
});

export default PaymentModal;