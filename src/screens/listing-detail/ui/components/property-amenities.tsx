import type { Amenity } from '@/entities/listing'
import { Box } from '@/shared/ui/box'
import { Text } from '@/shared/ui/text'

interface PropertyAmenitiesProps {
  amenities: Amenity[]
}

/**
 * Amenity pill/tag component
 */
const AmenityPill = ({ name }: { name: string }) => (
  <Box className='mr-2 mb-2 rounded-full bg-purple-98 px-4 py-2'>
    <Text className='text-main-black' size='sm'>
      {name}
    </Text>
  </Box>
)

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  // Separate amenities by type
  const onSiteAmenities = amenities.filter((a) => a.is_onsite)
  const nearByAmenities = amenities.filter((a) => a.is_offsite)

  if (amenities.length === 0) {
    return null
  }

  return (
    <Box className='mb-6'>
      {/* Section Title */}
      <Text className='mb-4 text-main-black' size='lg' bold>
        Tiện nghi bất động sản
      </Text>

      {/* On-site amenities */}
      {onSiteAmenities.length > 0 && (
        <Box className='mb-4'>
          <Text className='mb-2 text-grey-500' size='sm'>
            Trong căn hộ
          </Text>
          <Box className='flex-row flex-wrap'>
            {onSiteAmenities.map((amenity) => (
              <AmenityPill key={amenity.amenity_id} name={amenity.amenity_name} />
            ))}
          </Box>
        </Box>
      )}

      {/* Nearby amenities */}
      {nearByAmenities.length > 0 && (
        <Box>
          <Text className='mb-2 text-grey-500' size='sm'>
            Gần đây
          </Text>
          <Box className='flex-row flex-wrap'>
            {nearByAmenities.map((amenity) => (
              <AmenityPill key={amenity.amenity_id} name={amenity.amenity_name} />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}
