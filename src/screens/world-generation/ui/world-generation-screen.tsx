import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import {
  Globe,
  ChevronLeft,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Info,
} from 'lucide-react-native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native'

import { useCaptureStore } from '@/entities/capture'
import { useThreeDQuota } from '@/entities/billing'
import { useWorldStore } from '@/entities/world'
import type { MarbleModel } from '@/shared/api/marble-client'

import { useGenerateWorld } from '@/features/world-generation/model/use-generate-world'
import { useUploadImages } from '@/features/world-generation/model/use-upload-images'
import { ModelSelector } from '@/features/world-generation/ui/model-selector'

// ── Skeleton primitives ────────────────────────────────────────────────────────

function SkeletonBox({
  width,
  height,
  style,
}: {
  width?: number | string
  height: number
  style?: object
}) {
  const shimmer = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    )
    anim.start()
    return () => anim.stop()
  }, [shimmer])

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] })

  return (
    <Animated.View
      style={[
        { width: width ?? '100%', height, borderRadius: 10, backgroundColor: '#D1D5DB', opacity },
        style,
      ]}
    />
  )
}

function UploadSkeletonCard({
  currentIndex,
  totalImages,
}: {
  currentIndex: number
  totalImages: number
}) {
  const pct = totalImages > 0 ? (currentIndex / totalImages) * 100 : 0
  const fillAnim = useRef(new Animated.Value(pct)).current

  useEffect(() => {
    Animated.timing(fillAnim, { toValue: pct, duration: 400, useNativeDriver: false }).start()
  }, [pct, fillAnim])

  return (
    <View style={skeletonStyles.card}>
      {/* Header row */}
      <View style={skeletonStyles.row}>
        <SkeletonBox width={40} height={40} style={{ borderRadius: 12 }} />
        <View style={{ flex: 1, gap: 8, marginLeft: 12 }}>
          <SkeletonBox width='60%' height={14} />
          <SkeletonBox width='40%' height={10} />
        </View>
        <View style={skeletonStyles.badge}>
          <Text style={skeletonStyles.badgeText}>
            {currentIndex}/{totalImages}
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={skeletonStyles.trackWrap}>
        <View style={skeletonStyles.track}>
          <Animated.View
            style={[
              skeletonStyles.fill,
              {
                width: fillAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
              },
            ]}
          />
        </View>
        <Text style={skeletonStyles.pctText}>{Math.round(pct)}%</Text>
      </View>

      {/* Skeleton lines */}
      <View style={{ gap: 10 }}>
        <SkeletonBox height={12} width='80%' />
        <SkeletonBox height={12} width='55%' />
      </View>
    </View>
  )
}

function PollingSkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      {/* Icon + title */}
      <View style={skeletonStyles.row}>
        <SkeletonBox width={40} height={40} style={{ borderRadius: 12 }} />
        <View style={{ flex: 1, gap: 8, marginLeft: 12 }}>
          <SkeletonBox width='70%' height={14} />
          <SkeletonBox width='45%' height={10} />
        </View>
        <ActivityIndicator color='#7065F0' size='small' />
      </View>

      {/* Fake content lines */}
      <View style={{ gap: 10, marginTop: 4 }}>
        <SkeletonBox height={12} width='90%' />
        <SkeletonBox height={12} width='65%' />
        <SkeletonBox height={12} width='75%' />
      </View>

      {/* Fake step indicators */}
      <View style={skeletonStyles.steps}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[skeletonStyles.step, i === 1 && skeletonStyles.stepActive]} />
        ))}
        <View style={{ flex: 1 }} />
        <SkeletonBox width={60} height={10} />
      </View>
    </View>
  )
}

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

  const { remaining, quotaLimit, unlimited, isLocked } = useThreeDQuota()

  const spinAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

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

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
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

    startStoreGeneration({
      id: '',
      displayName: roomName.trim(),
      status: 'uploading',
      model,
      createdAt: new Date().toISOString(),
    })

    const uploaded = await upload.uploadAll(images)
    if (!uploaded) return

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
    if (isDone) return 'Phòng 3D đã sẵn sàng!'
    if (isFailed) return upload.error || generation.error || 'Thất bại'
    return `${images.length} góc nhìn sẵn sàng tạo phòng 3D`
  }

  const estimatedTime = model === 'Marble 0.1-mini' ? '~45 giây' : '~5 phút'

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ChevronLeft color='#111827' size={24} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps='handled'
          >
            {/* Title block */}
            <View style={styles.titleBlock}>
              <Text style={styles.eyebrow}>TẠO MỚI</Text>
              <Text style={styles.mainTitle}>Thiết lập Phòng 3D</Text>
              <Text style={styles.subtitle}>
                Đặt tên phòng và chọn độ phân giải cho mô hình 3D chất lượng cao của bạn.
              </Text>
            </View>

            {/* Working state: Globe animation */}
            {started && (
              <View style={styles.workingStage}>
                <Animated.View
                  style={[
                    styles.globeHalo,
                    { transform: [{ scale: pulseAnim }], opacity: isWorking ? 0.18 : 0.08 },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.globeContainer,
                    { transform: [{ rotateY: isWorking ? spinInterpolation : '0deg' }] },
                  ]}
                >
                  {isDone ? (
                    <CheckCircle2 color='#10B981' size={64} strokeWidth={1.5} />
                  ) : isFailed ? (
                    <Globe color='#EF4444' size={64} strokeWidth={1.5} />
                  ) : (
                    <Globe color='#7065F0' size={64} strokeWidth={1.5} />
                  )}
                </Animated.View>
                <Text style={styles.workingStatus}>{getStatusText()}</Text>
              </View>
            )}

            {/* Config form */}
            {!started && (
              <View style={styles.formCard}>
                {/* Space Name */}
                <Text style={styles.fieldLabel}>TÊN PHÒNG 3D</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.textInput}
                    placeholder='VD: Phòng khách...'
                    placeholderTextColor='#9CA3AF'
                    value={roomName}
                    onChangeText={setRoomName}
                    editable={!isWorking}
                    numberOfLines={1}
                  />
                </View>

                {/* Resolution */}
                <Text style={[styles.fieldLabel, { marginTop: 20 }]}>ĐỘ PHÂN GIẢI PHÒNG 3D</Text>
                <ModelSelector selected={model} onSelect={setModel} disabled={isWorking} />
              </View>
            )}

            {/* Error */}
            {isFailed && (
              <View style={styles.errorCard}>
                <View style={styles.errorIcon}>
                  {getStatusText().includes('Marble API key') ? (
                    <ShieldAlert color='#EF4444' size={20} />
                  ) : (
                    <AlertTriangle color='#F59E0B' size={20} />
                  )}
                </View>
                <View style={styles.errorText}>
                  <Text style={styles.errorTitle}>Lỗi hệ thống</Text>
                  <Text style={styles.errorMsg} numberOfLines={3}>
                    {getStatusText()}
                  </Text>
                </View>
              </View>
            )}

            {/* Upload skeleton */}
            {upload.isUploading && (
              <UploadSkeletonCard
                currentIndex={upload.currentIndex}
                totalImages={upload.totalImages}
              />
            )}

            {/* Polling skeleton */}
            {isPolling && <PollingSkeletonCard />}

            {/* Tip card */}
            {!started && (
              <View style={styles.tipCard}>
                <Info size={16} color='#059669' strokeWidth={2} />
                <View style={styles.tipText}>
                  <Text style={styles.tipTitle}>Mẹo chụp ảnh</Text>
                  <Text style={styles.tipBody}>
                    Đảm bảo tất cả cửa nội thất đều mở và ánh sáng đều khắp không gian để theo dõi
                    không gian tốt nhất.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Bottom action */}
        <View style={styles.bottomBar}>
          {!started && (
            <>
              {!unlimited && (
                <View
                  className={`mb-3 rounded-lg border px-4 py-3 ${
                    isLocked ? 'border-red-200 bg-red-50' : 'border-purple-200 bg-purple-50'
                  }`}
                >
                  {isLocked ? (
                    <Text className='text-center text-sm text-red-600'>
                      Bạn đã hết lượt tạo 3D. Vui lòng nâng cấp gói.
                    </Text>
                  ) : (
                    <Text className='text-center text-sm text-purple-700'>
                      {`Còn ${remaining}${quotaLimit ? `/${quotaLimit}` : ''} lượt tạo 3D`}
                    </Text>
                  )}
                </View>
              )}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (images.length === 0 || !roomName.trim()) && styles.primaryBtnDisabled,
                ]}
                onPress={handleStart}
                disabled={isLocked || images.length === 0 || !propertyId || !roomName.trim()}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Bắt đầu tạo phòng 3D</Text>
                <ArrowRight color='#FFFFFF' size={18} strokeWidth={2.5} />
              </TouchableOpacity>
              <Text style={styles.estimateText}>Thời gian xử lý ước tính: {estimatedTime}</Text>
            </>
          )}

          {isPolling && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={handleBackToProperties}>
              <Text style={styles.secondaryBtnText}>Quay lại quản lý tin đăng</Text>
            </TouchableOpacity>
          )}

          {isDone && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleViewWorld}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Xem phòng 3D ngay</Text>
              <ArrowRight color='#FFFFFF' size={18} strokeWidth={2.5} />
            </TouchableOpacity>
          )}

          {isFailed && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setStarted(false)}>
              <Text style={styles.secondaryBtnText}>Quay lại thiết lập</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F0F2F8',
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 4 : 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  titleBlock: {
    marginBottom: 24,
    marginTop: 8,
  },
  eyebrow: {
    color: '#7065F0',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 2,
    marginBottom: 6,
  },
  mainTitle: {
    color: '#111827',
    fontSize: 36,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -1,
    lineHeight: 42,
    marginBottom: 10,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textInput: {
    color: '#111827',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  // Working state
  workingStage: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 16,
  },
  globeHalo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#7065F0',
  },
  globeContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#7065F0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  workingStatus: {
    color: '#111827',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginTop: 20,
    textAlign: 'center',
  },
  // Error
  errorCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  errorIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    marginLeft: 12,
  },
  errorTitle: {
    color: '#EF4444',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 4,
  },
  errorMsg: {
    color: '#6B7280',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 20,
  },
  // Tip
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderLeftWidth: 3,
    borderLeftColor: '#059669',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tipText: {
    flex: 1,
    marginLeft: 10,
  },
  tipTitle: {
    color: '#065F46',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 4,
  },
  tipBody: {
    color: '#047857',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 20,
  },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 12 : 20,
    paddingTop: 12,
    backgroundColor: '#F0F2F8',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryBtn: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 28,
    backgroundColor: '#7065F0',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#7065F0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: -0.2,
  },
  estimateText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    textAlign: 'center',
    marginTop: 10,
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
})

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(112, 101, 240, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#7065F0',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  trackWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#7065F0',
    borderRadius: 3,
  },
  pctText: {
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    minWidth: 36,
    textAlign: 'right',
  },
  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  step: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  stepActive: {
    backgroundColor: '#7065F0',
    width: 20,
    borderRadius: 4,
  },
})
