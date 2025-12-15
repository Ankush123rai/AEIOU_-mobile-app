import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, ScrollView} from 'react-native';
import api from '../api/client';

export default function ExamListScreen({route, navigation}) {
  const preferredModule = route?.params?.module; 
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setDebugInfo('Starting API call...');
      
      const response = await api.get('/api/exams');
      
      // Debug logging
      console.log('=== FULL API RESPONSE ===');
      console.log('Response:', response);
      console.log('Response data:', response.data);
      
      let debugText = '=== DEBUG INFO ===\n';
      debugText += `Response status: ${response.status}\n`;
      debugText += `Has data: ${!!response.data}\n`;
      debugText += `Data type: ${typeof response.data}\n`;
      debugText += `Is array: ${Array.isArray(response.data)}\n`;
      
      if (response.data) {
        debugText += `Data keys: ${Object.keys(response.data).join(', ')}\n`;
        
        // Check for success property (common in many APIs)
        if (response.data.success !== undefined) {
          debugText += `Success: ${response.data.success}\n`;
        }
        
        // Check for data property
        if (response.data.data) {
          debugText += `Has data.data: true\n`;
          debugText += `data.data type: ${typeof response.data.data}\n`;
          debugText += `data.data is array: ${Array.isArray(response.data.data)}\n`;
        }
        
        // Your specific API structure from the response you shared
        if (response.data.data && response.data.data._id) {
          debugText += 'Detected: Single exam in data.data\n';
          setExams([response.data.data]);
        } 
        else if (response.data._id) {
          debugText += 'Detected: Single exam in data\n';
          setExams([response.data]);
        }
        else if (Array.isArray(response.data.data)) {
          debugText += 'Detected: Array of exams in data.data\n';
          setExams(response.data.data);
        }
        else if (Array.isArray(response.data)) {
          debugText += 'Detected: Array of exams in data\n';
          setExams(response.data);
        }
        else {
          debugText += 'Unknown structure - checking nested properties\n';
          
          // Check if it's your specific exam structure
          if (response.data.data && response.data.data.modules) {
            debugText += 'Detected: Exam with modules in data.data\n';
            setExams([response.data.data]);
          }
          else if (response.data.modules) {
            debugText += 'Detected: Exam with modules in data\n';
            setExams([response.data]);
          }
          else {
            debugText += 'No recognizable exam structure found\n';
            setExams([]);
          }
        }
      } else {
        debugText += 'No data in response\n';
        setExams([]);
      }
      
      setDebugInfo(debugText);
      console.log(debugText);
      
    } catch (error) {
      console.error('API Error:', error);
      let errorText = `Error: ${error.message}\n`;
      if (error.response) {
        errorText += `Status: ${error.response.status}\n`;
        errorText += `Response: ${JSON.stringify(error.response.data)}`;
      }
      setDebugInfo(errorText);
      Alert.alert('Error', 'Failed to load exams');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    load(); 
  }, []);

  const goModule = (exam, module) => {
    navigation.navigate('TakeModule', {examId: exam._id, module: module.name});
  };

  const renderExamItem = ({item}) => {
    console.log('Rendering exam:', item);
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title || 'No Title'}</Text>
        <Text style={styles.level}>Level: {(item.level || 'N/A').toUpperCase()}</Text>
        <Text style={styles.totalMarks}>Total Marks: {item.totalMarks || 'N/A'}</Text>
        <Text style={styles.examId}>ID: {item._id}</Text>
        
        <View style={styles.modulesContainer}>
          <Text style={styles.modulesTitle}>Available Modules:</Text>
          {item.modules && item.modules.length > 0 ? (
            item.modules.map((m) => (
              <TouchableOpacity
                key={m.name}
                style={[
                  styles.moduleBtn, 
                  preferredModule && preferredModule !== m.name && styles.moduleBtnGhost
                ]}
                onPress={() => goModule(item, m)}
              >
                <Text style={[
                  styles.moduleText, 
                  preferredModule && preferredModule !== m.name && styles.moduleTextGhost
                ]}>
                  {m.name.toUpperCase()} • {m.durationMinutes || '-'}m 
                  {m.bufferMinutes ? ` (+${m.bufferMinutes}m buffer)` : ''}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.noModules}>No modules available</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading exams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>&lt; Back</Text>
        </TouchableOpacity>
        <Text style={styles.h1}>Available Exams</Text>
        <View style={{width: 60}} />
      </View>

      {/* Debug Info - Remove this in production */}
      <ScrollView style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>{debugInfo}</Text>
        <Text style={styles.debugTitle}>Exams State:</Text>
        <Text style={styles.debugText}>
          Exams count: {exams.length}
          {exams.length > 0 && `\nFirst exam: ${JSON.stringify(exams[0], null, 2)}`}
        </Text>
      </ScrollView>

      {exams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No exams available at the moment.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={exams}
          keyExtractor={(item) => item._id || Math.random().toString()}
          renderItem={renderExamItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No exams to display</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748B',
    fontFamily: 'Inter',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  back: {
    color: '#93C5FD',
    fontWeight: '700',
    fontSize: 16,
  },
  h1: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    fontFamily: 'Poppins',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontWeight: '800',
    color: '#111827',
    fontSize: 18,
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  level: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  totalMarks: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  examId: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 12,
    fontFamily: 'Inter',
  },
  modulesContainer: {
    marginTop: 8,
  },
  modulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'Inter',
  },
  moduleBtn: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  moduleBtnGhost: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  moduleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'Inter',
  },
  moduleTextGhost: {
    color: '#1E293B',
  },
  noModules: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    fontFamily: 'Inter',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Inter',
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  debugContainer: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 4,
    fontFamily: 'Inter',
  },
  debugText: {
    fontSize: 12,
    color: '#92400E',
    fontFamily: 'Inter',
  },
});