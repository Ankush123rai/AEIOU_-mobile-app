import React, {useEffect, useMemo, useState, useRef} from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  BackHandler,
  Linking,
  Image,
  Dimensions
} from 'react-native';
import YoutubePlayer from "react-native-youtube-iframe";
import {launchCamera} from 'react-native-image-picker';
import { Camera, useCameraDevices } from 'react-native-vision-camera';
import api from '../api/client';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const fmt = (s) => {
  const m = Math.floor(s/60).toString().padStart(2,'0');
  const r = (s%60).toString().padStart(2,'0');
  return `${m}:${r}`;
};

export default function TakeModuleScreen({route, navigation}) {
  const {examId, module, examData} = route.params;
  const [exam, setExam] = useState(examData || null);
  const [tasks, setTasks] = useState([]);
  const [answers, setAnswers] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [recordings, setRecordings] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(!examData);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [microphonePermission, setMicrophonePermission] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);
  const recordingIntervalRef = useRef(null);
  const cameraRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    if (examData) {
      processExamData(examData);
    } else {
      loadExamData();
    }
  }, [examId, module, examData]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      showExitConfirmation();
      return true;
    });

    return () => backHandler.remove();
  }, [hasUnsavedChanges]);

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const checkPermissions = async () => {
    const cameraStatus = await Camera.getCameraPermissionStatus();
    const microphoneStatus = await Camera.getMicrophonePermissionStatus();
    
    setCameraPermission(cameraStatus === 'authorized');
    setMicrophonePermission(microphoneStatus === 'authorized');
  };

  const requestPermissions = async () => {
    const camera = await Camera.requestCameraPermission();
    const microphone = await Camera.requestMicrophonePermission();
    
    setCameraPermission(camera === 'authorized');
    setMicrophonePermission(microphone === 'authorized');
    
    return camera === 'authorized' && microphone === 'authorized';
  };

  const loadExamData = async () => {
    try {
      setLoading(true);
  
      const response = await api.get(`/api/exams/${examId}`);
  
      const examData =
        Array.isArray(response.data?.data)
          ? response.data.data[0]
          : response.data?.data || response.data;
  
      if (!examData) {
        Alert.alert('Error', 'Exam not found.');
        setTasks([]);
        return;
      }
  
      setExam(examData);
      processExamData(examData);
    } catch (e) {
      console.error('❌ Load failed:', e.message);
      Alert.alert('Load failed', e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };
  
  const processExamData = (examData) => {
    if (!examData?.modules || !Array.isArray(examData.modules)) {
      setTasks([]);
      return;
    }
  
    const mod = examData.modules.find(
      (m) => m.name.toLowerCase() === module?.toLowerCase()
    );
  
    if (!mod) {
      setTasks([]);
      return;
    }
  
    if (!Array.isArray(mod.taskIds) || mod.taskIds.length === 0) {
      setTasks([]);
      return;
    }
  
    const processedTasks = processModuleTasks(mod);
    setTasks(processedTasks);
  
    const duration = (mod.durationMinutes || 60);
    setSecondsLeft(duration * 60);
  };

  const processModuleTasks = (mod) => {
    if (!mod.taskIds || !Array.isArray(mod.taskIds)) {
      return [];
    }

    if (module === 'listening' || module === 'reading') {
      const tasks = mod.taskIds.flatMap(task => {
        if (task.questions && task.questions.length > 0) {
          return task.questions.map((question, qIndex) => ({
            _id: `${task._id}:${question._id}`,
            parentTaskId: task._id,
            title: task.title,
            instruction: task.instruction,
            content: task.content,
            mediaUrl: task.mediaUrl,
            imageUrl: task.imageUrl,
            question: question.question,
            options: question.options?.map(opt => opt.text) || [],
            points: question.points,
            questionType: question.questionType,
            taskType: task.taskType
          }));
        } else {
          return [{
            _id: task._id,
            parentTaskId: task._id,
            title: task.title,
            instruction: task.instruction,
            content: task.content,
            mediaUrl: task.mediaUrl,
            imageUrl: task.imageUrl,
            question: task.instruction || task.title,
            options: task.options || [],
            points: task.points,
            questionType: task.taskType === "multiple_choice" ? "multiple_choice" : "text_input",
            taskType: task.taskType
          }];
        }
      });
      return tasks;
    } else {
      const tasks = mod.taskIds.map(task => ({
        _id: task._id,
        parentTaskId: task._id,
        title: task.title,
        instruction: task.instruction,
        content: task.content,
        imageUrl: task.imageUrl,
        mediaUrl: task.mediaUrl,
        question: task.instruction || 'Complete the task as instructed',
        options: [],
        points: task.points,
        questionType: task.taskType,
        taskType: task.taskType,
        maxFiles: task.maxFiles || 1,
        maxFileSize: task.maxFileSize || 10,
        allowedFileTypes: task.allowedFileTypes || ['public.item'],
        recordingTime: task.recordingTime || 300 
      }));
      return tasks;
    }
  };

  useEffect(() => {
    if (secondsLeft == null) return;
    if (secondsLeft <= 0) { 
      onSubmit(); 
      return; 
    }
    const id = setTimeout(() => setSecondsLeft(s => s-1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const selectAnswer = (taskId, answer) => {
    setAnswers(prev => ({...prev, [taskId]: answer}));
    setHasUnsavedChanges(true);
  };

  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    try {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting YouTube ID:', error);
      return null;
    }
  };

  const getYouTubeDirectUrl = (url) => {
    const videoId = extractYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
  };

  const openYouTubeInApp = (url) => {
    const directUrl = getYouTubeDirectUrl(url);
    Linking.openURL(directUrl).catch(err => {
      Alert.alert('Error', 'Cannot open YouTube. Please check if YouTube app is installed.');
    });
  };

  const onPlayerReady = () => {
    setPlayerReady(true);
    console.log('YouTube player ready');
  };

  const onPlayerError = (error) => {
    console.log('YouTube player error:', error);
    Alert.alert(
      'Video Error',
      'There was an issue loading the video. Please try opening in YouTube app.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open in YouTube', 
          onPress: () => openYouTubeInApp(currentTask?.mediaUrl)
        }
      ]
    );
  };


  const takePhoto = async (taskId) => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
      });

      if (result.assets && result.assets[0]) {
        const photo = result.assets[0];
        const file = {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.fileName || `photo_${Date.now()}.jpg`,
          size: photo.fileSize || 0,
        };

        setUploadedFiles(prev => ({
          ...prev,
          [taskId]: [file]
        }));

        selectAnswer(taskId, `Photo taken: ${file.name}`);
        Alert.alert('Success', 'Photo captured successfully!');
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const removeFile = (taskId, fileIndex) => {
    const currentFiles = uploadedFiles[taskId] || [];
    const updatedFiles = currentFiles.filter((_, index) => index !== fileIndex);
    
    setUploadedFiles(prev => ({
      ...prev,
      [taskId]: updatedFiles
    }));

    const fileNames = updatedFiles.map(file => file.name).join(', ');
    selectAnswer(taskId, updatedFiles.length > 0 ? `Uploaded files: ${fileNames}` : '');
  };

  const startRecording = async (taskId) => {
    if (!cameraPermission || !microphonePermission) {
      const granted = await requestPermissions();
      if (!granted) {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are required to record video responses.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Open Settings', 
              onPress: () => Linking.openSettings() 
            }
          ]
        );
        return;
      }
    }

    setShowCamera(true);
    setIsRecording(true);
    setRecordingTime(0);
  };

  const stopRecording = async (taskId) => {
    setIsRecording(false);
    setShowCamera(false);
    
    const recordingUrl = `recording_${taskId}_${Date.now()}.mp4`;
    setRecordings(prev => ({
      ...prev,
      [taskId]: {
        url: recordingUrl,
        duration: recordingTime
      }
    }));
    
    selectAnswer(taskId, `Video recording completed - ${fmt(recordingTime)}`);
    Alert.alert('Recording Saved', 'Your video response has been recorded successfully.');
    setRecordingTime(0);
  };

  const retryRecording = (taskId) => {
    setRecordings(prev => {
      const newRecordings = {...prev};
      delete newRecordings[taskId];
      return newRecordings;
    });
    selectAnswer(taskId, '');
    setShowCamera(false);
  };

  const showExitConfirmation = () => {
    if (!hasUnsavedChanges) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      'Exit Assessment',
      'You have unsaved changes. Are you sure you want to exit? Your progress will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleBackPress = () => {
    showExitConfirmation();
  };

  const currentTask = tasks[currentTaskIndex];
  const isLastTask = currentTaskIndex === tasks.length - 1;

  const goToNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(prev => prev + 1);
      setPlaying(false);
    }
  };

  const goToPreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(prev => prev - 1);
      setPlaying(false);
    }
  };

  const onSubmit = async () => {
    try {
      const payload = new FormData();
      payload.append('examId', examId);
      payload.append('module', module);
      
      const responses = tasks.map(task => {
        if (module === 'listening' || module === 'reading') {
          return {
            taskId: task.parentTaskId,
            questionId: task._id.includes(':') ? task._id.split(':')[1] : task._id,
            answer: answers[task._id] || ''
          };
        } else {
          return {
            taskId: task._id,
            answer: answers[task._id] || `Completed ${task.title}`
          };
        }
      });

      console.log('Submitting responses:', responses);
      payload.append('responses', JSON.stringify(responses));

      if (module === 'writing') {
        for (const [taskId, files] of Object.entries(uploadedFiles)) {
          files.forEach((file, index) => {
            if (file.uri) {
              const fileObject = {
                uri: file.uri,
                type: file.type || 'application/octet-stream',
                name: file.name || `file_${index}`,
              };
              payload.append(`files`, fileObject);
              payload.append(`fileTasks`, taskId);
            }
          });
        }
      }

      if (module === 'speaking') {
        Object.entries(recordings).forEach(([taskId, recording]) => {
          payload.append(`recordings`, taskId);
        });
      }

      await api.post('/api/submissions', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setHasUnsavedChanges(false);
      
      Alert.alert(
        'Submitted Successfully', 
        'Your responses have been submitted.',
        [{ text: 'OK', onPress: () => navigation.reset({
          index: 0, 
          routes: [{name: 'StudentHome'}]
        })}]
      );
    } catch (e) {
      console.error('Submit error:', e);
      Alert.alert('Submit failed', e?.response?.data?.error || e.message);
    }
  };

  const getModuleColor = () => {
    switch (module?.toLowerCase()) {
      case 'listening': return '#3B82F6';
      case 'speaking': return '#10B981';
      case 'reading': return '#8B5CF6';
      case 'writing': return '#F59E0B';
      default: return '#6366F1';
    }
  };

  const moduleColor = getModuleColor();

  const CameraView = () => {
    const devices = useCameraDevices();
    const device = devices.back;

    if (!device) {
      return (
        <View style={styles.cameraContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.cameraText}>Loading camera...</Text>
        </View>
      );
    }

    return (
      <View style={styles.cameraFullscreen}>
        <Camera
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={true}
          video={true}
          audio={true}
        />
        
        <View style={styles.cameraOverlay}>
          <View style={styles.taskContentOverlay}>
            <Text style={styles.overlayTitle}>{currentTask?.title}</Text>
            {currentTask?.content && (
              <Text style={styles.overlayContent}>{currentTask.content}</Text>
            )}
            {currentTask?.imageUrl && (
              <Image 
                source={{ uri: currentTask.imageUrl }} 
                style={styles.overlayImage}
                resizeMode="contain"
              />
            )}
          </View>
          
          <View style={styles.recordingTimerOverlay}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingTimerText}>Recording: {fmt(recordingTime)}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.stopRecordingButton}
          onPress={() => stopRecording(currentTask._id)}
        >
          <View style={styles.stopButtonInner} />
        </TouchableOpacity>
      </View>
    );
  };

  if (showCamera) {
    return <CameraView />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={moduleColor} />
        <Text style={styles.loadingText}>Loading {module} module...</Text>
      </View>
    );
  }

  if (!currentTask && tasks.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No tasks available</Text>
        <Text style={styles.errorText}>
          There are no tasks available for the {module} module at this time.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentTask) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error Loading Task</Text>
        <Text style={styles.errorText}>
          Unable to load task {currentTaskIndex + 1} of {tasks.length}.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentTaskFiles = uploadedFiles[currentTask._id] || [];
  const currentRecording = recordings[currentTask._id];
  const youtubeVideoId = extractYouTubeVideoId(currentTask.mediaUrl);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: moduleColor }]}>
        <View style={styles.headerBackground} />
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{module?.toUpperCase()}</Text>
          <Text style={styles.headerSubtitle}>Assessment Module</Text>
        </View>
        
        <View style={styles.timerContainer}>
          <View style={styles.timerCircle}>
            <Text style={styles.timer}>{secondsLeft != null ? fmt(secondsLeft) : '--:--'}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Question {currentTaskIndex + 1} of {tasks.length}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(((currentTaskIndex + 1) / tasks.length) * 100)}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentTaskIndex + 1) / tasks.length) * 100}%`, backgroundColor: moduleColor }
              ]} 
            />
          </View>
        </View>

        <View style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={[styles.taskIcon, { backgroundColor: `${moduleColor}20` }]}>
              <Text style={[styles.taskIconText, { color: moduleColor }]}>
                {module === 'listening' ? '🎧' : 
                 module === 'speaking' ? '🎤' : 
                 module === 'reading' ? '📖' : '✏️'}
              </Text>
            </View>
            <View style={styles.taskTitleContainer}>
              <Text style={styles.taskTitle}>{currentTask.title}</Text>
              <Text style={styles.taskPoints}>{currentTask.points || 10} points</Text>
            </View>
          </View>

          {currentTask.imageUrl && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: currentTask.imageUrl }} 
                style={styles.taskImage}
                resizeMode="contain"
              />
            </View>
          )}

          {currentTask.mediaUrl && module === 'listening' && youtubeVideoId && (
            <View style={styles.mediaContainer}>
              <View style={styles.videoContainer}>
                <YoutubePlayer
                  ref={playerRef}
                  height={220}
                  width={screenWidth - 88} 
                  videoId={youtubeVideoId}
                  play={playing}
                  onChangeState={(state) => {
                    if (state === 'ended') {
                      setPlaying(false);
                    }
                  }}
                  onReady={onPlayerReady}
                  onError={onPlayerError}
                  initialPlayerParams={{
                    modestbranding: 1,
                    playsinline: 1,
                    rel: 0,
                    controls: 1,
                    showinfo: 0
                  }}
                />
                
                {!playerReady && (
                  <View style={styles.videoLoading}>
                    <ActivityIndicator size="large" color={moduleColor} />
                    <Text style={styles.videoLoadingText}>Loading video...</Text>
                  </View>
                )}
                
               
              </View>
            </View>
          )}

          {/* Fallback for non-YouTube media */}
          {currentTask.mediaUrl && module === 'listening' && !youtubeVideoId && (
            <View style={styles.mediaContainer}>
              <Text style={styles.sectionLabel}>🎵 Listening Material</Text>
              <TouchableOpacity 
                style={[styles.mediaUrlButton, { backgroundColor: moduleColor }]}
                onPress={() => openYouTubeInApp(currentTask.mediaUrl)}
              >
                <Text style={styles.mediaUrlButtonText}>🔗 Open Media Link</Text>
              </TouchableOpacity>
            </View>
          )}



          <View style={styles.questionContainer}>
            <Text style={styles.sectionLabel}>❓ Question</Text>
            <Text style={styles.questionText}>{currentTask.question}</Text>
          </View>

          {module === 'speaking' && (
            <View style={styles.recordingContainer}>
              <Text style={styles.sectionLabel}>🎥 Record Your Response</Text>
              
              {currentRecording ? (
                <View style={styles.recordingPreview}>
                  <View style={styles.recordingStatus}>
                    <Text style={styles.recordingStatusText}>✅ Recording Complete ({fmt(currentRecording.duration)})</Text>
                  </View>
                  <View style={styles.recordingActions}>
                    <TouchableOpacity 
                      style={[styles.recordingButton, styles.retryButton]}
                      onPress={() => retryRecording(currentTask._id)}
                    >
                      <Text style={styles.recordingButtonText}>🔄 Re-record</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.recordingControls}>
                  <TouchableOpacity 
                    style={[styles.recordingButton, { backgroundColor: moduleColor }]}
                    onPress={() => startRecording(currentTask._id)}
                  >
                    <Text style={styles.recordingButtonText}>🎬 Start Recording</Text>
                  </TouchableOpacity>
                  <Text style={styles.recordingTip}>
                    💡 Speak clearly with good lighting. Max: {fmt(currentTask.recordingTime || 300)}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Writing Module - File Upload */}
          {(module === 'writing') && (
            <View style={styles.fileUploadContainer}>
              <Text style={styles.sectionLabel}>📎 Submit Your Work</Text>
              
              <View style={styles.uploadOptions}>
                <TouchableOpacity
                  style={[styles.uploadOption, { borderColor: moduleColor }]}
                  onPress={() => takePhoto(currentTask._id)}
                >
                  <Text style={[styles.uploadOptionText, { color: moduleColor }]}>📸 Take Photo</Text>
                </TouchableOpacity>
              </View>

              {currentTaskFiles.length > 0 && (
                <View style={styles.uploadedFilesContainer}>
                  <Text style={styles.uploadedFilesLabel}>Selected Files:</Text>
                  {currentTaskFiles.map((file, index) => (
                    <View key={index} style={styles.fileItem}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        📄 {file.name}
                      </Text>
                      <TouchableOpacity
                        style={styles.removeFileButton}
                        onPress={() => removeFile(currentTask._id, index)}
                      >
                        <Text style={styles.removeFileText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Answer Input */}
          <View style={styles.answerContainer}>
            {currentTask.options && currentTask.options.length > 0 ? (
              <View style={styles.optionsContainer}>
                {currentTask.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      answers[currentTask._id] === option && [styles.optionSelected, { borderColor: moduleColor }]
                    ]}
                    onPress={() => selectAnswer(currentTask._id, option)}
                  >
                    <View style={[
                      styles.optionIndicator,
                      answers[currentTask._id] === option && [styles.optionIndicatorSelected, { backgroundColor: moduleColor }]
                    ]}>
                      {answers[currentTask._id] === option && <Text style={styles.optionIndicatorText}>✓</Text>}
                    </View>
                    <Text style={[
                      styles.optionText,
                      answers[currentTask._id] === option && styles.optionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : module !== 'speaking' && module !== 'writing' ? (
              <TextInput
                style={[styles.textInput, { borderColor: moduleColor }]}
                multiline
                placeholder="Type your answer here..."
                placeholderTextColor="#94A3B8"
                value={answers[currentTask._id] || ''}
                onChangeText={(text) => selectAnswer(currentTask._id, text)}
                textAlignVertical="top"
                numberOfLines={6}
              />
            ) : null}
          </View>
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, styles.navButtonSecondary]}
            onPress={goToPreviousTask}
            disabled={currentTaskIndex === 0}
          >
            <Text style={[
              styles.navButtonText,
              currentTaskIndex === 0 && styles.navButtonTextDisabled
            ]}>
              ← Previous
            </Text>
          </TouchableOpacity>

          {isLastTask ? (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: moduleColor }]}
              onPress={onSubmit}
            >
              <Text style={styles.navButtonText}>Submit All 🚀</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: moduleColor }]}
              onPress={goToNextTask}
            >
              <Text style={styles.navButtonText}>Next →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  // Modern Header Styles
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 24,
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  timerContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  timerCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  timer: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  content: {
    padding: 20,
  },
  // Progress Section
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  taskIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskIconText: {
    fontSize: 20,
  },
  taskTitleContainer: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  taskPoints: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  // Image Styles
  imageContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  taskImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  mediaContainer: {
    marginBottom: 20,
  },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    alignItems: 'center',
  },
  videoLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  videoLoadingText: {
    color: '#FFFFFF',
    marginTop: 8,
  },
  videoControls: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%',
  },
  videoControlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
  },
  videoControlButtonSecondary: {
    backgroundColor: '#6B7280',
  },
  videoControlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaUrlButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mediaUrlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  contentContainer: {
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  // Recording Styles
  recordingContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  recordingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: '#F59E0B',
  },
  recordingPreview: {
    alignItems: 'center',
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordingStatusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  recordingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  recordingTip: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  cameraFullscreen: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cameraText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 20,
  },
  taskContentOverlay: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  overlayTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  overlayContent: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  overlayImage: {
    width: '100%',
    height: 120,
    marginTop: 12,
    borderRadius: 8,
  },
  recordingTimerOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingTimerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  stopRecordingButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopButtonInner: {
    width: 30,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  // File Upload Styles
  fileUploadContainer: {
    marginBottom: 20,
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  uploadOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
    gap: 8,
  },
  uploadOptionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadedFilesContainer: {
    marginTop: 8,
  },
  uploadedFilesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fileName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  removeFileButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FEF2F2',
  },
  removeFileText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  answerContainer: {
    marginTop: 8,
  },
  optionsContainer: {
    gap: 8,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  optionSelected: {
    backgroundColor: '#F8FAFC',
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIndicatorSelected: {
    borderColor: '#3B82F6',
  },
  optionIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  optionTextSelected: {
    color: '#1E293B',
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  navButtonSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  navButtonTextDisabled: {
    color: '#94A3B8',
  },
});