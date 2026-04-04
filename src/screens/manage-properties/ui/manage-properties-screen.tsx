import { useRouter } from 'expo-router'
import { Box, Camera, Globe } from 'lucide-react-native'
import React, { useCallback } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'

import { Image } from 'expo-image'

import {
  useMyProperties,
  useProperty3dOperations,
  type Property3dOperation,
  type PropertySummaryResponse,
} from '@/entities/property'

function PropertyCard({ property }: { property: PropertySummaryResponse }) {
  const router = useRouter()
  const { data: operations } = useProperty3dOperations(property.property_id)

  const thumbnail = property.media?.find((m) => m.is_primary)?.media_url ?? null
  const has3D = property.media?.some((m) => m.media_type === 'THREE_D') ?? false
  const pendingOp = operations?.find((op: Property3dOperation) => op.status === 'PENDING')
  const address = property.street_address || 'No address'
  const locationLabel = [property.location_info?.district_name, property.location_info?.city_name]
    .filter(Boolean)
    .join(', ')

  const handleAdd3D = useCallback(() => {
    router.push({ pathname: '/capture', params: { propertyId: property.property_id } })
  }, [router, property.property_id])

  const handleView3D = useCallback(() => {
    router.push({ pathname: '/world-viewer', params: { propertyId: property.property_id } })
  }, [router, property.property_id])

  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <View style={styles.cardImageContainer}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.cardImage} contentFit='cover' />
        ) : (
          <View style={[styles.cardImage, styles.cardImagePlaceholder]}>
            <Box size={32} color='#4B5563' />
          </View>
        )}

        {/* Status badge */}
        <View
          style={[
            styles.statusBadge,
            property.status === 'AVAILABLE' ? styles.statusAvailable : styles.statusDraft,
          ]}
        >
          <Text style={styles.statusBadgeText}>{property.status}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {address}
        </Text>
        {locationLabel ? (
          <Text style={styles.cardSubtitle} numberOfLines={1}>
            {locationLabel}
          </Text>
        ) : null}

        {property.land_size_m2 != null && (
          <Text style={styles.cardMeta}>{property.land_size_m2} m²</Text>
        )}

        {/* 3D Action Area */}
        <View style={styles.card3DArea}>
          {has3D ? (
            <Pressable style={styles.view3DButton} onPress={handleView3D}>
              <Globe size={16} color='#10B981' />
              <Text style={styles.view3DText}>View 3D Tour</Text>
            </Pressable>
          ) : pendingOp ? (
            <View style={styles.pendingBadge}>
              <ActivityIndicator size='small' color='#F59E0B' />
              <Text style={styles.pendingText}>3D Generating...</Text>
            </View>
          ) : (
            <Pressable style={styles.add3DButton} onPress={handleAdd3D}>
              <Camera size={16} color='#FFFFFF' />
              <Text style={styles.add3DText}>Add 3D Tour</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}

export function ManagePropertiesScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useMyProperties({
    page: 0,
    size: 50,
  })

  const properties = Array.isArray(data?.data) ? data?.data : []

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size='large' color='#7065F0' />
        <Text style={styles.loadingText}>Loading properties...</Text>
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load properties</Text>
        <Pressable style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  if (properties.length === 0) {
    return (
      <View style={styles.center}>
        <Box size={48} color='#9CA3AF' />
        <Text style={styles.emptyTitle}>No Properties</Text>
        <Text style={styles.emptyText}>
          You don&apos;t have any properties yet. Create one on the web dashboard first.
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={properties}
        keyExtractor={(item) => item.property_id}
        renderItem={({ item }) => <PropertyCard property={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor='#7065F0' />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans_500Medium',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#7065F0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  emptyTitle: {
    fontSize: 18,
    color: '#111827',
    fontFamily: 'PlusJakartaSans_700Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContent: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardImageContainer: {
    position: 'relative',
    height: 160,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusAvailable: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  statusDraft: {
    backgroundColor: 'rgba(107, 114, 128, 0.9)',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    color: '#111827',
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'PlusJakartaSans_400Regular',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'PlusJakartaSans_500Medium',
    marginBottom: 12,
  },
  card3DArea: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  add3DButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7065F0',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  add3DText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  view3DButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  view3DText: {
    color: '#10B981',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  pendingText: {
    color: '#F59E0B',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
})
