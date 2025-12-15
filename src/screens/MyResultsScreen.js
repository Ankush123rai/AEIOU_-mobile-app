import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const SummaryCard = ({ title, value, icon, color }) => {
  const colorStyles = {
    blue: { bg: '#DBEAFE', text: '#1E40AF' },
    green: { bg: '#DCFCE7', text: '#166534' },
    purple: { bg: '#F3E8FF', text: '#7C3AED' },
    yellow: { bg: '#FEF9C3', text: '#854D0E' }
  };

  const styles = colorStyles[color] || colorStyles.blue;

  return (
    <View style={[localStyles.summaryCard, { backgroundColor: styles.bg }]}>
      <Text style={[localStyles.summaryIcon, { color: styles.text }]}>{icon}</Text>
      <Text style={[localStyles.summaryValue, { color: styles.text }]}>{value}</Text>
      <Text style={[localStyles.summaryLabel, { color: styles.text }]}>{title}</Text>
    </View>
  );
};

const ResponseItem = ({ response, index, showCorrectAnswer, task }) => {
  const isCorrect = response.score > 0 && response.feedback === 'Correct';
  
  return (
    <View style={localStyles.responseItem}>
      <View style={localStyles.responseHeader}>
        <View style={localStyles.responseTitle}>
          <View style={[localStyles.statusIcon, isCorrect ? localStyles.correctIcon : localStyles.incorrectIcon]}>
            <Text style={localStyles.statusIconText}>
              {isCorrect ? '✓' : '✗'}
            </Text>
          </View>
          <Text style={localStyles.questionNumber}>Question {index + 1}</Text>
        </View>
        <Text style={[localStyles.scoreText, isCorrect ? localStyles.correctScore : localStyles.incorrectScore]}>
          {response.score}/{response.maxScore || 5}
        </Text>
      </View>

      <View style={localStyles.answerSection}>
        <Text style={localStyles.sectionLabel}>Your Answer:</Text>
        <View style={localStyles.answerBox}>
          <Text style={localStyles.answerText}>{response.answer || 'No answer provided'}</Text>
        </View>
      </View>

      {response.feedback && (
        <View style={localStyles.feedbackSection}>
          <Text style={localStyles.sectionLabel}>Feedback:</Text>
          <View style={[localStyles.feedbackBox, isCorrect ? localStyles.correctFeedback : localStyles.incorrectFeedback]}>
            <Text style={[localStyles.feedbackText, isCorrect ? localStyles.correctFeedbackText : localStyles.incorrectFeedbackText]}>
              {response.feedback}
            </Text>
          </View>
        </View>
      )}

      {showCorrectAnswer && task?.correctAnswer && (
        <View style={localStyles.correctAnswerSection}>
          <Text style={localStyles.sectionLabel}>Correct Answer:</Text>
          <View style={localStyles.correctAnswerBox}>
            <Text style={localStyles.correctAnswerText}>{task.correctAnswer}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const ModuleResultCard = ({ 
  submission, 
  index, 
  isExpanded, 
  showAnswers,
  onToggleModule,
  onToggleAnswers 
}) => {
  const module = submission.module;
  const totalPossibleScore = submission.responses.reduce((acc, response) => 
    acc + (response.maxScore || 5), 0
  );
  const percentage = totalPossibleScore > 0 
    ? Math.round((submission.totalScore / totalPossibleScore) * 100) 
    : 0;

  const getModuleIcon = (name) => {
    switch (name.toLowerCase()) {
      case "listening": return "🎧";
      case "speaking": return "🎤";
      case "reading": return "📖";
      case "writing": return "✏️";
      default: return "📊";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'evaluated': return { bg: '#DCFCE7', text: '#166534', border: '#BBF7D0' };
      case 'submitted': return { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' };
      default: return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
    }
  };

  const statusColors = getStatusColor(submission.status);

  return (
    <View style={[localStyles.moduleCard, isExpanded && localStyles.expandedModuleCard]}>
      <TouchableOpacity 
        style={localStyles.moduleHeader}
        onPress={onToggleModule}
        activeOpacity={0.7}
      >
        <View style={localStyles.moduleInfo}>
          <View style={localStyles.moduleTitleRow}>
            <View style={localStyles.moduleIcon}>
              <Text style={localStyles.moduleIconText}>{getModuleIcon(module)}</Text>
            </View>
            <View style={localStyles.moduleText}>
              <Text style={localStyles.moduleName}>{module.charAt(0).toUpperCase() + module.slice(1)} Module</Text>
              <Text style={localStyles.examName}>{submission.examId?.title || 'Assessment'}</Text>
            </View>
          </View>
          
          <View style={localStyles.moduleStats}>
            <Text style={localStyles.moduleScore}>{submission.totalScore} / {totalPossibleScore} pts</Text>
            <Text style={localStyles.modulePercentage}>{percentage}%</Text>
          </View>
        </View>

        <View style={localStyles.moduleStatus}>
          <View style={[localStyles.statusBadge, { backgroundColor: statusColors.bg, borderColor: statusColors.border }]}>
            <Text style={[localStyles.statusText, { color: statusColors.text }]}>
              {submission.status === 'evaluated' ? 'Evaluated' : 'Submitted'}
            </Text>
          </View>
          <Text style={localStyles.expandIcon}>
            {isExpanded ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={localStyles.moduleContent}>
          {/* Progress Bar */}
          <View style={localStyles.progressSection}>
            <View style={localStyles.progressLabels}>
              <Text style={localStyles.progressLabel}>Your Progress</Text>
              <Text style={localStyles.progressPercentage}>{percentage}%</Text>
            </View>
            <View style={localStyles.progressBar}>
              <View 
                style={[localStyles.progressFill, { width: `${percentage}%` }]}
              />
            </View>
          </View>

          {/* Submission Info */}
          <View style={localStyles.infoGrid}>
            <View style={localStyles.infoItem}>
              <Text style={localStyles.infoLabel}>Submitted On</Text>
              <Text style={localStyles.infoValue}>
                {new Date(submission.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={localStyles.infoItem}>
              <Text style={localStyles.infoLabel}>Total Questions</Text>
              <Text style={localStyles.infoValue}>{submission.responses.length}</Text>
            </View>
            <View style={localStyles.infoItem}>
              <Text style={localStyles.infoLabel}>Time Taken</Text>
              <Text style={localStyles.infoValue}>-- mins</Text>
            </View>
          </View>

          {/* Responses */}
          <View style={localStyles.responsesSection}>
            <View style={localStyles.responsesHeader}>
              <Text style={localStyles.responsesTitle}>Question Details</Text>
              <TouchableOpacity 
                style={localStyles.toggleAnswersButton}
                onPress={onToggleAnswers}
              >
                <Text style={localStyles.toggleAnswersText}>
                  {showAnswers ? '👁️ Hide Answers' : '👁️ Show Answers'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={localStyles.responsesList}>
              {submission.responses.map((response, responseIndex) => (
                <ResponseItem
                  key={responseIndex}
                  response={response}
                  index={responseIndex}
                  showCorrectAnswer={showAnswers}
                  task={response.task}
                />
              ))}
            </View>
          </View>

          
        </View>
      )}
    </View>
  );
};

export default function MyResultsScreen({ navigation }) {
  const { user } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});
  const [showAnswers, setShowAnswers] = useState({});

  const loadResults = async () => {
    try {
      setError(null);
      const response = await api.get('/api/submissions/me');
      
      if (response.data?.success) {
        setResults(response.data.data || []);
      } else {
        setResults(response.data || []);
      }
    } catch (err) {
      console.error('Failed to load results:', err);
      setError(err.response?.data?.error || err.message || 'Failed to load results');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadResults();
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleAnswers = (moduleId) => {
    setShowAnswers(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const shareResults = async () => {
    try {
      await Share.share({
        message: `Check out my assessment results! I completed ${results.length} modules with an average score.`,
        title: 'My Assessment Results'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share results');
    }
  };

  // Calculate summary statistics
  const totalModules = results.length;
  const completedModules = results.filter(r => r.status === 'evaluated').length;
  const averageScore = totalModules > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.totalScore, 0) / totalModules)
    : 0;
  const pendingReview = results.filter(r => r.status === 'submitted').length;

  if (loading) {
    return (
      <View style={localStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={localStyles.loadingText}>Loading your results...</Text>
      </View>
    );
  }

  return (
    <View style={localStyles.container}>
      <View style={localStyles.header}>
        <TouchableOpacity 
          style={localStyles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={localStyles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={localStyles.headerTitle}>My Results</Text>
        <TouchableOpacity 
          style={localStyles.shareButton}
          onPress={shareResults}
        >
          <Text style={localStyles.shareButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={localStyles.scrollView}
        contentContainerStyle={localStyles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#6366F1']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={localStyles.pageHeader}>
          <View style={localStyles.headerIcon}>
            <Text style={localStyles.headerIconText}>🏆</Text>
          </View>
          <Text style={localStyles.pageTitle}>Assessment Results</Text>
          <Text style={localStyles.pageSubtitle}>
            View your scores, feedback, and correct answers for all completed modules
          </Text>
        </View>

        {/* Results Summary */}
        {results.length > 0 && (
          <View style={localStyles.summaryGrid}>
            <SummaryCard
              title="Total Modules"
              value={totalModules.toString()}
              icon="📚"
              color="blue"
            />
            <SummaryCard
              title="Completed"
              value={completedModules.toString()}
              icon="✅"
              color="green"
            />
            <SummaryCard
              title="Average Score"
              value={`${averageScore}%`}
              icon="📈"
              color="purple"
            />
            <SummaryCard
              title="Pending Review"
              value={pendingReview.toString()}
              icon="⏳"
              color="yellow"
            />
          </View>
        )}

        {/* Results List */}
        <View style={localStyles.resultsList}>
          {results.length === 0 ? (
            <View style={localStyles.emptyState}>
              <Text style={localStyles.emptyIcon}>📊</Text>
              <Text style={localStyles.emptyTitle}>No Results Yet</Text>
              <Text style={localStyles.emptyText}>
                Complete some assessment modules to see your results here.
              </Text>
              <TouchableOpacity 
                style={localStyles.primaryButton}
                onPress={() => navigation.navigate('StudentHome')}
              >
                <Text style={localStyles.primaryButtonText}>🎯 Start Assessment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            results.map((submission, index) => (
              <ModuleResultCard
                key={submission._id}
                submission={submission}
                index={index}
                isExpanded={expandedModules[submission._id]}
                showAnswers={showAnswers[submission._id]}
                onToggleModule={() => toggleModule(submission._id)}
                onToggleAnswers={() => toggleAnswers(submission._id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366F1',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  shareButton: {
    padding: 8,
  },
  shareButtonText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  pageHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIconText: {
    fontSize: 28,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  summaryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  resultsList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  moduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  expandedModuleCard: {
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  moduleHeader: {
    padding: 20,
  },
  moduleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moduleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  moduleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleIconText: {
    fontSize: 20,
  },
  moduleText: {
    flex: 1,
  },
  moduleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  examName: {
    fontSize: 14,
    color: '#64748B',
  },
  moduleStats: {
    alignItems: 'flex-end',
  },
  moduleScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 4,
  },
  modulePercentage: {
    fontSize: 14,
    color: '#64748B',
  },
  moduleStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  expandIcon: {
    fontSize: 16,
    color: '#64748B',
  },
  moduleContent: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
  },
  responsesSection: {
    marginBottom: 20,
  },
  responsesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  responsesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  toggleAnswersButton: {
    padding: 8,
  },
  toggleAnswersText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  responsesList: {
    gap: 12,
  },
  responseItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  responseTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  correctIcon: {
    backgroundColor: '#DCFCE7',
  },
  incorrectIcon: {
    backgroundColor: '#FEE2E2',
  },
  statusIconText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
  },
  correctScore: {
    color: '#10B981',
  },
  incorrectScore: {
    color: '#EF4444',
  },
  answerSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  answerBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  answerText: {
    fontSize: 14,
    color: '#1E293B',
    lineHeight: 20,
  },
  feedbackSection: {
    marginBottom: 12,
  },
  feedbackBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  correctFeedback: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  incorrectFeedback: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
  },
  correctFeedbackText: {
    color: '#065F46',
  },
  incorrectFeedbackText: {
    color: '#92400E',
  },
  correctAnswerSection: {
    marginBottom: 12,
  },
  correctAnswerBox: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '600',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});