import { Image } from 'expo-image'
import * as MediaLibrary from 'expo-media-library'
import { Download, X, ZoomIn } from 'lucide-react-native'
import React, { useCallback, useState } from 'react'
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { type CapturedImage } from '@/entities/capture'

type ReviewModalProps = {
  isVisible: boolean
  onClose: () => void
  images: CapturedImage[]
}

const { width, height } = Dimensions.get('window')
const COLUMN_WIDTH = (width - 48) / 3

function DownloadButton({ path }: { path: string }) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleDownload = useCallback(async () => {
    if (saving || saved) return
    setSaving(true)
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Vui lòng cho phép truy cập thư viện ảnh để lưu ảnh.')
        return
      }
      await MediaLibrary.saveToLibraryAsync(path)
      setSaved(true)
    } catch {
      Alert.alert('Lưu thất bại', 'Không thể lưu ảnh vào thư viện của bạn.')
    } finally {
      setSaving(false)
    }
  }, [path, saving, saved])

  return (
    <Pressable
      style={[styles.downloadBtn, saved && styles.downloadBtnSaved]}
      onPress={handleDownload}
      hitSlop={6}
    >
      <Download size={12} color={saved ? '#10B981' : '#FFFFFF'} strokeWidth={2.5} />
    </Pressable>
  )
}

function ImagePreviewModal({
  image,
  onClose,
}: {
  image: CapturedImage | null
  onClose: () => void
}) {
  if (!image) return null
  return (
    <Modal visible animationType='fade' transparent onRequestClose={onClose}>
      <View style={styles.previewOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Image
          source={{ uri: `file://${image.path}` }}
          style={styles.previewImage}
          contentFit='contain'
        />
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>
            {Math.round(image.yaw)}° / {Math.round(image.pitch)}°
          </Text>
        </View>
        <Pressable style={styles.previewClose} onPress={onClose}>
          <X color='#FFFFFF' size={20} />
        </Pressable>
      </View>
    </Modal>
  )
}

export function ReviewModal({ isVisible, onClose, images }: ReviewModalProps) {
  const [previewImage, setPreviewImage] = useState<CapturedImage | null>(null)

  const renderItem = ({ item }: { item: CapturedImage }) => (
    <Pressable
      style={styles.imageContainer}
      onPress={() => setPreviewImage(item)}
      android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
    >
      <Image source={{ uri: `file://${item.path}` }} style={styles.image} contentFit='cover' />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {Math.round(item.yaw)}° / {Math.round(item.pitch)}°
        </Text>
      </View>
      <View style={styles.zoomHint}>
        <ZoomIn size={10} color='rgba(255,255,255,0.8)' strokeWidth={2.5} />
      </View>
      <DownloadButton path={item.path} />
    </Pressable>
  )

  return (
    <>
      <Modal visible={isVisible} animationType='slide' transparent={false} onRequestClose={onClose}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Xem lại ảnh</Text>
              <Text style={styles.subtitle}>{images.length} ảnh đã chụp</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color='#FFFFFF' size={24} />
            </Pressable>
          </View>

          <FlatList
            data={images}
            renderItem={renderItem}
            keyExtractor={(item) => item.path}
            numColumns={3}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có ảnh nào được chụp.</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>

      <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 12,
  },
  imageContainer: {
    width: COLUMN_WIDTH,
    height: COLUMN_WIDTH,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  zoomHint: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBtn: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBtnSaved: {
    backgroundColor: 'rgba(16,185,129,0.2)',
  },
  emptyContainer: {
    flex: 1,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  // Full-screen preview
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: width,
    height: height * 0.75,
  },
  previewBadge: {
    position: 'absolute',
    bottom: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  previewClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
})
