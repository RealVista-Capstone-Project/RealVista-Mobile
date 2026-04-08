import { useLocalSearchParams, useRouter } from 'expo-router'
import { Box, Compass, Grid3x3, RotateCcw, X, Zap, ZapOff } from 'lucide-react-native'
import React, { useCallback, useRef, useState } from 'react'
import { Alert, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
  Camera,
  type CameraRuntimeError,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera'

import { Image } from 'expo-image'

import { MIN_RECOMMENDED_COVERAGE, TOTAL_SLOTS, useCaptureStore } from '@/entities/capture'

import { useAutoCapture } from '../model/use-auto-capture'
import { ARTargetsOverlay } from './ar-targets-overlay'
import { CompassCoverage } from './compass-coverage'
import { GuidanceOverlay } from './guidance-overlay'
import { ProgressIndicator } from './progress-indicator'
import { ReviewModal } from './review-modal'
import { Sphere3DCoverage } from './sphere-3d-coverage'

export function MultiViewCaptureScreen() {
  const router = useRouter()
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const cameraRef = useRef<Camera>(null)
  const device = useCameraDevice('back')
  const { hasPermission, requestPermission } = useCameraPermission()

  const { progress, coverageLevel, capturedSlots, images, getOutputPayload, reset } =
    useCaptureStore()

  const guidance = useAutoCapture(cameraRef)

  const [torchOn, setTorchOn] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [gridMode, setGridMode] = useState<'sphere' | 'compass'>('sphere')
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [isReviewVisible, setIsReviewVisible] = useState(false)

  const finishCapture = useCallback(() => {
    router.push({
      pathname: '/world-generation',
      params: propertyId ? { propertyId } : undefined,
    })
  }, [router, propertyId])

  const handleDone = useCallback(() => {
    if (progress < MIN_RECOMMENDED_COVERAGE) {
      setShowWarningModal(true)
      return
    }
    finishCapture()
  }, [progress, finishCapture])

  const handleReset = useCallback(() => {
    Alert.alert('Reset Capture', 'This will discard all captured images. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: reset },
    ])
  }, [reset])

  const onCameraError = useCallback((error: CameraRuntimeError) => {
    console.warn('[Camera] Error:', error.code, error.message)
  }, [])

  // ── Permission / device guards ──────────────────────────────────────────
  if (!hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          RealVista needs camera access to capture property images for 3D reconstruction.
        </Text>
        <Pressable style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </Pressable>
        <Pressable
          style={[styles.permissionButton, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionTitle}>No Camera Available</Text>
        <Text style={styles.permissionText}>Could not find a back camera on this device.</Text>
        <Pressable
          style={[styles.permissionButton, styles.backButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // ── Main screen ─────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* Camera preview */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        torch={torchOn ? 'on' : 'off'}
        onError={onCameraError}
      />

      {/* Camera initializing */}
      {!guidance.isCameraReady && (
        <View style={styles.initOverlay}>
          <Text style={styles.initText}>Initializing camera...</Text>
        </View>
      )}

      {/* Guidance crosshair */}
      <GuidanceOverlay
        message={guidance.message}
        status={guidance.status}
        yaw={guidance.yaw}
        pitch={guidance.pitch}
      />

      {/* AR target reticles — projected onto the viewfinder */}
      <ARTargetsOverlay
        capturedSlots={capturedSlots}
        currentYaw={guidance.yaw}
        currentSlot={guidance.currentSlot}
        status={guidance.status}
      />

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        {/* Close */}
        <Pressable style={styles.topIconBtn} onPress={() => router.back()} hitSlop={12}>
          <X size={20} color='#FFFFFF' strokeWidth={2.5} />
        </Pressable>

        {/* Title + progress */}
        <View style={styles.topCenter}>
          <Text style={styles.topTitle}>3D CAPTURE</Text>
          <ProgressIndicator
            progress={progress}
            imageCount={images.length}
            totalSlots={TOTAL_SLOTS}
            coverageLevel={coverageLevel}
          />
        </View>

        {/* Flash / torch */}
        <Pressable
          style={[styles.topIconBtn, torchOn && styles.topIconBtnActive]}
          onPress={() => setTorchOn((v) => !v)}
          hitSlop={12}
        >
          {torchOn ? (
            <Zap size={20} color='#F59E0B' fill='#F59E0B' strokeWidth={2} />
          ) : (
            <ZapOff size={20} color='rgba(255,255,255,0.6)' strokeWidth={2} />
          )}
        </Pressable>
      </View>

      {/* ── MIDDLE OVERLAY (coverage widget) ───────────────────────────── */}
      <View style={styles.middleArea} pointerEvents='none'>
        {showGrid && (
          <View style={styles.gridArea}>
            {gridMode === 'sphere' ? (
              <Sphere3DCoverage
                capturedSlots={capturedSlots}
                currentYaw={guidance.yaw}
                currentPitch={guidance.pitch}
                currentSlot={guidance.currentSlot}
              />
            ) : (
              <CompassCoverage
                capturedSlots={capturedSlots}
                currentYaw={guidance.yaw}
                currentSlot={guidance.currentSlot}
              />
            )}
          </View>
        )}
      </View>

      {/* ── BOTTOM BAR ──────────────────────────────────────────────────── */}
      <View style={styles.bottomBar}>
        {/* LEFT: thumbnail + reset */}
        <View style={styles.bottomLeft}>
          {images.length > 0 ? (
            <Pressable style={styles.thumbnailBtn} onPress={() => setIsReviewVisible(true)}>
              <Image
                source={{ uri: `file://${images[images.length - 1].path}` }}
                style={styles.thumbnailImg}
                contentFit='cover'
              />
              <View style={styles.thumbnailBadge}>
                <Text style={styles.thumbnailBadgeText}>{images.length}</Text>
              </View>
            </Pressable>
          ) : (
            <View style={styles.thumbnailPlaceholder} />
          )}

          <Pressable style={styles.smallIconBtn} onPress={handleReset} hitSlop={10}>
            <RotateCcw size={16} color='rgba(255,255,255,0.55)' strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* CENTRE: Done button */}
        <Pressable style={styles.doneBtn} onPress={handleDone}>
          <View style={styles.doneBtnInner} />
        </Pressable>

        {/* RIGHT: grid toggle + mode toggle */}
        <View style={styles.bottomRight}>
          <Pressable
            style={[styles.smallIconBtn, showGrid && styles.smallIconBtnOn]}
            onPress={() => setShowGrid((v) => !v)}
            hitSlop={10}
          >
            <Grid3x3
              size={18}
              color={showGrid ? '#FFFFFF' : 'rgba(255,255,255,0.45)'}
              strokeWidth={2}
            />
          </Pressable>

          {showGrid && (
            <Pressable
              style={[styles.smallIconBtn, styles.smallIconBtnOn]}
              onPress={() => setGridMode((m) => (m === 'sphere' ? 'compass' : 'sphere'))}
              hitSlop={10}
            >
              {gridMode === 'sphere' ? (
                <Box size={18} color='#FFFFFF' strokeWidth={2} />
              ) : (
                <Compass size={18} color='#FFFFFF' strokeWidth={2} />
              )}
            </Pressable>
          )}
        </View>
      </View>

      {/* Review modal */}
      <ReviewModal
        isVisible={isReviewVisible}
        onClose={() => setIsReviewVisible(false)}
        images={images}
      />

      {/* Low-coverage warning */}
      <Modal
        visible={showWarningModal}
        transparent
        animationType='fade'
        statusBarTranslucent
        onRequestClose={() => setShowWarningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.warningIconCircle}>
                <Text style={styles.warningIconText}>!</Text>
              </View>
              <Text style={styles.modalTitle}>Độ phủ quá thấp</Text>
            </View>

            <Text style={styles.modalText}>
              Bạn mới chỉ ghi lại được {Math.round(progress * 100)}% góc nhìn ({images.length} ảnh).
              Để tour 3D có chất lượng tốt nhất, chúng tôi khuyên bạn nên đạt độ phủ trên 50% (~30
              ảnh).
            </Text>
            <Text style={[styles.modalText, { fontWeight: '700', color: '#FFFFFF', marginTop: 8 }]}>
              Bạn có muốn tiếp tục chụp thêm không?
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnPrimary}
                activeOpacity={0.8}
                onPress={() => setShowWarningModal(false)}
              >
                <Text style={styles.modalBtnPrimaryText}>Tiếp tục chụp thêm</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalBtnSecondary}
                activeOpacity={0.7}
                onPress={() => {
                  setShowWarningModal(false)
                  finishCapture()
                }}
              >
                <Text style={styles.modalBtnSecondaryText}>Vẫn hoàn tất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // ── Init overlay
  initOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  initText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },

  // ── Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 54,
    paddingBottom: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  topIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topIconBtnActive: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  topTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 2,
  },

  // ── Middle coverage area
  middleArea: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  gridArea: {
    alignItems: 'center',
  },

  // ── Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: 32,
    paddingBottom: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },

  // Left column
  bottomLeft: {
    width: 64,
    alignItems: 'center',
    gap: 10,
  },
  thumbnailBtn: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#7065F0',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  thumbnailBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  thumbnailPlaceholder: {
    width: 52,
    height: 52,
  },
  smallIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallIconBtnOn: {
    backgroundColor: 'rgba(112,101,240,0.18)',
    borderColor: 'rgba(112,101,240,0.35)',
  },

  // Centre — Done button (classic camera shutter style)
  doneBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  doneBtnInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
  },

  // Right column
  bottomRight: {
    width: 64,
    alignItems: 'center',
    gap: 10,
  },

  // ── Permission screens
  permissionContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  permissionText: {
    color: '#94A3B8',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_500Medium',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#7065F0',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 20,
    marginBottom: 14,
    minWidth: 240,
    alignItems: 'center',
    shadowColor: '#7065F0',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  // ── Warning modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 32,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  warningIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(245,158,11,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.2)',
  },
  warningIconText: {
    color: '#F59E0B',
    fontSize: 24,
    fontWeight: '900',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.5,
  },
  modalText: {
    color: '#94A3B8',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 22,
    marginBottom: 10,
  },
  modalActions: {
    gap: 14,
    marginTop: 28,
  },
  modalBtnPrimary: {
    backgroundColor: '#7065F0',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#7065F0',
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  modalBtnSecondary: {
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    color: '#94A3B8',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
})
