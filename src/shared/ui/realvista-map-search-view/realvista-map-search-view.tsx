import { formatVND } from '@/shared/lib/format-currency'
import { RealVistaPropertyCard } from '@/shared/ui/realvista-property-listing-card'
import { Text } from '@/shared/ui/text'
import React, { useCallback, useMemo, useRef } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import MapView, { Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

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
  const mapRef = useRef<MapView>(null)
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
              tracksViewChanges={false}
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
 * Price bubble marker for map view.
 * - Single property: shows exact price
 * - Multiple properties: shows price range (min - max)
 */
function PriceMarker({
  minPrice,
  maxPrice,
  count,
}: {
  minPrice: number
  maxPrice: number
  count: number
}) {
  const isSingle = count === 1
  const priceLabel = isSingle
    ? formatVND(minPrice)
    : `${formatVND(minPrice)} - ${formatVND(maxPrice)}`

  return (
    <View style={styles.markerContainer}>
      <View style={[styles.markerBubble, !isSingle && styles.markerBubbleCluster]}>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: isSingle ? 13 : 11,
            color: isSingle ? '#100A55' : '#FFFFFF',
          }}
        >
          {priceLabel}
        </Text>
      </View>
      {/* Count badge for clusters */}
      {!isSingle && (
        <View style={styles.countBadge}>
          <Text
            style={{
              fontFamily: 'PlusJakartaSans_700Bold',
              fontSize: 10,
              color: '#FFFFFF',
            }}
          >
            {count}
          </Text>
        </View>
      )}
      {/* Marker triangle */}
      <View style={[styles.markerTriangle, !isSingle && styles.markerTriangleCluster]} />
    </View>
  )
}

const styles = StyleSheet.create({
  // Map markers
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  markerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -1,
  },
  // Cluster-specific marker styles
  markerBubbleCluster: {
    backgroundColor: '#7065F0',
  },
  markerTriangleCluster: {
    borderTopColor: '#7065F0',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF4D4F',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
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
