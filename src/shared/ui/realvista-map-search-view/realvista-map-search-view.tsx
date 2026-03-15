import { formatVND } from '@/shared/lib/format-currency'
import { RealVistaPropertyCard } from '@/shared/ui/realvista-property-listing-card'
import { Text } from '@/shared/ui/text'
import React, { useCallback, useMemo, useRef } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

// Lazy-load react-native-maps only on native platforms (not supported on web)
let MapView: typeof import('react-native-maps').default | undefined
let Marker: typeof import('react-native-maps').Marker | undefined
let PROVIDER_GOOGLE: typeof import('react-native-maps').PROVIDER_GOOGLE | undefined
type Region = import('react-native-maps').Region

if (Platform.OS !== 'web') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const maps = require('react-native-maps')
  MapView = maps.default
  Marker = maps.Marker
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE
}

// Default map region (Ho Chi Minh City area)
const HCMC_REGION = {
  latitude: 10.78,
  longitude: 106.69,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const COLLAPSED_HEIGHT = 100 // Height when collapsed (just the bar)
const EXPANDED_HEIGHT = SCREEN_HEIGHT * 0.55 // Height when expanded (55% of screen)

const SPRING_CONFIG = { damping: 20, stiffness: 300, mass: 0.5 }

// Threshold for clustering nearby markers (in degrees, ~50m)
const CLUSTER_THRESHOLD = 0.0005

export type PropertyWithCoords = {
  id: string
  image: string
  title: string
  address: string
  price: number
  beds: number
  bathrooms: number
  area: number
  areaUnit?: string
  isPopular?: boolean
  isFavorite?: boolean
  latitude: number
  longitude: number
}

/** A cluster of one or more properties at similar coordinates */
type PropertyCluster = {
  id: string
  latitude: number
  longitude: number
  count: number
  minPrice: number
  maxPrice: number
  properties: PropertyWithCoords[]
}

/** Group properties into clusters based on coordinate proximity */
function clusterProperties(properties: PropertyWithCoords[]): PropertyCluster[] {
  const clusters: PropertyCluster[] = []

  for (const property of properties) {
    let addedToCluster = false

    for (const cluster of clusters) {
      const latDiff = Math.abs(property.latitude - cluster.latitude)
      const lngDiff = Math.abs(property.longitude - cluster.longitude)

      if (latDiff < CLUSTER_THRESHOLD && lngDiff < CLUSTER_THRESHOLD) {
        cluster.properties.push(property)
        cluster.count++
        cluster.minPrice = Math.min(cluster.minPrice, property.price)
        cluster.maxPrice = Math.max(cluster.maxPrice, property.price)
        // Update center to average
        cluster.latitude =
          cluster.properties.reduce((sum, p) => sum + p.latitude, 0) / cluster.count
        cluster.longitude =
          cluster.properties.reduce((sum, p) => sum + p.longitude, 0) / cluster.count
        addedToCluster = true
        break
      }
    }

    if (!addedToCluster) {
      clusters.push({
        id: property.id,
        latitude: property.latitude,
        longitude: property.longitude,
        count: 1,
        minPrice: property.price,
        maxPrice: property.price,
        properties: [property],
      })
    }
  }

  return clusters
}

interface RealVistaMapSearchViewProps {
  properties: PropertyWithCoords[]
  propertyCountLabel?: string
  totalCount?: number
  isLoading?: boolean
  onRegionChange?: (region: Region) => void
  onPropertyPress?: (propertyId: string) => void
  variant?: 'rent' | 'buy'
}

export function RealVistaMapSearchView({
  properties,
  propertyCountLabel,
  totalCount,
  isLoading = false,
  onRegionChange,
  onPropertyPress,
  variant = 'rent',
}: RealVistaMapSearchViewProps) {
  const mapRef = useRef<InstanceType<NonNullable<typeof MapView>>>(null)
  const panelTranslateY = useSharedValue(0) // 0 = collapsed, negative = expanded
  const context = useSharedValue({ y: 0 })
  const isExpanded = useSharedValue(false)

  const displayCount = totalCount ?? properties.length
  const displayLabel = propertyCountLabel ?? `${displayCount} bất động sản`

  const maxTranslateY = -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT)

  // Cluster nearby properties for map markers
  const clusters = useMemo(() => clusterProperties(properties), [properties])

  const togglePanel = useCallback(() => {
    'worklet'
    if (isExpanded.value) {
      panelTranslateY.value = withSpring(0, SPRING_CONFIG)
      isExpanded.value = false
    } else {
      panelTranslateY.value = withSpring(maxTranslateY, SPRING_CONFIG)
      isExpanded.value = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxTranslateY])

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: panelTranslateY.value }
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY
      // Clamp between maxTranslateY and 0
      panelTranslateY.value = Math.max(maxTranslateY, Math.min(0, newY))
    })
    .onEnd((event) => {
      const velocity = event.velocityY
      // If swiping up fast or past halfway, expand
      if (velocity < -500 || panelTranslateY.value < maxTranslateY / 2) {
        panelTranslateY.value = withSpring(maxTranslateY, SPRING_CONFIG)
        isExpanded.value = true
      } else {
        panelTranslateY.value = withSpring(0, SPRING_CONFIG)
        isExpanded.value = false
      }
    })

  const animatedPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelTranslateY.value }],
  }))

  const renderPropertyItem = useCallback(
    ({ item }: { item: PropertyWithCoords }) => (
      <View style={styles.cardWrapper}>
        <RealVistaPropertyCard
          property={{
            id: item.id,
            image: item.image,
            title: item.title,
            address: item.address,
            price: item.price,
            beds: item.beds,
            bathrooms: item.bathrooms,
            area: item.area,
            areaUnit: item.areaUnit,
            isPopular: item.isPopular,
            isFavorite: item.isFavorite,
          }}
          onClick={onPropertyPress}
          variant={variant}
          layout='horizontal'
        />
      </View>
    ),
    [onPropertyPress, variant]
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {MapView && Marker ? (
          <MapView
            ref={mapRef}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={{ flex: 1 }}
            initialRegion={HCMC_REGION}
            showsUserLocation
            showsMyLocationButton={false}
            onRegionChangeComplete={onRegionChange}
          >
            {clusters.map((cluster) => (
              <Marker
                key={cluster.id}
                coordinate={{
                  latitude: cluster.latitude,
                  longitude: cluster.longitude,
                }}
                tracksViewChanges
                onPress={() => {
                  if (cluster.count === 1) {
                    onPropertyPress?.(cluster.properties[0].id)
                  }
                }}
              >
                <PriceMarker
                  minPrice={cluster.minPrice}
                  maxPrice={cluster.maxPrice}
                  count={cluster.count}
                />
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Map is not supported on web</Text>
          </View>
        )}

        {/* Loading indicator — centered, non-blocking */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBadge}>
              <ActivityIndicator size='small' color='#7065F0' />
              <Text
                style={{
                  fontFamily: 'PlusJakartaSans_500Medium',
                  fontSize: 13,
                  color: '#100A55',
                  marginLeft: 8,
                }}
              >
                Đang tải...
              </Text>
            </View>
          </View>
        )}

        {/* Draggable Bottom Panel */}
        <Animated.View
          style={[styles.bottomPanel, { height: EXPANDED_HEIGHT }, animatedPanelStyle]}
        >
          {/* Handle + summary bar — only this part is draggable */}
          <GestureDetector gesture={panGesture}>
            <Animated.View>
              <TouchableOpacity activeOpacity={0.9} onPress={togglePanel}>
                <View style={styles.handleBar}>
                  <View style={styles.handleIndicator} />
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_700Bold',
                      fontSize: 16,
                      color: '#100A55',
                      textAlign: 'center',
                    }}
                  >
                    {displayLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </GestureDetector>

          {/* Property list — scrollable independently */}
          <FlatList
            data={properties}
            renderItem={renderPropertyItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
            style={{ flex: 1 }}
            ListEmptyComponent={
              !isLoading ? (
                <View style={styles.emptyContainer}>
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_500Medium',
                      fontSize: 14,
                      color: '#6C727F',
                      textAlign: 'center',
                    }}
                  >
                    Không tìm thấy bất động sản trong khu vực này
                  </Text>
                </View>
              ) : null
            }
          />
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  )
}

/**
 * Price marker for map view — matches web PropertyMapMarker design.
 * - Single property: shows exact price (white bg, dark text)
 * - Cluster: shows price range (primary bg, white text)
 * - Selected: primary bg with white text
 */
function PriceMarker({
  minPrice,
  maxPrice,
  count,
  isSelected = false,
}: {
  minPrice: number
  maxPrice: number
  count: number
  isSelected?: boolean
}) {
  const isSingle = count === 1
  const isActive = isSelected
  const priceLabel = isSingle
    ? formatVND(minPrice)
    : `${formatVND(minPrice)} - ${formatVND(maxPrice)}`

  return (
    <View style={styles.markerContainer} collapsable={false}>
      <View
        style={[
          styles.markerBubble,
          isActive && styles.markerBubbleActive,
          !isSingle && styles.markerBubbleCluster,
        ]}
      >
        <RNText
          numberOfLines={1}
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 14,
            lineHeight: 18,
            color: isActive || !isSingle ? '#FFFFFF' : '#000929',
          }}
        >
          {priceLabel}
        </RNText>
      </View>
      {/* Count badge for clusters */}
      {!isSingle && (
        <View style={styles.countBadge}>
          <RNText
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 10,
              color: '#FFFFFF',
            }}
          >
            {count}
          </RNText>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    overflow: 'visible',
    padding: 8, // Add enough space for the absolute badge to stay within Marker bounds
  },
  // Stripped to minimum to isolate the clipping cause.
  // Web equivalent: rounded-lg bg-white px-3 py-1.5
  markerBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  // Selected / hovered state
  markerBubbleActive: {
    backgroundColor: '#7065F0',
    borderColor: '#7065F0',
  },
  // Cluster-specific marker styles
  markerBubbleCluster: {
    backgroundColor: '#7065F0',
    borderColor: '#7065F0',
  },
  countBadge: {
    position: 'absolute',
    top: 2, // Account for 8px padding (8 - 6)
    right: 2, // Account for 8px padding (8 - 6)
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loadingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },

  // Bottom panel
  bottomPanel: {
    position: 'absolute',
    bottom: -(EXPANDED_HEIGHT - COLLAPSED_HEIGHT),
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handleIndicator: {
    width: 56,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
  },
  summaryRow: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },

  // List items
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
})
