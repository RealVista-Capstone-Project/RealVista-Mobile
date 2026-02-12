import type { PropertyWithCoords } from '@/shared/ui/realvista-map-search-view'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import type { Region } from 'react-native-maps'
import { mapSearchApi } from './map-search.api'
import type { MapMarkerItem, MapSearchRequest } from './map-search.types'

// Default HCMC region used as initial bounding box
const DEFAULT_REGION: Region = {
  latitude: 10.78,
  longitude: 106.69,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
}

/** Convert a map Region into bounding box coordinates */
function regionToBounds(region: Region) {
  return {
    north_lat: region.latitude + region.latitudeDelta / 2,
    south_lat: region.latitude - region.latitudeDelta / 2,
    east_lng: region.longitude + region.longitudeDelta / 2,
    west_lng: region.longitude - region.longitudeDelta / 2,
  }
}

/** Map a backend MapMarkerItem to the UI's PropertyWithCoords */
function toPropertyWithCoords(item: MapMarkerItem): PropertyWithCoords {
  return {
    id: item.listingId,
    image: item.thumbnailUrl ?? 'https://via.placeholder.com/400x300',
    title: item.name,
    address: item.streetAddress || item.locationName,
    price: item.price,
    beds: item.bedrooms,
    bathrooms: item.bathrooms,
    area: item.sizeM2,
    areaUnit: 'm²',
    isFavorite: item.isFavorite,
    latitude: item.coordinates.latitude,
    longitude: item.coordinates.longitude,
  }
}

interface UseMapSearchOptions {
  listingType: 'RENT' | 'SALE'
  filters?: Partial<
    Pick<
      MapSearchRequest,
      | 'min_price'
      | 'max_price'
      | 'search_text'
      | 'category'
      | 'bedrooms'
      | 'bathrooms'
      | 'area'
      | 'rental_period'
    >
  >
  limit?: number
  enabled?: boolean
}

/**
 * useMapSearch — fetches map markers from POST /map/listings
 *
 * Returns markers mapped to PropertyWithCoords[], plus
 * an `onRegionChange` callback to pass to `MapView.onRegionChangeComplete`.
 */
export function useMapSearch({
  listingType,
  filters = {},
  limit = 50,
  enabled = true,
}: UseMapSearchOptions) {
  const [region, setRegion] = useState<Region>(DEFAULT_REGION)

  const bounds = regionToBounds(region)

  const queryKey = [
    'map-search',
    listingType,
    bounds.north_lat.toFixed(4),
    bounds.south_lat.toFixed(4),
    bounds.east_lng.toFixed(4),
    bounds.west_lng.toFixed(4),
    filters,
    limit,
  ] as const

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const request: MapSearchRequest = {
        ...bounds,
        listing_type: listingType,
        limit,
        ...filters,
      }
      const res = await mapSearchApi.search(request)
      return res.data
    },
    enabled,
    staleTime: 30 * 1000, // 30s — map data changes infrequently
    gcTime: 5 * 60 * 1000, // 5min cache
    refetchOnReconnect: true,
    refetchOnMount: false,
  })

  const markers: PropertyWithCoords[] = query.data?.content?.map(toPropertyWithCoords) ?? []

  const totalCount = query.data?.totalElements ?? 0

  const onRegionChange = useCallback((newRegion: Region) => {
    setRegion(newRegion)
  }, [])

  return {
    markers,
    totalCount,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    region,
    onRegionChange,
  }
}
