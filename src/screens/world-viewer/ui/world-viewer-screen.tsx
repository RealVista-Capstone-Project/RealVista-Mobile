import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, ExternalLink } from 'lucide-react-native'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import WebView from 'react-native-webview'

import { propertyApi, type PropertyDetailMedia } from '@/entities/property'

import { buildSparkHTML } from './spark-html'

type SplatQuality = '100k' | '500k' | 'full_res'
type SpzUrls = Partial<Record<SplatQuality, string>>

const QUALITY_LABELS: Record<SplatQuality, string> = {
  '100k': 'Nhanh',
  '500k': 'Tiêu Chuẩn',
  full_res: 'Chi Tiết',
}

function extractSpzUrls(media: PropertyDetailMedia): SpzUrls {
  const meta = media.metadata
  if (!meta) return {}
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

// ── Room tab strip ─────────────────────────────────────────────────────────────

type RoomTabsProps = {
  rooms: PropertyDetailMedia[]
  selected: number
  onSelect: (i: number) => void
}

function RoomTabs({ rooms, selected, onSelect }: RoomTabsProps) {
  const scrollRef = useRef<ScrollView>(null)
  const indicatorAnim = useRef(new Animated.Value(0)).current

  return (
    <View style={tabStyles.wrapper}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tabStyles.scroll}
      >
        {rooms.map((room, index) => {
          const name = (room.metadata?.room_name as string) || `Phòng ${index + 1}`
          const isActive = selected === index
          return (
            <TouchableOpacity
              key={room.media_id}
              style={tabStyles.tab}
              onPress={() => onSelect(index)}
              activeOpacity={0.7}
            >
              <Text style={[tabStyles.label, isActive && tabStyles.labelActive]} numberOfLines={1}>
                {name}
              </Text>
              {isActive && <View style={tabStyles.underline} />}
            </TouchableOpacity>
          )
        })}
      </ScrollView>
    </View>
  )
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function WorldViewerScreen() {
  const { propertyId, roomName } = useLocalSearchParams<{ propertyId: string; roomName: string }>()
  const router = useRouter()

  const [allRooms, setAllRooms] = useState<PropertyDetailMedia[]>([])
  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [quality, setQuality] = useState<SplatQuality>('100k')
  const [isWebViewLoading, setIsWebViewLoading] = useState(true)
  const [hasWebViewError, setHasWebViewError] = useState(false)

  useEffect(() => {
    if (!propertyId) {
      setFetchError('Không tìm thấy mã bất động sản.')
      setIsLoadingData(false)
      return
    }

    let cancelled = false
    const fetchData = async () => {
      try {
        const res = await propertyApi.getPropertyDetail(propertyId)
        if (cancelled) return

        const detail = res.data
        const rooms =
          detail?.media?.filter((m: PropertyDetailMedia) => m.media_type === 'THREE_D') ?? []

        if (rooms.length === 0) {
          setFetchError('Chưa có phòng 3D nào cho bất động sản này.')
        }

        setAllRooms(rooms)

        if (roomName && rooms.length > 0) {
          const idx = rooms.findIndex((m: PropertyDetailMedia) => {
            const rName = (m.metadata?.room_name as string) || `Phòng ${0 + 1}`
            return rName === roomName
          })
          setSelectedRoomIndex(idx >= 0 ? idx : 0)
        }
      } catch {
        if (!cancelled) setFetchError('Không thể tải dữ liệu bất động sản.')
      } finally {
        if (!cancelled) setIsLoadingData(false)
      }
    }

    fetchData()
    return () => {
      cancelled = true
    }
  }, [propertyId])

  const threeDMedia = allRooms[selectedRoomIndex] ?? null

  const spzUrls = useMemo(() => {
    if (!threeDMedia) return {} as SpzUrls
    return extractSpzUrls(threeDMedia)
  }, [threeDMedia])

  const availableQualities = useMemo(
    () => (['100k', '500k', 'full_res'] as const).filter((q) => !!spzUrls[q]),
    [spzUrls]
  )

  useEffect(() => {
    if (availableQualities.length > 0 && !spzUrls[quality]) {
      setQuality(availableQualities[0])
    }
  }, [availableQualities, quality, spzUrls])

  useEffect(() => {
    setHasWebViewError(false)
    setIsWebViewLoading(true)
  }, [selectedRoomIndex])

  const currentSpzUrl = spzUrls[quality]

  const html = useMemo(() => {
    if (!currentSpzUrl) return null
    return buildSparkHTML(currentSpzUrl)
  }, [currentSpzUrl])

  const mediaUrl = threeDMedia?.media_url

  const handleOpenExternal = () => {
    if (mediaUrl) Linking.openURL(mediaUrl)
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoadingData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color='#7065F0' size='large' />
        <Text style={styles.loadingText}>Đang tải phòng 3D...</Text>
      </View>
    )
  }

  // ── Error / no data ────────────────────────────────────────────────────────
  if (fetchError || !threeDMedia) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Phòng 3D chưa sẵn sàng</Text>
        <Text style={styles.errorBody}>
          {fetchError || 'Không tìm thấy dữ liệu phòng 3D cho bất động sản này.'}
        </Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </Pressable>
      </View>
    )
  }

  // ── Assets not ready / webview error ──────────────────────────────────────
  if (!currentSpzUrl || hasWebViewError || !html) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          {hasWebViewError ? 'Lỗi tải phòng 3D' : 'Tài nguyên chưa sẵn sàng'}
        </Text>
        <Text style={styles.errorBody}>
          {hasWebViewError
            ? 'Không thể hiển thị phòng 3D. Thử mở liên kết bên dưới.'
            : 'Tài nguyên 3D đang được xử lý. Vui lòng thử lại sau.'}
        </Text>
        {mediaUrl ? (
          <Pressable style={styles.externalBtn} onPress={handleOpenExternal}>
            <ExternalLink color='#FFFFFF' size={18} />
            <Text style={styles.externalBtnText}>Mở liên kết 3D</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </Pressable>
      </View>
    )
  }

  // ── Main viewer ────────────────────────────────────────────────────────────
  const currentRoomName =
    (threeDMedia?.metadata?.room_name as string) || `Phòng ${selectedRoomIndex + 1}`

  return (
    <View style={styles.root}>
      {/* WebView */}
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

      {/* WebView loading overlay */}
      {isWebViewLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color='#7065F0' size='large' />
          <Text style={styles.loadingText}>Đang tải phòng 3D...</Text>
        </View>
      )}

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} activeOpacity={0.8}>
          <ArrowLeft color='#111827' size={22} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.titleMain} numberOfLines={1}>
            {currentRoomName}
          </Text>
          <Text style={styles.titleSub}>Phòng 3D</Text>
        </View>
      </View>

      {/* Room tab strip (only when multiple rooms) */}
      {allRooms.length > 1 && (
        <RoomTabs rooms={allRooms} selected={selectedRoomIndex} onSelect={setSelectedRoomIndex} />
      )}

      {/* Quality selector (only when multiple qualities) */}
      {availableQualities.length > 1 && (
        <View style={styles.qualityBar}>
          {availableQualities.map((q) => (
            <TouchableOpacity
              key={q}
              style={[styles.qualityBtn, quality === q && styles.qualityBtnActive]}
              onPress={() => setQuality(q)}
              activeOpacity={0.8}
            >
              <Text style={[styles.qualityLabel, quality === q && styles.qualityLabelActive]}>
                {QUALITY_LABELS[q]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0F0F14',
  },

  // Center states
  center: {
    flex: 1,
    backgroundColor: '#F0F2F8',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 14,
  },
  errorTitle: {
    color: '#111827',
    fontSize: 20,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorBody: {
    color: '#6B7280',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  backBtn: {
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  backBtnText: {
    color: '#374151',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  externalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7065F0',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    marginBottom: 12,
    shadowColor: '#7065F0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  externalBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },

  // Loading overlay (over webview)
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 15, 20, 0.85)',
  },

  // Top bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleBlock: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  titleMain: {
    color: '#111827',
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
    letterSpacing: -0.2,
  },
  titleSub: {
    color: '#9CA3AF',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 1,
  },
  topActions: {},

  // Quality bar
  qualityBar: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  qualityBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
  },
  qualityBtnActive: {
    backgroundColor: '#7065F0',
  },
  qualityLabel: {
    color: '#6B7280',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  qualityLabelActive: {
    color: '#FFFFFF',
  },
})

// ── Tab strip styles ────────────────────────────────────────────────────────────

const tabStyles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    color: '#9CA3AF',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  labelActive: {
    color: '#7065F0',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#7065F0',
  },
})
