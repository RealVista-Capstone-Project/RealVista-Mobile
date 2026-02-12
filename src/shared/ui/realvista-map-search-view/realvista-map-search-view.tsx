import { formatVND } from '@/shared/lib/format-currency'
import type { RealVistaPropertyCardData } from '@/shared/ui/realvista-property-listing-card'
import { Text } from '@/shared/ui/text'
import React, { useRef } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'

// Default map region (Ho Chi Minh City area)
const HCMC_REGION = {
  latitude: 10.78,
  longitude: 106.69,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

export type PropertyWithCoords = RealVistaPropertyCardData & {
  latitude: number
  longitude: number
}

interface RealVistaMapSearchViewProps {
  properties: PropertyWithCoords[]
  propertyCountLabel?: string
}

export function RealVistaMapSearchView({
  properties,
  propertyCountLabel,
}: RealVistaMapSearchViewProps) {
  const mapRef = useRef<MapView>(null)

  return (
    <View className='flex-1'>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={{ flex: 1 }}
        initialRegion={HCMC_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {properties.map((property) => (
          <Marker
            key={property.id}
            coordinate={{
              latitude: property.latitude,
              longitude: property.longitude,
            }}
            tracksViewChanges={false}
          >
            <PriceMarker price={property.price} />
          </Marker>
        ))}
      </MapView>

      {/* Bottom Bar — property count */}
      <View
        className='absolute bottom-0 left-0 right-0 items-center rounded-t-2xl bg-white px-6 pb-8 pt-4'
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.07,
          shadowRadius: 15,
          elevation: 8,
        }}
      >
        {/* Handle indicator */}
        <View className='mb-3 h-[5px] w-14 rounded-full bg-grey-200' />
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 16,
            color: '#100A55',
            textAlign: 'center',
          }}
        >
          {propertyCountLabel ?? `${properties.length} bất động sản`}
        </Text>
      </View>
    </View>
  )
}

// Price bubble marker for map view
function PriceMarker({ price }: { price: number }) {
  return (
    <View style={styles.markerContainer}>
      <View style={styles.markerBubble}>
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_700Bold',
            fontSize: 13,
            color: '#100A55',
          }}
        >
          {formatVND(price)}
        </Text>
      </View>
      {/* Marker triangle */}
      <View style={styles.markerTriangle} />
    </View>
  )
}

const styles = StyleSheet.create({
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
})
