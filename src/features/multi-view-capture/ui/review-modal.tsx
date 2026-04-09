import { Image } from 'expo-image'
import * as MediaLibrary from 'expo-media-library'
import { Download, X } from 'lucide-react-native'
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

const { width } = Dimensions.get('window')
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
        Alert.alert(
          'Permission required',
          'Please allow access to your photo library to save images.'
        )
        return
      }
      await MediaLibrary.saveToLibraryAsync(path)
      setSaved(true)
    } catch (err) {
      Alert.alert('Save failed', 'Could not save the image to your photo library.')
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

export function ReviewModal({ isVisible, onClose, images }: ReviewModalProps) {
  const renderItem = ({ item }: { item: CapturedImage }) => (
    <View style={styles.imageContainer}>
      <Image source={{ uri: `file://${item.path}` }} style={styles.image} contentFit='cover' />
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {Math.round(item.yaw)}° / {Math.round(item.pitch)}°
        </Text>
      </View>
      <DownloadButton path={item.path} />
    </View>
  )

  return (
    <Modal visible={isVisible} animationType='slide' transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Review Photos</Text>
            <Text style={styles.subtitle}>{images.length} images captured</Text>
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
              <Text style={styles.emptyText}>No photos captured yet.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
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
    fontFamily: 'PlusJakartaSans_400Regular',
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
    fontFamily: 'PlusJakartaSans_600SemiBold',
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
})
