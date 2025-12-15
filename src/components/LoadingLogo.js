import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const LoadingLogo = () => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={[styles.logoText, styles.orangeText]}>AE</Text>
        <Text style={[styles.logoText, styles.blueText]}>I</Text>
        <Text style={[styles.logoText, styles.greenText]}>
          O
        </Text>
        <Text style={[styles.logoText, styles.greenText]}>U</Text>
        <Text style={styles.copyright}>©</Text>
      </View>
      <Text style={styles.subtitle}>
        Assessment Of English In Our Union
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 2,
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    fontWeight: 'bold',
    fontSize: screenWidth < 400 ? 24 : 32,
    includeFontPadding: false,
  },
  orangeText: {
    color: '#f97316', // orange-500
  },
  blueText: {
    color: '#2563eb', // blue-600
  },
  greenText: {
    color: '#22c55e', // green-500
  },
  chakraImage: {
    width: screenWidth < 400 ? 16 : 28,
    height: screenWidth < 400 ? 16 : 28,
    marginHorizontal: 2,
  },
  copyright: {
    fontSize: screenWidth < 400 ? 12 : 16,
    marginLeft: -4,
    marginBottom: screenWidth < 400 ? 8 : 8,
    includeFontPadding: false,
  },
  subtitle: {
    fontSize: screenWidth < 400 ? 8 : 12,
    fontFamily: 'Poppins-Medium',
    fontWeight: '500',
    textAlign: 'center',
    color: '#374151',
  },
});

export default LoadingLogo;