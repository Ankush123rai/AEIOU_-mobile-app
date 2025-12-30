import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

export default function ModuleCard({ 
  title, 
  status, 
  score,
  statusType = 'start', 
  onPress, 
  onViewResults,
  color = '#3B82F6', 
  disabled = false,
  isLocked = false,
  isCompleted = false,
  isSubmitted = false
}) {
  
  const getStatusConfig = () => {
    if (isCompleted) {
      return {
        text: status.includes('(') ? status : `Completed${score ? ` (${score} pts)` : ''}`,
        bgColor: '#10B981',
        textColor: '#FFFFFF',
        icon: '✓',
      };
    }
    if (isSubmitted) {
      return {
        text: 'Submitted',
        bgColor: '#3B82F6',
        textColor: '#FFFFFF',
        icon: '⏳',
      };
    }
    if (isLocked) {
      return {
        text: 'Locked',
        bgColor: '#6B7280',
        textColor: '#FFFFFF',
        icon: '🔒',
      };
    }
    if (disabled) {
      return {
        text: 'Complete Profile',
        bgColor: '#F59E0B',
        textColor: '#FFFFFF',
        icon: '⚠️',
      };
    }
    return {
      text: 'Start',
      bgColor: color,
      textColor: '#FFFFFF',
      icon: '▶️',
    };
  };

  const config = getStatusConfig();

  const getCardStyle = () => {
    if (isCompleted) return [styles.card, styles.completedCard];
    if (isSubmitted) return [styles.card, styles.submittedCard];
    if (isLocked) return [styles.card, styles.lockedCard];
    if (disabled) return [styles.card, styles.disabledCard];
    return [styles.card, styles.activeCard, { borderColor: color }];
  };

  const getButtonStyle = () => {
    if (isCompleted) return [styles.button, { backgroundColor: config.bgColor }];
    if (isSubmitted) return [styles.button, { backgroundColor: config.bgColor }];
    if (isLocked) return [styles.button, { backgroundColor: config.bgColor }];
    if (disabled) return [styles.button, { backgroundColor: config.bgColor }];
    return [styles.button, { backgroundColor: color }];
  };

  const getDescription = () => {
    if (isCompleted) {
      return score ? 'Evaluation completed with score' : 'Assessment completed';
    }
    if (isSubmitted) return 'Submitted for evaluation';
    if (isLocked) return 'Unlock assessment to access';
    if (disabled) return 'Complete profile to unlock';
    return 'Tap to start assessment';
  };

  const getIcon = () => {
    if (isCompleted) return "✅";
    if (isSubmitted) return "📤";
    if (isLocked) return "🔒";
    return getModuleIcon(title, color);
  };

  const handlePress = () => {
    if (isCompleted && onViewResults) {
      onViewResults();
    } else {
      onPress();
    }
  };

  const getButtonActionText = () => {
    if (isCompleted) return 'View Results';
    if (isSubmitted) return 'Submitted';
    if (isLocked) return 'Locked';
    if (disabled) return 'Complete Profile';
    return 'Start';
  };

  return (
    <TouchableOpacity
      disabled={(isLocked || disabled) && !isCompleted}
      onPress={handlePress}
      style={getCardStyle()}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { 
          backgroundColor: isCompleted ? '#D1FAE5' : 
                         isSubmitted ? '#DBEAFE' :
                         isLocked ? '#F3F4F6' : 
                         disabled ? '#FEF3C7' :
                         `${color}20` 
        }]}>
          <Text style={styles.iconText}>{getIcon()}</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[
            styles.title, 
            (isLocked || disabled) && styles.textDisabled
          ]}>
            {title}
          </Text>
          <Text style={[
            styles.description, 
            (isLocked || disabled) && styles.textDisabled
          ]}>
            {getDescription()}
          </Text>
        </View>

        <View style={getButtonStyle()}>
          <View style={styles.buttonContent}>
            <Text style={styles.buttonIcon}>{config.icon}</Text>
            <Text style={[styles.buttonText, { color: config.textColor }]}>
              {getButtonActionText()}
            </Text>
          </View>
        </View>
      </View>

    
      {isSubmitted && (
        <Text style={styles.submittedNote}>
          Waiting for teacher evaluation • Check back later
        </Text>
      )}
      
      {isLocked && (
        <Text style={styles.lockedNote}>
          Complete payment to unlock all modules
        </Text>
      )}

    </TouchableOpacity>
  );
}

const getModuleIcon = (title, color) => {
  switch (title.toLowerCase()) {
    case 'listening':
      return '🎧';
    case 'speaking':
      return '🎤';
    case 'reading':
      return '📖';
    case 'writing':
      return '✏️';
    default:
      return '📝';
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
  },
  activeCard: {
    borderColor: '#3B82F6',
  },
  completedCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  submittedCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  lockedCard: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  disabledCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  textDisabled: {
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonIcon: {
    fontSize: 14,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 12,
    alignItems: 'center',
  },
  completedNote: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
    marginBottom: 8,
  },
  submittedNote: {
    fontSize: 12,
    color: '#1D4ED8',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  lockedNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  disabledNote: {
    fontSize: 12,
    color: '#D97706',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  viewResultsButton: {
    marginTop: 4,
  },
  viewResultsText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});