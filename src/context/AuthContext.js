import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';
import {initGoogle, signInWithGoogle, signOutGoogle} from '../core/auth/google';

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [user, setUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [bootDone, setBootDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('idle'); 
  const [message, setMessage] = useState('');

  // Check if profile is complete
  const isProfileComplete = userDetails !== null;

  useEffect(() => {
    initGoogle();
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userData = await AsyncStorage.getItem('user');
      const userDetailsData = await AsyncStorage.getItem('userDetails');

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Load user details if available
        if (userDetailsData) {
          setUserDetails(JSON.parse(userDetailsData));
        } else {
          // Try to fetch user details from API
          await fetchUserDetails();
        }
      }
    } catch (error) {
      console.error('Initialization error:', error);
    } finally {
      setBootDone(true);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const { data } = await api.get('/api/users/detail');
      if (data) {
        setUserDetails(data);
        await AsyncStorage.setItem('userDetails', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
      // It's okay if this fails - user might not have details yet
    }
  };

  const clearMessage = () => {
    setTimeout(() => {
      setMessage('');
      setApiStatus('idle');
    }, 5000);
  };

  const login = async (email, password) => {
    setLoading(true);
    setApiStatus('loading');
    setMessage('Signing in...');
    
    try {
      const {data} = await api.post('/api/auth/login', {email, password});
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      // Fetch user details after login
      await fetchUserDetails();
      
      setApiStatus('success');
      setMessage('Login successful!');
      clearMessage();
      return data.user; // Return user data
    } catch (error) {
      setApiStatus('error');
      setMessage(error?.response?.data?.error || 'Login failed');
      clearMessage();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'student') => {
    setLoading(true);
    setApiStatus('loading');
    setMessage('Creating your account...');
    
    try {
      const {data} = await api.post('/api/auth/register', {name, email, password, role});
      setApiStatus('success');
      setMessage('Verification code sent to your email!');
      clearMessage();
      return data;
    } catch (error) {
      setApiStatus('error');
      setMessage(error?.response?.data?.error || 'Registration failed');
      clearMessage();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, otp) => {
    setLoading(true);
    setApiStatus('loading');
    setMessage('Verifying your email...');
    
    try {
      const {data} = await api.post('/api/auth/verify-email', {email, otp});
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      await fetchUserDetails();
      
      setApiStatus('success');
      setMessage('Email verified successfully!');
      clearMessage();
      return data; // Return full response
    } catch (error) {
      setApiStatus('error');
      setMessage(error?.response?.data?.error || 'Verification failed');
      clearMessage();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    setApiStatus('loading');
    setMessage('Connecting with Google...');
    
    try {
      const gUser = await signInWithGoogle();
      const {email, name} = gUser;
      const {data} = await api.post('/api/auth/google', {email, name});
      
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      
      // Fetch user details after Google login
      await fetchUserDetails();
      
      setApiStatus('success');
      setMessage('Google login successful!');
      clearMessage();
      return data.user; // Return user data
    } catch (error) {
      setApiStatus('error');
      setMessage(error?.response?.data?.error || 'Google login failed');
      clearMessage();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserDetails = async (details) => {
    try {
      const { data } = await api.post('/api/users/create-detail', details);
      setUserDetails(data);
      await AsyncStorage.setItem('userDetails', JSON.stringify(data));
      return data;
    } catch (error) {
      console.error('Failed to update user details:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'userDetails']);
      await signOutGoogle();
      setUser(null);
      setUserDetails(null);
      setMessage('Logged out successfully');
      clearMessage();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userDetails,
        isProfileComplete,
        bootDone,
        loading,
        apiStatus,
        message,
        login,
        register,
        verifyEmail,
        googleLogin,
        updateUserDetails,
        logout,
        refreshUserDetails: fetchUserDetails,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);