import { useLocalSearchParams, useRouter } from 'expo-router'
import { Globe } from 'lucide-react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

import { useCaptureStore } from '@/entities/capture'
import { useWorldStore } from '@/entities/world'
import type { MarbleModel } from '@/shared/api/marble-client'

import { useGenerateWorld } from '@/features/world-generation/model/use-generate-world'
import { useUploadImages } from '@/features/world-generation/model/use-upload-images'
import { ModelSelector } from '@/features/world-generation/ui/model-selector'

export function WorldGenerationScreen() {
  const router = useRouter()
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const { images } = useCaptureStore()
  const currentGeneration = useWorldStore((s) => s.currentGeneration)
  const startStoreGeneration = useWorldStore((s) => s.startGeneration)

  const [model, setModel] = useState<MarbleModel>('Marble 0.1-mini')
  const [started, setStarted] = useState(false)
  const [roomName, setRoomName] = useState('')

  const upload = useUploadImages()
  const generation = useGenerateWorld()

  const spinAnim = useRef(new Animated.Value(0)).current

  // Spinning animation for the globe
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    spin.start()
    return () => spin.stop()
  }, [spinAnim])

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const handleStart = useCallback(async () => {
    if (images.length === 0 || !propertyId || !roomName.trim()) return

    setStarted(true)

    // Initialize store
    startStoreGeneration({
      id: '',
      displayName: roomName.trim(),
      status: 'uploading',
      model,
      createdAt: new Date().toISOString(),
    })

    // Step 1: Upload all images to Marble API
    const uploaded = await upload.uploadAll(images)
    if (!uploaded) return // Failed or cancelled

    // Step 2: Send to RealVista Backend (which orchestrates Marble generation)
    await generation.startGeneration({
      propertyId: propertyId as string,
      images: uploaded,
      displayName: roomName.trim(),
      roomName: roomName.trim(),
      model,
    })
  }, [images, model, roomName, startStoreGeneration, upload, generation, propertyId])

  const handleViewWorld = useCallback(() => {
    if (currentGeneration?.id) {
      router.replace({ pathname: '/world-viewer', params: { worldId: currentGeneration.id } })
    }
  }, [router, currentGeneration])

  const handleBackToProperties = useCallback(() => {
    router.replace('/(tabs)/manage-posts')
  }, [router])

  const isWorking =
    upload.isUploading || generation.phase === 'requesting' || generation.phase === 'polling'
  const isDone = generation.phase === 'succeeded'
  const isFailed = generation.phase === 'failed' || !!upload.error
  const isPolling = generation.phase === 'polling'

  const getStatusText = () => {
    if (upload.isUploading) return `Uploading image ${upload.currentIndex}/${upload.totalImages}...`
    if (generation.phase === 'requesting') return 'Submitting to backend...'
    if (generation.phase === 'polling') return generation.progressDescription
    if (isDone) return '🎉 World generated successfully!'
    if (isFailed) return upload.error || generation.error || 'Generation failed'
    return `${images.length} images ready to generate`
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>3D World</Text>
        <View style={styles.backButton} />
      </View>

      {/* Center content */}
      <View style={styles.content}>
        {!started && (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Room Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Living Room, Bathroom"
              placeholderTextColor="#6B7280"
              value={roomName}
              onChangeText={setRoomName}
              editable={!isWorking}
            />
          </View>
        )}

        {/* Animated globe */}
        <Animated.View
          style={[
            styles.globeContainer,
            { transform: [{ rotateY: isWorking ? spinInterpolation : '0deg' }] },
          ]}
        >
          {isDone ? (
            <Globe color='#10B981' size={80} />
          ) : isFailed ? (
            <Globe color='#EF4444' size={80} />
          ) : (
            <Globe color={isWorking ? '#3B82F6' : '#6B7280'} size={80} />
          )}
        </Animated.View>

        {/* Status */}
        <Text
          style={[styles.status, isDone && styles.statusSuccess, isFailed && styles.statusError]}
        >
          {getStatusText()}
        </Text>

        {/* Progress bar for uploads */}
        {upload.isUploading && (
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(upload.currentIndex / upload.totalImages) * 100}%` },
              ]}
            />
          </View>
        )}

        {/* Activity indicator for polling */}
        {(generation.phase === 'requesting' || generation.phase === 'polling') && (
          <ActivityIndicator color='#3B82F6' size='small' style={styles.spinner} />
        )}

        {/* Background-safe message when polling */}
        {isPolling && (
          <View style={styles.safeMessage}>
            <Text style={styles.safeMessageText}>
              ✅ You can safely leave this screen or close the app.
              {'\n'}The backend will continue processing your 3D world.
            </Text>
          </View>
        )}

        {/* Model selector (only before starting) */}
        {!started && <ModelSelector selected={model} onSelect={setModel} disabled={isWorking} />}

        {/* Action buttons */}
        <View style={styles.actions}>
          {!started && (
            <Pressable
              style={[styles.startButton, (images.length === 0 || !roomName.trim()) && styles.startButtonDisabled]}
              onPress={handleStart}
              disabled={images.length === 0 || !propertyId || !roomName.trim()}
            >
              <Text style={styles.startButtonText}>Generate 3D World</Text>
            </Pressable>
          )}

          {isPolling && (
            <Pressable style={styles.backToPropertiesButton} onPress={handleBackToProperties}>
              <Text style={styles.backToPropertiesText}>← Back to My Properties</Text>
            </Pressable>
          )}

          {isDone && (
            <Pressable style={styles.viewButton} onPress={handleViewWorld}>
              <Text style={styles.viewButtonText}>View 3D World →</Text>
            </Pressable>
          )}

          {isFailed && (
            <Pressable
              style={styles.retryButton}
              onPress={() => {
                setStarted(false)
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 80,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  inputLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  globeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  status: {
    color: '#D1D5DB',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  statusSuccess: {
    color: '#10B981',
  },
  statusError: {
    color: '#EF4444',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1F2937',
    borderRadius: 3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  spinner: {
    marginBottom: 24,
  },
  safeMessage: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    width: '100%',
  },
  safeMessageText: {
    color: '#34D399',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    textAlign: 'center',
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#374151',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  viewButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  retryButton: {
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  backToPropertiesButton: {
    backgroundColor: '#1F2937',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  backToPropertiesText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
})
