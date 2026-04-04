import { useLocalSearchParams, useRouter } from 'expo-router'
import { ExternalLink, Share2 } from 'lucide-react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Linking, Pressable, Share, StyleSheet, Text, View } from 'react-native'
import WebView from 'react-native-webview'

import { propertyApi, type PropertyDetailMedia } from '@/entities/property'

import { buildSparkHTML } from './spark-html'

type SplatQuality = '100k' | '500k' | 'full_res'

type SpzUrls = Partial<Record<SplatQuality, string>>

/** Extract spz_urls from a THREE_D media item's metadata */
function extractSpzUrls(media: PropertyDetailMedia): SpzUrls {
  const meta = media.metadata
  if (!meta) return {}

  // metadata.marble_assets.splats.spz_urls
  const assets = meta.marble_assets as Record<string, unknown> | undefined
  if (!assets) return {}

  const splats = assets.splats as Record<string, unknown> | undefined
  if (!splats) return {}

  const urls = splats.spz_urls as Record<string, string> | undefined
  if (!urls) return {}

  const result: SpzUrls = {}
  if (urls['100k']) result['100k'] = urls['100k']
  if (urls['500k']) result['500k'] = urls['500k']
  if (urls.full_res) result.full_res = urls.full_res

  return result
}

export function WorldViewerScreen() {
  const { propertyId } = useLocalSearchParams<{ propertyId: string }>()
  const router = useRouter()

  const [threeDMedia, setThreeDMedia] = useState<PropertyDetailMedia | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [quality, setQuality] = useState<SplatQuality>('100k')
  const [isWebViewLoading, setIsWebViewLoading] = useState(true)
  const [hasWebViewError, setHasWebViewError] = useState(false)

  useEffect(() => {
    if (!propertyId) {
      setFetchError('No property ID provided')
      setIsLoadingData(false)
      return
    }

    let cancelled = false
    const fetchData = async () => {
      try {
        const res = await propertyApi.getPropertyDetail(propertyId)
        if (cancelled) return

        const detail = res.data
        const media3d = detail?.media?.find((m) => m.media_type === 'THREE_D') ?? null

        if (!media3d) {
          setFetchError('No 3D tour found for this property.')
        }
        setThreeDMedia(media3d)
      } catch {
        if (!cancelled) {
          setFetchError('Failed to load property data.')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingData(false)
        }
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [propertyId])

  const spzUrls = useMemo(() => {
    if (!threeDMedia) return {} as SpzUrls
    return extractSpzUrls(threeDMedia)
  }, [threeDMedia])

  const availableQualities = useMemo(() => {
    return (['100k', '500k', 'full_res'] as const).filter((q) => !!spzUrls[q])
  }, [spzUrls])

  // Auto-select best available quality
  useEffect(() => {
    if (availableQualities.length > 0 && !spzUrls[quality]) {
      setQuality(availableQualities[0])
    }
  }, [availableQualities, quality, spzUrls])

  const currentSpzUrl = spzUrls[quality]

  const html = useMemo(() => {
    if (!currentSpzUrl) return null
    return buildSparkHTML(currentSpzUrl)
  }, [currentSpzUrl])

  const thumbnailUrl = threeDMedia?.thumbnail_url
  const mediaUrl = threeDMedia?.media_url

  const handleShare = async () => {
    if (!mediaUrl) return
    try {
      await Share.share({
        message: `Check out this 3D tour: ${mediaUrl}`,
        url: mediaUrl,
      })
    } catch {
      // User cancelled
    }
  }

  const handleOpenExternal = () => {
    if (mediaUrl) {
      Linking.openURL(mediaUrl)
    }
  }

  // Loading state
  if (isLoadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color='#3B82F6' size='large' />
        <Text style={styles.loadingText}>Loading 3D Tour...</Text>
      </View>
    )
  }

  // Error / no 3D data
  if (fetchError || !threeDMedia) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>3D Tour Not Available</Text>
        <Text style={styles.errorText}>
          {fetchError || 'No 3D tour data found for this property.'}
        </Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // No SPZ URLs in metadata (e.g., still processing or media_url is the fallback)
  if (!currentSpzUrl || hasWebViewError || !html) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>
          {hasWebViewError ? '3D Viewer Error' : 'Assets Not Ready'}
        </Text>
        <Text style={styles.errorText}>
          {hasWebViewError
            ? 'Could not load the 3D world. Try opening the link below.'
            : 'The 3D splat assets are not yet available. The media URL might still work externally.'}
        </Text>
        {mediaUrl ? (
          <Pressable style={styles.externalButton} onPress={handleOpenExternal}>
            <ExternalLink color='#FFFFFF' size={18} />
            <Text style={styles.externalButtonText}>Open 3D Link</Text>
          </Pressable>
        ) : null}
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
        onLoadStart={() => setIsWebViewLoading(true)}
        onLoadEnd={() => setIsWebViewLoading(false)}
        onError={() => setHasWebViewError(true)}
        originWhitelist={['*']}
      />

      {/* Loading overlay */}
      {isWebViewLoading && (
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
          3D Tour
        </Text>

        <View style={styles.headerActions}>
          <Pressable onPress={handleShare} style={styles.headerButton}>
            <Share2 color='#FFFFFF' size={20} />
          </Pressable>
          {mediaUrl ? (
            <Pressable onPress={handleOpenExternal} style={styles.headerButton}>
              <ExternalLink color='#FFFFFF' size={20} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Quality selector (only when multiple qualities available) */}
      {availableQualities.length > 1 && (
        <View style={styles.qualityBar}>
          {availableQualities.map((q) => (
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
      )}
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
  // Shared states
  centerContainer: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
