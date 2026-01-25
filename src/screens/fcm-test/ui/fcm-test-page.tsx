import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFCMMobile } from '@/features/auth/api/use-fcm-mobile';

export function FCMTestPage() {
  const { token, error, isLoading } = useFCMMobile();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FCM Test - Android</Text>

        {isLoading && (
          <View style={styles.section}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Setting up FCM...</Text>
          </View>
        )}

        {error && (
          <View style={[styles.section, styles.errorSection]}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {token && (
          <View style={[styles.section, styles.successSection]}>
            <Text style={styles.successTitle}>FCM Token Generated</Text>
            <ScrollView horizontal style={styles.tokenScroll}>
              <Text style={styles.tokenText}>{token}</Text>
            </ScrollView>
            <Text style={styles.hint}>
              Token has been sent to backend automatically!
            </Text>
          </View>
        )}

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Instructions:</Text>
          <Text style={styles.infoText}>
            1. Make sure backend is running on your computer
          </Text>
          <Text style={styles.infoText}>
            2. Check console for FCM token
          </Text>
          <Text style={styles.infoText}>
            3. Backend should send test notification
          </Text>
          <Text style={styles.infoText}>
            4. You should see alert popup
          </Text>
        </View>

        <View style={styles.debugSection}>
          <Text style={styles.debugTitle}>🔍 Debug Info:</Text>
          <Text style={styles.debugText}>Backend: http://10.0.3.2:8080</Text>
          <Text style={styles.debugText}>Platform: Android (Genymotion)</Text>
          <Text style={styles.debugText}>
            Status: {isLoading ? 'Loading...' : token ? 'Ready' : 'Error'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  errorSection: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
  },
  successSection: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#15803d',
    marginBottom: 8,
  },
  tokenScroll: {
    maxHeight: 100,
  },
  tokenText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#166534',
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 4,
  },
  hint: {
    fontSize: 12,
    color: '#15803d',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e3a8a',
    marginBottom: 4,
    paddingLeft: 8,
  },
  debugSection: {
    backgroundColor: '#fafaf9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#44403c',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#57534e',
    marginBottom: 4,
  },
});