import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ExternalLink, Share2 } from 'lucide-react-native'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import WebView from 'react-native-webview'

import { useWorldStore } from '@/entities/world'

import { buildSparkHTML } from './spark-html'

type SplatQuality = '100k' | '500k' | 'full_res'

export function WorldViewerScreen() {
  const { worldId } = useLocalSearchParams<{ worldId: string }>()
  const router = useRouter()
  const world = useWorldStore((s) => s.getWorldById(worldId ?? ''))
  const [quality, setQuality] = useState<SplatQuality>('100k')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const spzUrl = world?.spzUrls?.[quality]

  const html = useMemo(() => {
    if (!spzUrl) return null
    return buildSparkHTML(spzUrl)
  }, [spzUrl])

  const handleShare = async () => {
    if (!world?.marbleUrl) return
    try {
      await Share.share({
        message: `Check out this 3D world: ${world.marbleUrl}`,
        url: world.marbleUrl,
      })
    } catch {
      // User cancelled
    }
  }

  const handleOpenInMarble = () => {
    if (world?.marbleUrl) {
      Linking.openURL(world.marbleUrl)
    }
  }

  if (!world) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>World Not Found</Text>
        <Text style={styles.errorText}>This world may have been deleted or is not available.</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // Fallback: if no SPZ URL yet, show thumbnail
  if (!spzUrl || hasError || !html) {
    return (
      <View style={styles.errorContainer}>
        {world.thumbnailUrl && (
          <Image source={{ uri: world.thumbnailUrl }} style={styles.thumbnail} contentFit='cover' />
        )}
        <Text style={styles.errorTitle}>{hasError ? '3D Viewer Error' : 'Assets Not Ready'}</Text>
        <Text style={styles.errorText}>
          {hasError
            ? 'Could not load the 3D world. Try opening in Marble instead.'
            : 'The 3D assets are not yet available.'}
        </Text>
        {world.marbleUrl && (
          <Pressable style={styles.externalButton} onPress={handleOpenInMarble}>
            <ExternalLink color='#FFFFFF' size={18} />
            <Text style={styles.externalButtonText}>Open in Marble</Text>
          </Pressable>
        )}
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* WebView with SparkJS */}
      <WebView
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        originWhitelist={['*']}
      />

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color='#3B82F6' size='large' />
          <Text style={styles.loadingText}>Loading 3D World...</Text>
        </View>
      )}

      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>← Back</Text>
        </Pressable>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {world.displayName}
        </Text>

        <View style={styles.headerActions}>
          <Pressable onPress={handleShare} style={styles.headerButton}>
            <Share2 color='#FFFFFF' size={20} />
          </Pressable>
          <Pressable onPress={handleOpenInMarble} style={styles.headerButton}>
            <ExternalLink color='#FFFFFF' size={20} />
          </Pressable>
        </View>
      </View>

      {/* Quality selector */}
      <View style={styles.qualityBar}>
        {(['100k', '500k', 'full_res'] as const).map((q) => (
          <Pressable
            key={q}
            style={[styles.qualityButton, quality === q && styles.qualityButtonActive]}
            onPress={() => setQuality(q)}
          >
            <Text style={[styles.qualityText, quality === q && styles.qualityTextActive]}>
              {q === 'full_res' ? 'Full' : q}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  webview: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.8)',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 12,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: 'rgba(17, 24, 39, 0.7)',
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 4,
  },
  qualityBar: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderRadius: 20,
    padding: 4,
  },
  qualityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  qualityButtonActive: {
    backgroundColor: '#3B82F6',
  },
  qualityText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  qualityTextActive: {
    color: '#FFFFFF',
  },
  // Error/fallback states
  errorContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  thumbnail: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 24,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  externalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  externalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_500Medium',
  },
})
