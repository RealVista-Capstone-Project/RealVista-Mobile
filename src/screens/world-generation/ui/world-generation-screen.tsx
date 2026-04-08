import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import {
  Globe,
  ChevronLeft,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react-native'
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
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

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

  const startStoreGeneration = useWorldStore((s) => s.startGeneration)

  const [model, setModel] = useState<MarbleModel>('Marble 0.1-mini')
  const [started, setStarted] = useState(false)
  const [roomName, setRoomName] = useState('')

  const upload = useUploadImages()
  const generation = useGenerateWorld()

  const spinAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Spinning animation for the globe
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    )
    spin.start()

    // Breathing pulse for the halo
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()

    return () => {
      spin.stop()
      pulse.stop()
    }
  }, [spinAnim, pulseAnim])

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
    if (propertyId && roomName.trim()) {
      router.replace({
        pathname: '/world-viewer',
        params: { propertyId, roomName: roomName.trim() },
      })
    }
  }, [router, propertyId, roomName])

  const handleBackToProperties = useCallback(() => {
    if (propertyId) {
      router.replace({ pathname: '/manage-3d/[id]', params: { id: propertyId } })
    } else {
      router.replace('/(tabs)/manage-posts')
    }
  }, [router, propertyId])

  const isWorking =
    upload.isUploading || generation.phase === 'requesting' || generation.phase === 'polling'
  const isDone = generation.phase === 'succeeded'
  const isFailed = generation.phase === 'failed' || !!upload.error
  const isPolling = generation.phase === 'polling'

  const getStatusText = () => {
    if (upload.isUploading) return `Đang tải lên ${upload.currentIndex}/${upload.totalImages}...`
    if (generation.phase === 'requesting') return 'Đang khởi tạo yêu cầu...'
    if (generation.phase === 'polling') return generation.progressDescription
    if (isDone) return 'Sẵn sàng trải nghiệm tour 3D!'
    if (isFailed) return upload.error || generation.error || 'Thất bại'
    return `${images.length} Ảnh đã sẵn sàng tạo tour`
  }

  // --- Premium Alert Card ---
  const renderAlert = () => {
    if (!isFailed) return null

    // Check specifically for API Key error visually
    const isApiKeyError = getStatusText().includes('Marble API key')

    return (
      <View style={styles.alertCard}>
        <LinearGradient
          colors={['rgba(239, 68, 68, 0.1)', 'rgba(239, 68, 68, 0.05)']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.alertIconBox}>
          {isApiKeyError ? (
            <ShieldAlert color='#EF4444' size={24} />
          ) : (
            <AlertTriangle color='#F59E0B' size={24} />
          )}
        </View>
        <View style={styles.alertTextContent}>
          <Text style={styles.alertTitle}>Lỗi hệ thống</Text>
          <Text style={styles.alertMessage} numberOfLines={3}>
            {getStatusText()}
          </Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.viewRoot}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Immersive Background */}
      <LinearGradient
        colors={['#0F172A', '#111827', '#020617']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <SafeAreaView style={styles.container}>
        {/* Fixed Premium Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerAction}
            activeOpacity={0.7}
          >
            <ChevronLeft color='#FFFFFF' size={28} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.title}>Thế giới 3D</Text>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isWorking ? '#7065F0' : isDone ? '#10B981' : '#64748B' },
                ]}
              />
              <Text style={styles.subtitle}>
                {isWorking ? 'Đang khởi tạo' : isDone ? 'Hoàn tất' : 'Sẵn sàng'}
              </Text>
            </View>
          </View>

          <View style={styles.headerAction} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Main Content Area */}
          <View style={styles.content}>
            {/* Immersive Stage - Animated Globe */}
            <View style={styles.stage}>
              <Animated.View
                style={[
                  styles.halo,
                  { transform: [{ scale: pulseAnim }], opacity: isWorking ? 0.4 : 0.15 },
                ]}
              />
              <Animated.View
                style={[
                  styles.globeShadowContainer,
                  isWorking && styles.globeWorking,
                  { transform: [{ rotateY: isWorking ? spinInterpolation : '0deg' }] },
                ]}
              >
                <LinearGradient
                  colors={['rgba(112, 101, 240, 0.25)', 'transparent']}
                  style={[StyleSheet.absoluteFill, { borderRadius: 9999 }]}
                />
                {isDone ? (
                  <CheckCircle2 color='#10B981' size={90} strokeWidth={1.2} />
                ) : isFailed ? (
                  <Globe color='rgba(239, 68, 68, 0.5)' size={90} strokeWidth={1.2} />
                ) : (
                  <Globe color={isWorking ? '#7065F0' : '#FFFFFF'} size={90} strokeWidth={1.2} />
                )}
              </Animated.View>

              <Text style={styles.statusMainText}>{getStatusText()}</Text>

              {/* Image Coverage Pill */}
              {!started && (
                <View style={styles.coveragePill}>
                  <Sparkles size={14} color='#7065F0' />
                  <Text style={styles.coveragePillText}>{images.length} góc nhìn sẵn sàng</Text>
                </View>
              )}
            </View>

            {/* Config Area - Visible only before start */}
            {!started && (
              <Animated.View style={styles.configArea}>
                <View style={styles.inputCard}>
                  <Text style={styles.inputLabel}>Tên không gian</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder='VD: Phòng khách, Ban công...'
                    placeholderTextColor='rgba(255,255,255,0.3)'
                    value={roomName}
                    onChangeText={setRoomName}
                    editable={!isWorking}
                  />
                </View>

                <View style={styles.sectionDivider}>
                  <Text style={styles.dividerLabel}>CHỌN ĐỘ PHÂN GIẢI</Text>
                  <View style={styles.dividerLine} />
                </View>

                <ModelSelector selected={model} onSelect={setModel} disabled={isWorking} />
              </Animated.View>
            )}

            {/* Error States Display */}
            {renderAlert()}

            {/* Progress indicators for Work flows */}
            {upload.isUploading && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${(upload.currentIndex / upload.totalImages) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressMeta}>
                  {Math.round((upload.currentIndex / upload.totalImages) * 100)}% Hoàn thành
                </Text>
              </View>
            )}

            {isPolling && (
              <View style={styles.pollingCard}>
                <ActivityIndicator color='#7065F0' size='small' />
                <Text style={styles.pollingText}>
                  Đang xử lý tại trung tâm AI. Bạn có thể rời màn hình này.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Actions Area */}
        <SafeAreaView style={styles.floatingActions}>
          <LinearGradient
            colors={['transparent', 'rgba(15, 23, 42, 0.9)', '#000000']}
            style={styles.actionsGradient}
          />
          <View style={styles.actionsContent}>
            {!started && (
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (images.length === 0 || !roomName.trim()) && styles.buttonDisabled,
                ]}
                onPress={handleStart}
                disabled={images.length === 0 || !propertyId || !roomName.trim()}
              >
                <LinearGradient
                  colors={['#7065F0', '#4F46E5']}
                  style={styles.primaryButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>Bắt đầu tạo tour</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isPolling && (
              <TouchableOpacity style={styles.secondaryButton} onPress={handleBackToProperties}>
                <Text style={styles.secondaryButtonText}>Quay lại quản lý tin đăng</Text>
              </TouchableOpacity>
            )}

            {isDone && (
              <TouchableOpacity style={styles.primaryButton} onPress={handleViewWorld}>
                <LinearGradient
                  colors={['#7065F0', '#4F46E5']}
                  style={styles.primaryButtonGradient}
                >
                  <Text style={styles.primaryButtonText}>Trải nghiệm tour 3D ngay</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isFailed && (
              <TouchableOpacity style={styles.secondaryButton} onPress={() => setStarted(false)}>
                <Text style={styles.secondaryButtonText}>Quay lại thiết lập</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  viewRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerAction: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  scrollContent: {
    paddingBottom: 180,
  },
  content: {
    paddingHorizontal: 28,
  },
  stage: {
    alignItems: 'center',
    paddingVertical: 50,
    marginBottom: 10,
  },
  halo: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#7065F0',
  },
  globeShadowContainer: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  globeWorking: {
    shadowColor: '#7065F0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 8,
  },
  statusMainText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  coveragePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(112, 101, 240, 0.1)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(112, 101, 240, 0.25)',
  },
  coveragePillText: {
    color: '#A5B4FC',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
  },
  configArea: {
    marginTop: 10,
  },
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 28,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 32,
  },
  inputLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingLeft: 22,
    paddingTop: 18,
    marginBottom: 4,
  },
  textInput: {
    color: '#FFFFFF',
    paddingHorizontal: 22,
    paddingBottom: 18,
    fontSize: 19,
    fontWeight: '700',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  dividerLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginRight: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  alertCard: {
    flexDirection: 'row',
    padding: 22,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    overflow: 'hidden',
    marginTop: 24,
  },
  alertIconBox: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextContent: {
    flex: 1,
    marginLeft: 18,
  },
  alertTitle: {
    color: '#EF4444',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 6,
  },
  alertMessage: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 14,
    lineHeight: 22,
  },
  progressContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7065F0',
    borderRadius: 4,
  },
  progressMeta: {
    marginTop: 12,
    color: '#A5B4FC',
    fontSize: 13,
    fontWeight: '800',
  },
  pollingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(112, 101, 240, 0.08)',
    padding: 20,
    borderRadius: 20,
    marginTop: 32,
    borderWidth: 1,
    borderColor: 'rgba(112, 101, 240, 0.15)',
  },
  pollingText: {
    color: '#A5B4FC',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginLeft: 14,
    lineHeight: 20,
  },
  floatingActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  actionsGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  actionsContent: {
    padding: 28,
    paddingTop: 44,
  },
  primaryButton: {
    height: 68,
    borderRadius: 24,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.2,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  secondaryButton: {
    height: 64,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
})
