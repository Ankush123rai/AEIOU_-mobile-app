import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator} from 'react-native';
import {useAuth} from '../context/AuthContext';
import api from '../api/client';
import ModuleCard from '../components/ModuleCard';
import PaymentModal from '../components/PaymentModal';
import LoadingLogo from '../components/LoadingLogo';
// import { Award } from 'lucide-react-native'; 

const computeStatuses = (submissions = []) => {
  const status = {listening: 'start', speaking: 'start', reading: 'start', writing: 'start'};
  
  if (!submissions || !Array.isArray(submissions)) {
    return status;
  }
  
  submissions.forEach(s => {
    if (s.module && s.status) {
      // Use the actual status from the submission
      status[s.module] = s.status;
    } else if (s.module && s.responses?.length > 0) {
      // If no status but has responses, it's submitted
      status[s.module] = 'submitted';
    }
  });
  return status;
};

const usePaymentStatus = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/payment/status');
      setPaymentStatus(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payment status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, []);

  return {
    paymentStatus,
    loading,
    error,
    refetch: fetchPaymentStatus
  };
};

export default function StudentHomeScreen({navigation}) {
  const {user, userDetails, isProfileComplete, logout, refreshUserDetails} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentExam, setCurrentExam] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const { paymentStatus, loading: paymentLoading, error: paymentError, refetch: refetchPayment } = usePaymentStatus();

  const loadData = async () => {
    try {
      setLoadError(null);
      setLoadingDetails(true);
  
      console.log('🔄 Loading student data...');
  
      // ✅ Run API calls in parallel for speed
      const [submissionsRes, examRes] = await Promise.all([
        api.get('/api/submissions/me'),
        api.get('/api/exams'),
      ]);
  
      // ✅ Handle submissions response
      const submissionsData =
        Array.isArray(submissionsRes.data)
          ? submissionsRes.data
          : submissionsRes.data?.data || submissionsRes.data?.submissions || [];
  
      setSubmissions(submissionsData);
      console.log('📄 Submissions loaded:', submissionsData.length);
      submissionsData.forEach(sub => {
        console.log(`Module: ${sub.module}, Status: ${sub.status}, Score: ${sub.totalScore}`);
      });
  
      const examData =
        Array.isArray(examRes.data?.data)
          ? examRes.data.data[0]
          : examRes.data?.data || examRes.data;
  
      if (examData?._id) {
        setCurrentExam(examData);
        console.log('🎓 Current exam:', examData.title);
      } else {
        console.warn('⚠️ No active exam found in API response');
        setCurrentExam(null);
      }
  
      // ✅ Refresh user profile details in parallel
      await refreshUserDetails();
      
      // ✅ Refresh payment status
      await refetchPayment();
    } catch (error) {
      console.error('❌ Failed to load data:', error.message);
      const msg = error?.response?.data?.error || error.message || 'Failed to load data';
      setLoadError(msg);
      setSubmissions([]);
      setCurrentExam(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const statuses = useMemo(() => {
    return computeStatuses(submissions);
  }, [submissions]);

  const isAssessmentUnlocked = paymentStatus?.isAssessmentUnlocked || false;
  const hasPaymentDetails = !!paymentStatus?.paymentDetails;

  const goExams = (module) => {
    if (!isProfileComplete) {
      return Alert.alert(
        'Profile Required',
        'Please complete your profile before starting the test.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Complete Profile', 
            onPress: () => navigation.navigate('ProfileInfo', { forceComplete: true })
          }
        ]
      );
    }

    if (!isAssessmentUnlocked) {
      return Alert.alert(
        'Assessment Locked',
        'Please unlock the assessment by completing the payment to start the test.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Unlock Assessment', 
            onPress: () => setShowPayment(true)
          }
        ]
      );
    }

    const moduleStatus = statuses[module];
    
    if (moduleStatus === 'evaluated') {
      const submission = submissions.find(s => s.module === module);
      const scoreText = submission?.totalScore ? ` (Score: ${submission.totalScore})` : '';
      
      return Alert.alert(
        'Assessment Completed',
        `You have already completed the ${module} module${scoreText}. You cannot retake this test.`,
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'View Results', 
            onPress: () => navigation.navigate('result', { module: module })
          }
        ]
      );
    }

    if (moduleStatus === 'submitted') {
      return Alert.alert(
        'Assessment Submitted',
        `You have already submitted the ${module} module. Waiting for evaluation.`,
        [{ text: 'OK' }]
      );
    }

    if (!currentExam?._id) {
      return Alert.alert('No Active Exam', 'No active exam found. Please check again later.');
    }

    navigation.navigate('TakeModule', {
      examId: currentExam._id,
      module: module,
      examData: currentExam, 
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getModuleStatusText = (module) => {
    const status = statuses[module];
    switch (status) {
      case 'evaluated':
        const submission = submissions.find(s => s.module === module);
        return submission?.totalScore ? `Completed (${submission.totalScore} pts)` : 'Completed';
      case 'submitted':
        return 'Submitted';
      case 'start':
        return 'Start';
      default:
        return 'Start';
    }
  };

  const getModuleScore = (module) => {
    const submission = submissions.find(s => s.module === module);
    return submission?.totalScore || null;
  };

  const getModuleStatus = (module) => {
    return statuses[module] || 'start';
  };

  const viewResults = () => {
    navigation.navigate('result');
  };

  if (loadingDetails || paymentLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingLogo/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Learner'}!</Text>
          <View style={styles.profileStatus}>
            <View style={[styles.statusDot, isProfileComplete ? styles.statusComplete : styles.statusIncomplete]} />
            <Text style={styles.profileStatusText}>
              {isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>

            <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
              <Text>Logout</Text>
          </TouchableOpacity>


        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            colors={['#6366F1']}
          />
        }
      >
        {loadError && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{loadError}</Text>
            <TouchableOpacity onPress={loadData}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {isAssessmentUnlocked && hasPaymentDetails && (
          <View style={styles.successCard}>
            <View style={styles.successContent}>
              <Text style={styles.successTitle}>Assessment Unlocked ✅</Text>
              <Text style={styles.successText}>
                Payment completed on {new Date(paymentStatus.paymentDetails.paymentDate).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        {!isAssessmentUnlocked && isProfileComplete && !paymentLoading && (
          <TouchableOpacity 
            style={styles.paymentCard}
            onPress={() => setShowPayment(true)}
          >
            <View style={styles.paymentCardHeader}>
              <Text style={styles.paymentTitle}>Assessment Locked</Text>
            </View>
            <Text style={styles.paymentText}>
              Unlock all 4 assessment modules by completing the payment of ₹100
            </Text>
            <View style={styles.paymentAction}>
              <Text style={styles.paymentActionText}>Unlock Assessment</Text>
            </View>
          </TouchableOpacity>
        )}

        {!isProfileComplete && (
          <TouchableOpacity 
            style={styles.warningCard}
            onPress={() => navigation.navigate('ProfileInfo', { forceComplete: true })}
          >
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Profile Incomplete</Text>
              <Text style={styles.warningText}>
                Complete your profile to start the assessment
              </Text>
            </View>
            <Text style={styles.warningAction}>→</Text>
          </TouchableOpacity>
        )}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Assessment Progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>
                {Object.values(statuses).filter(s => s === 'evaluated' || s === 'submitted').length}/4
              </Text>
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressLabel}>Modules Completed</Text>
              <Text style={styles.progressSubtext}>
                {isProfileComplete && isAssessmentUnlocked ? 'Keep going!' : 
                 !isProfileComplete ? 'Complete profile to start' : 'Unlock assessment to start'}
              </Text>
            </View>
          </View>
        </View>

        {currentExam && (
          <View style={styles.examInfoCard}>
            <Text style={styles.examInfoTitle}>Current Assessment</Text>
            <Text style={styles.examTitle}>{currentExam.title}</Text>
            <Text style={styles.examLevel}>Level: {currentExam.level}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Assessment Modules</Text>
        
        <ModuleCard 
          title="Listening" 
          status={getModuleStatusText('listening')}
          score={getModuleScore('listening')}
          statusType={getModuleStatus('listening')}
          onPress={() => goExams('listening')}
          onViewResults={viewResults}
          color="#3B82F6"
          disabled={!isProfileComplete || !isAssessmentUnlocked || statuses.listening === 'evaluated'}
          isLocked={!isAssessmentUnlocked}
          isCompleted={statuses.listening === 'evaluated'}
          isSubmitted={statuses.listening === 'submitted'}
        />
        <ModuleCard 
          title="Speaking" 
          status={getModuleStatusText('speaking')}
          score={getModuleScore('speaking')}
          statusType={getModuleStatus('speaking')}
          onPress={() => goExams('speaking')}
          onViewResults={viewResults}
          color="#10B981"
          disabled={!isProfileComplete || !isAssessmentUnlocked || statuses.speaking === 'evaluated'}
          isLocked={!isAssessmentUnlocked}
          isCompleted={statuses.speaking === 'evaluated'}
          isSubmitted={statuses.speaking === 'submitted'}
        />
        <ModuleCard 
          title="Reading" 
          status={getModuleStatusText('reading')}
          score={getModuleScore('reading')}
          statusType={getModuleStatus('reading')}
          onPress={() => goExams('reading')}
          onViewResults={viewResults}
          color="#8B5CF6"
          disabled={!isProfileComplete || !isAssessmentUnlocked || statuses.reading === 'evaluated'}
          isLocked={!isAssessmentUnlocked}
          isCompleted={statuses.reading === 'evaluated'}
          isSubmitted={statuses.reading === 'submitted'}
        />
        <ModuleCard 
          title="Writing" 
          status={getModuleStatusText('writing')}
          score={getModuleScore('writing')}
          statusType={getModuleStatus('writing')}
          onPress={() => goExams('writing')}
          onViewResults={viewResults}
          color="#F59E0B"
          disabled={!isProfileComplete || !isAssessmentUnlocked || statuses.writing === 'evaluated'}
          isLocked={!isAssessmentUnlocked}
          isCompleted={statuses.writing === 'evaluated'}
          isSubmitted={statuses.writing === 'submitted'}
        />

      </ScrollView>

      <PaymentModal
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={async () => {
          setShowPayment(false);
          setProcessingPayment(false);
          Alert.alert('Payment Successful', 'Your assessment has been unlocked. You can now start the modules.');
          await loadData();
        }}
        processing={processingPayment}
        amount={10000}
      /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  profileStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusComplete: {
    backgroundColor: '#10B981',
  },
  statusIncomplete: {
    backgroundColor: '#F59E0B',
  },
  profileStatusText: {
    fontSize: 14,
    color: '#64748B',
  },
  resultsBtn: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  logoutBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 12,
  },
  retryText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  successCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  successContent: {
    marginLeft: 12,
    flex: 1,
  },
  successTitle: {
    color: '#065F46',
    fontWeight: '600',
    marginBottom: 4,
  },
  successText: {
    color: '#047857',
    fontSize: 14,
  },
  paymentCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  paymentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    color: '#1E40AF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  paymentText: {
    color: '#374151',
    marginBottom: 12,
  },
  paymentAction: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  paymentActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  warningCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningContent: {
    marginLeft: 12,
    flex: 1,
  },
  warningTitle: {
    color: '#92400E',
    fontWeight: '600',
    marginBottom: 4,
  },
  warningText: {
    color: '#B45309',
    fontSize: 14,
  },
  warningAction: {
    color: '#D97706',
    fontWeight: 'bold',
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  progressStats: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  examInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  examInfoTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  examLevel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
});