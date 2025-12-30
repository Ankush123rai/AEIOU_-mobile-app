import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Alert, ActivityIndicator} from 'react-native';
import {useAuth} from '../context/AuthContext';
import api from '../api/client';
import ModuleCard from '../components/ModuleCard';
import PaymentModal from '../components/PaymentModal';
import LoadingLogo from '../components/LoadingLogo';

const computeStatuses = (submissions = []) => {
  const status = {listening: 'start', speaking: 'start', reading: 'start', writing: 'start'};
  
  if (!submissions || !Array.isArray(submissions)) {
    return status;
  }
  
  submissions.forEach(s => {
    if (s.module && s.status) {
      status[s.module] = s.status;
    } else if (s.module && s.responses?.length > 0) {
      status[s.module] = 'submitted';
    }
  });
  return status;
};

const usePaymentAndAccess = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [accessCheck, setAccessCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [paymentRes, accessRes] = await Promise.all([
        api.get('/api/payment/status'),
        api.get('/api/payment/check-access')
      ]);
      
      setPaymentStatus(paymentRes.data);
      setAccessCheck(accessRes.data);
    } catch (err) {
      console.error('Error fetching payment and access:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetchAll = async () => {
    await fetchAll();
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return {
    paymentStatus,
    accessCheck,
    loading,
    error,
    refetchAll
  };
};

const StatusBadge = ({ status, text }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'success': return styles.successBadge;
      case 'warning': return styles.warningBadge;
      case 'info': return styles.infoBadge;
      case 'error': return styles.errorBadge;
      default: return styles.defaultBadge;
    }
  };

  const getStatusTextStyle = () => {
    switch (status) {
      case 'success': return styles.successBadgeText;
      case 'warning': return styles.warningBadgeText;
      case 'info': return styles.infoBadgeText;
      case 'error': return styles.errorBadgeText;
      default: return styles.defaultBadgeText;
    }
  };

  return (
    <View style={[styles.badge, getStatusStyle()]}>
      <Text style={getStatusTextStyle()}>{text}</Text>
    </View>
  );
};

const ProgressCircle = ({ progress, size = 80 }) => {
  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.progressCircleContainer, { width: size, height: size }]}>
      <View style={[styles.progressCircleBackground, { width: size, height: size, borderRadius: radius }]} />
      <View style={[styles.progressCircleFill, { 
        width: size, 
        height: size, 
        borderRadius: radius,
        backgroundColor: progress === 100 ? '#10B981' : progress > 50 ? '#3B82F6' : progress > 0 ? '#F59E0B' : '#E5E7EB'
      }]}>
        <Text style={styles.progressCircleText}>{progress}%</Text>
      </View>
    </View>
  );
};

const InfoCard = ({ type, title, message, actionText, onAction, isLoading }) => {
  const getCardStyle = () => {
    switch (type) {
      case 'success': return styles.successInfoCard;
      case 'warning': return styles.warningInfoCard;
      case 'info': return styles.infoInfoCard;
      case 'error': return styles.errorInfoCard;
      case 'purple': return styles.purpleInfoCard;
      default: return styles.defaultInfoCard;
    }
  };

  const getTitleStyle = () => {
    switch (type) {
      case 'success': return styles.successInfoTitle;
      case 'warning': return styles.warningInfoTitle;
      case 'info': return styles.infoInfoTitle;
      case 'error': return styles.errorInfoTitle;
      case 'purple': return styles.purpleInfoTitle;
      default: return styles.defaultInfoTitle;
    }
  };

  const getMessageStyle = () => {
    switch (type) {
      case 'success': return styles.successInfoMessage;
      case 'warning': return styles.warningInfoMessage;
      case 'info': return styles.infoInfoMessage;
      case 'error': return styles.errorInfoMessage;
      case 'purple': return styles.purpleInfoMessage;
      default: return styles.defaultInfoMessage;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'success': return styles.successInfoButton;
      case 'warning': return styles.warningInfoButton;
      case 'info': return styles.infoInfoButton;
      case 'error': return styles.errorInfoButton;
      case 'purple': return styles.purpleInfoButton;
      default: return styles.defaultInfoButton;
    }
  };

  return (
    <View style={[styles.infoCard, getCardStyle()]}>
      <View style={styles.infoCardContent}>
        <View style={styles.infoCardTextContainer}>
          <Text style={getTitleStyle()}>{title}</Text>
          <Text style={getMessageStyle()}>{message}</Text>
        </View>
        {actionText && (
          <TouchableOpacity 
            style={getButtonStyle()}
            onPress={onAction}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.infoButtonText}>{actionText}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default function StudentHomeScreen({navigation}) {
  const {user, userDetails, isProfileComplete, logout, refreshUserDetails} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentExam, setCurrentExam] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentStatusMessage, setPaymentStatusMessage] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const { 
    paymentStatus, 
    accessCheck, 
    loading: paymentLoading, 
    error: paymentError, 
    refetchAll: refetchPaymentAccess 
  } = usePaymentAndAccess();

  const hasAccess = accessCheck?.hasAccess || false;
  const needsPayment = accessCheck?.needsPayment || false;
  const isExamCompleted = accessCheck?.completed || false;
  const activeExam = accessCheck?.activeExam;
  const currentUserExam = accessCheck?.currentExam;
  const previousExamCompleted = accessCheck?.previousExamCompleted || false;
  const isCurrentExamCompleted = currentUserExam?.examId?.isCompleted || false;
  const isExamAlreadyCompleted = isExamCompleted || isCurrentExamCompleted;

  const loadData = async () => {
    try {
      setLoadError(null);
      setLoadingDetails(true);
  
      const [submissionsRes, examRes] = await Promise.all([
        api.get('/api/submissions/me'),
        api.get('/api/exams'),
      ]);
  
      const submissionsData =
        Array.isArray(submissionsRes.data)
          ? submissionsRes.data
          : submissionsRes.data?.data || submissionsRes.data?.submissions || [];
  
      setSubmissions(submissionsData);
  
      const examData =
        Array.isArray(examRes.data?.data)
          ? examRes.data.data[0]
          : examRes.data?.data || examRes.data;
  
      if (examData?._id) {
        setCurrentExam(examData);
      } else {
        setCurrentExam(null);
      }
  
      await refreshUserDetails();
      await refetchPaymentAccess();
      
    } catch (error) {
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

    if (!hasAccess) {
      let message = '';
      let actionText = '';
      
      if (previousExamCompleted && needsPayment) {
        message = `A new assessment "${activeExam?.title}" is available. Complete payment to unlock it.`;
        actionText = 'Unlock New Assessment';
      } else if (needsPayment) {
        message = `Unlock "${activeExam?.title || 'the assessment'}" by completing the payment of ₹100.`;
        actionText = 'Unlock Assessment';
      } else if (isExamAlreadyCompleted) {
        message = 'You have already completed this assessment. Please wait for new assessments to be published.';
        return Alert.alert('Assessment Completed', message, [{ text: 'OK' }]);
      } else {
        message = 'You do not have access to this assessment.';
      }

      if (actionText) {
        return Alert.alert(
          'Access Required',
          message,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: actionText, 
              onPress: () => setShowPayment(true)
            }
          ]
        );
      }
      
      return Alert.alert('Access Required', message, [{ text: 'OK' }]);
    }

    if (isCurrentExamCompleted) {
      return Alert.alert(
        'Assessment Completed',
        'You have completed this assessment. Please wait for new assessments.',
        [{ text: 'OK' }]
      );
    }

    const moduleStatus = statuses[module];
    
    if (moduleStatus === 'evaluated') {
      const submission = submissions.find(s => s.module === module);
      const scoreText = submission?.totalScore ? ` (Score: ${submission.totalScore})` : '';
      
      return Alert.alert(
        'Module Completed',
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
        'Module Submitted',
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

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setPaymentStatusMessage('success');
    setPaymentProcessing(true);
    
    try {
      await Promise.all([refetchPaymentAccess(), loadData()]);
      Alert.alert('Success', 'Payment successful! Assessment unlocked.');
    } catch (error) {
      console.error('Error after payment:', error);
    } finally {
      setPaymentProcessing(false);
      setTimeout(() => {
        setPaymentStatusMessage('');
      }, 3000);
    }
  };

  const completedModules = Object.values(statuses).filter(s => s === 'evaluated' || s === 'submitted').length;
  const totalModules = 4;
  const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  if (loadingDetails || paymentLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingLogo/>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Learner'}!</Text>
          <StatusBadge 
            status={isProfileComplete ? 'success' : 'warning'} 
            text={isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'} 
          />
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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

        {/* Payment Success Message */}
        {paymentStatusMessage === 'success' && (
          <InfoCard
            type="success"
            title="Payment Successful!"
            message="Your assessment has been unlocked. You can now start your modules."
          />
        )}

        {/* New Exam Available */}
        {previousExamCompleted && needsPayment && !hasAccess && (
          <InfoCard
            type="info"
            title="New Assessment Available!"
            message={`A new assessment "${activeExam?.title}" is now available. Complete payment to unlock it.`}
            actionText="Unlock New Assessment"
            onAction={() => setShowPayment(true)}
            isLoading={paymentProcessing}
          />
        )}

        {/* Current Exam Access */}
        {hasAccess && currentUserExam && (
          <InfoCard
            type="success"
            title={`${currentUserExam.examId?.title || "Current Assessment"} - Active`}
            message={`You have access to this assessment. Unlocked on ${new Date(currentUserExam.unlockedAt).toLocaleDateString()}.`}
          />
        )}

        {/* Exam Completed */}
        {isExamAlreadyCompleted && (
          <InfoCard
            type="purple"
            title="Assessment Completed"
            message="You have already completed this assessment. Please wait for new assessments to be published."
          />
        )}

        Payment Required
        {needsPayment && !previousExamCompleted && (
          <InfoCard
            type="warning"
            title="Payment Required"
            message={`Unlock "${activeExam?.title || 'the assessment'}" by completing the payment of ₹100.`}
            actionText="Unlock"
            onAction={() => setShowPayment(true)}
            isLoading={paymentProcessing}
          />
        )}

        {!isProfileComplete && (
          <TouchableOpacity 
            style={styles.profileIncompleteCard}
            onPress={() => navigation.navigate('ProfileInfo', { forceComplete: true })}
          >
            <View style={styles.profileIncompleteContent}>
              <View style={styles.profileIncompleteTextContainer}>
                <Text style={styles.profileIncompleteTitle}>Profile Incomplete</Text>
                <Text style={styles.profileIncompleteMessage}>
                  Please complete your profile details to start the test.
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Profile Status Card */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardTitle}>Profile Status</Text>
              <View style={[styles.statusIndicator, isProfileComplete ? styles.statusComplete : styles.statusIncomplete]} />
            </View>
            <View style={styles.statCardContent}>
              <View style={[styles.statIcon, isProfileComplete ? styles.statIconSuccess : styles.statIconWarning]}>
                <Text style={styles.statIconText}>{isProfileComplete ? '✓' : '!'}</Text>
              </View>
              <Text style={styles.statCardText}>
                {isProfileComplete ? "Profile Complete" : "Profile Incomplete"}
              </Text>
              {isProfileComplete && userDetails && (
                <Text style={styles.statCardSubtext}>{userDetails.fullname}</Text>
              )}
              <TouchableOpacity 
                style={styles.resultsButton}
                onPress={viewResults}
              >
                <Text style={styles.resultsButtonText}>My Results</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Access Status Card */}
          {/* <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardTitle}>Assessment Access</Text>
              <View style={[
                styles.statusIndicator, 
                hasAccess ? styles.statusComplete : 
                needsPayment ? styles.statusWarning : 
                styles.statusLocked
              ]} />
            </View>
            <View style={styles.statCardContent}>
              <View style={[
                styles.statIcon,
                hasAccess ? styles.statIconSuccess : 
                needsPayment ? styles.statIconWarning : 
                styles.statIconLocked
              ]}>
                <Text style={styles.statIconText}>{hasAccess ? '✓' : '🔒'}</Text>
              </View>
              <Text style={styles.statCardText}>
                {hasAccess
                  ? "Assessment Unlocked"
                  : needsPayment
                  ? "Payment Required"
                  : "No Access"}
              </Text>
              {currentUserExam?.unlockedAt && (
                <Text style={styles.statCardSubtext}>
                  Unlocked on {new Date(currentUserExam.unlockedAt).toLocaleDateString()}
                </Text>
              )}
              {needsPayment && isProfileComplete && !paymentLoading && (
                <TouchableOpacity 
                  style={styles.unlockButton}
                  onPress={() => setShowPayment(true)}
                  disabled={paymentProcessing}
                >
                  {paymentProcessing ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.unlockButtonText}>
                      {previousExamCompleted ? "Unlock New" : "Unlock for ₹100"}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View> */}

          {/* Progress Card */}
          <View style={styles.statCard}>
            <View style={styles.statCardHeader}>
              <Text style={styles.statCardTitle}>Overall Progress</Text>
              <View style={styles.statusIndicator} />
            </View>
            <View style={styles.statCardContent}>
              <ProgressCircle progress={overallProgress} size={80} />
              <Text style={styles.statCardText}>
                {completedModules} of {totalModules} modules
              </Text>
              {isCurrentExamCompleted && (
                <Text style={styles.completedText}>Assessment completed ✓</Text>
              )}
            </View>
          </View>
        </View>

        {/* Modules Section */}
        <View style={styles.modulesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Assessment Modules
              {activeExam?.title && (
                <Text style={styles.sectionSubtitle}> - {activeExam.title}</Text>
              )}
            </Text>
            
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.evaluatedDot]} />
                <Text style={styles.legendText}>Evaluated</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.submittedDot]} />
                <Text style={styles.legendText}>Submitted</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.availableDot]} />
                <Text style={styles.legendText}>Available</Text>
              </View>
              {(!hasAccess || isCurrentExamCompleted) && (
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, styles.lockedDot]} />
                  <Text style={styles.legendText}>Locked</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.modulesGrid}>
            {['listening', 'speaking', 'reading', 'writing'].map((module, index) => {
              const moduleStatus = statuses[module];
              const moduleScore = getModuleScore(module);
              const isModuleAccessible = hasAccess && !isCurrentExamCompleted && isProfileComplete;
              const moduleLocked = !hasAccess || isCurrentExamCompleted;
              
              return (
                <ModuleCard
                  key={module}
                  title={module.charAt(0).toUpperCase() + module.slice(1)}
                  status={getModuleStatusText(module)}
                  score={moduleScore}
                  statusType={moduleStatus}
                  onPress={() => goExams(module)}
                  onViewResults={viewResults}
                  color={getModuleColor(module)}
                  disabled={!isModuleAccessible}
                  isLocked={moduleLocked}
                  needsPayment={needsPayment}
                  isCompleted={moduleStatus === 'evaluated'}
                  isSubmitted={moduleStatus === 'submitted'}
                  index={index}
                />
              );
            })}
          </View>
        </View>

        {/* Help Section */}
        <TouchableOpacity 
          style={styles.helpSection}
          onPress={() => navigation.navigate('FAQ')}
        >
          <View style={styles.helpIcon}>
            <Text style={styles.helpIconText}>?</Text>
          </View>
          <Text style={styles.helpText}>Need Help? View FAQ & Support</Text>
          <Text style={styles.helpArrow}>→</Text>
        </TouchableOpacity>

      </ScrollView>

      <PaymentModal
        visible={showPayment}
        onClose={() => setShowPayment(false)}
        onSuccess={handlePaymentSuccess}
        amount={10000}
        examId={activeExam?._id}
      />
    </View>
  );
}

const getModuleColor = (module) => {
  switch (module.toLowerCase()) {
    case "listening": return "#3B82F6";
    case "speaking": return "#10B981";
    case "reading": return "#8B5CF6";
    case "writing": return "#F59E0B";
    default: return "#6B7280";
  }
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
  },
  welcome: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  logoutText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  successBadge: {
    backgroundColor: '#D1FAE5',
  },
  warningBadge: {
    backgroundColor: '#FEF3C7',
  },
  infoBadge: {
    backgroundColor: '#DBEAFE',
  },
  errorBadge: {
    backgroundColor: '#FEE2E2',
  },
  defaultBadge: {
    backgroundColor: '#F1F5F9',
  },
  successBadgeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  warningBadgeText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBadgeText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBadgeText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  defaultBadgeText: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  // Info Cards
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  successInfoCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  warningInfoCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  infoInfoCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  errorInfoCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  purpleInfoCard: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  infoCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  infoCardTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  successInfoTitle: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  warningInfoTitle: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  infoInfoTitle: {
    color: '#1E40AF',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  errorInfoTitle: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  purpleInfoTitle: {
    color: '#5B21B6',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  successInfoMessage: {
    color: '#047857',
    fontSize: 14,
    lineHeight: 20,
  },
  warningInfoMessage: {
    color: '#B45309',
    fontSize: 14,
    lineHeight: 20,
  },
  infoInfoMessage: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
  },
  errorInfoMessage: {
    color: '#991B1B',
    fontSize: 14,
    lineHeight: 20,
  },
  purpleInfoMessage: {
    color: '#6D28D9',
    fontSize: 14,
    lineHeight: 20,
  },
  successInfoButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  warningInfoButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoInfoButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Profile Incomplete Card
  profileIncompleteCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  profileIncompleteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileIncompleteTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  profileIncompleteTitle: {
    color: '#92400E',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  profileIncompleteMessage: {
    color: '#B45309',
    fontSize: 14,
    lineHeight: 20,
  },
  arrowContainer: {
    padding: 8,
  },
  arrow: {
    fontSize: 20,
    color: '#D97706',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '100%',
    maxWidth: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    letterSpacing: -0.3,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusComplete: {
    backgroundColor: '#10B981',
  },
  statusWarning: {
    backgroundColor: '#F59E0B',
  },
  statusIncomplete: {
    backgroundColor: '#F59E0B',
  },
  statusLocked: {
    backgroundColor: '#9CA3AF',
  },
  statCardContent: {
    alignItems: 'center',
  },
  statIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconSuccess: {
    backgroundColor: '#10B981',
  },
  statIconWarning: {
    backgroundColor: '#F59E0B',
  },
  statIconLocked: {
    backgroundColor: '#9CA3AF',
  },
  statIconText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statCardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 4,
  },
  statCardSubtext: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  resultsButton: {
    backgroundColor: '#10B981',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
  },
  resultsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  unlockButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    width: '100%',
  },
  unlockButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  completedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  // Progress Circle
  progressCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  progressCircleBackground: {
    backgroundColor: '#F1F5F9',
    position: 'absolute',
  },
  progressCircleFill: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Modules Section
  modulesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  evaluatedDot: {
    backgroundColor: '#10B981',
  },
  submittedDot: {
    backgroundColor: '#3B82F6',
  },
  availableDot: {
    backgroundColor: '#4F46E5',
  },
  lockedDot: {
    backgroundColor: '#9CA3AF',
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  modulesGrid: {
    gap: 12,
  },
  // Help Section
  helpSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 20,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  helpIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  helpIconText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  helpArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    marginLeft: 8,
  },
});