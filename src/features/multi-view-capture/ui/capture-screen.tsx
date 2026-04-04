import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useRef, useState } from 'react'
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  Camera,
  type CameraRuntimeError,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera'

import { Image } from 'expo-image'

import { MIN_RECOMMENDED_COVERAGE, TOTAL_SLOTS, useCaptureStore } from '@/entities/capture'

import { useAutoCapture } from '../model/use-auto-capture'
import { GuidanceOverlay } from './guidance-overlay'
import { NextAngleGuide } from './next-angle-guide'
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
  const [showGrid, setShowGrid] = useState(true)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [isReviewVisible, setIsReviewVisible] = useState(false)

  // Remove auto-reset on unmount to preserve data during navigation
  // useEffect(() => {
  //   return () => {
  //     console.log('[Capture] Emptying store on leave...')
  //     reset()
  //   }
  // }, [reset])

  const finishCapture = useCallback(() => {
    const payload = getOutputPayload()
    console.log('[Capture] Complete:', {
      totalImages: payload.images.length,
      coverage: `${Math.round(progress * 100)}%`,
    })
    // Navigate to world generation screen, passing propertyId
    router.push({
      pathname: '/world-generation',
      params: propertyId ? { propertyId } : undefined,
    })
  }, [getOutputPayload, progress, router, propertyId])

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
      {
        text: 'Reset',
        style: 'destructive',
        onPress: reset,
      },
    ])
  }, [reset])

  const { calibrate } = guidance

  const handleCalibrate = useCallback(() => {
    calibrate()
    reset() // Clear grid since orientation reference changed
  }, [calibrate, reset])

  const onCameraError = useCallback((error: CameraRuntimeError) => {
    console.warn('[Camera] Error:', error.code, error.message)
    // Recoverable errors are expected during session init — camera recovers automatically
  }, [])

  // Permission handling
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

  return (
    <View style={styles.container}>
      {/* Camera preview */}
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onError={onCameraError}
      />

      {/* Camera initializing indicator */}
      {!guidance.isCameraReady && (
        <View style={styles.initOverlay}>
          <Text style={styles.initText}>Initializing camera...</Text>
        </View>
      )}

      {/* Guidance overlay (crosshair + message) */}
      <GuidanceOverlay
        message={guidance.message}
        status={guidance.status}
        yaw={guidance.yaw}
        pitch={guidance.pitch}
      />

      {/* Top-right: Progress indicator */}
      <View style={styles.progressArea}>
        <ProgressIndicator
          progress={progress}
          imageCount={images.length}
          totalSlots={TOTAL_SLOTS}
          coverageLevel={coverageLevel}
        />
      </View>

      {/* Bottom area: controls */}
      <View style={styles.bottomArea}>
        {/* Next angle arrow guidance */}
        <View style={styles.guideArea}>
          <NextAngleGuide
            capturedSlots={capturedSlots}
            currentYaw={guidance.yaw}
            currentPitch={guidance.pitch}
          />
        </View>

        {/* Coverage sphere (toggleable) */}
        {showGrid && (
          <View style={styles.gridArea}>
            <Sphere3DCoverage
              capturedSlots={capturedSlots}
              currentYaw={guidance.yaw}
              currentPitch={guidance.pitch}
              currentSlot={guidance.currentSlot}
            />
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.controlsWrapper}>
          {/* Thumbnail Preview */}
          {images.length > 0 && (
            <Pressable style={styles.thumbnailContainer} onPress={() => setIsReviewVisible(true)}>
              <Image
                source={{ uri: `file://${images[images.length - 1].path}` }}
                style={styles.thumbnail}
                contentFit='cover'
              />
              <View style={styles.thumbnailBadge}>
                <Text style={styles.thumbnailBadgeText}>{images.length}</Text>
              </View>
            </Pressable>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.controlsScroll}
            contentContainerStyle={styles.controlsScrollContent}
          >
            <Pressable style={styles.controlButton} onPress={handleReset}>
              <Text style={styles.controlButtonText}>Reset</Text>
            </Pressable>

            <Pressable style={styles.calibrateButton} onPress={handleCalibrate}>
              <Text style={styles.controlButtonText}>Center</Text>
            </Pressable>

            <Pressable style={styles.controlButton} onPress={() => setShowGrid((v) => !v)}>
              <Text style={styles.controlButtonText}>{showGrid ? 'Hide' : 'Grid'}</Text>
            </Pressable>

            <Pressable style={styles.doneButton} onPress={handleDone}>
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>

      <ReviewModal
        isVisible={isReviewVisible}
        onClose={() => setIsReviewVisible(false)}
        images={images}
      />

      {/* Low coverage warning modal */}
      <Modal
        visible={showWarningModal}
        transparent
        animationType='fade'
        onRequestClose={() => setShowWarningModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Low Coverage Warning</Text>
            <Text style={styles.modalText}>
              You have captured only {Math.round(progress * 100)}% of the coverage grid (
              {images.length} images). For best 3D reconstruction results, at least 50% coverage
              (~30 images) is recommended.
            </Text>
            <Text style={styles.modalText}>Do you want to continue capturing?</Text>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalButtonSecondary}
                onPress={() => {
                  setShowWarningModal(false)
                  finishCapture()
                }}
              >
                <Text style={styles.modalButtonSecondaryText}>Finish Anyway</Text>
              </Pressable>
              <Pressable
                style={styles.modalButtonPrimary}
                onPress={() => setShowWarningModal(false)}
              >
                <Text style={styles.modalButtonPrimaryText}>Keep Capturing</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
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
  progressArea: {
    position: 'absolute',
    top: 60,
    right: 16,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
  },
  guideArea: {
    alignItems: 'center',
    marginBottom: 12,
  },
  gridArea: {
    alignItems: 'center',
    marginBottom: 16,
  },
  controlsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  controlsScroll: {
    flex: 1,
  },
  controlsScrollContent: {
    paddingLeft: 84, // Space for the absolute thumbnail
    paddingRight: 24,
    gap: 12,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 70,
    alignItems: 'center',
  },
  calibrateButton: {
    backgroundColor: 'rgba(59,130,246,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 80,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  doneButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 80,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  thumbnailContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'absolute',
    left: 20,
    backgroundColor: '#1F2937',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#10B981',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  thumbnailBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  // Permission screens
  permissionContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  permissionText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 12,
  },
  modalText: {
    color: '#D1D5DB',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButtonSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  modalButtonSecondaryText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  modalButtonPrimary: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
})
