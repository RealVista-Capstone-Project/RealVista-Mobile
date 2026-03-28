import { PROPERTY_TYPES } from '@/shared/config/property-types'

type ResolveCategoryInput = {
  title?: string
  propertyTypeCode?: string
  propertyCategoryCode?: string
}

const TYPE_CODE_TO_LABEL = new Map(
  PROPERTY_TYPES.flatMap((category) =>
    category.types.map((type) => [type.code, type.label] as const)
  )
)

const CATEGORY_CODE_TO_LABEL = new Map(
  PROPERTY_TYPES.map((category) => [category.code, category.label] as const)
)

const TITLE_KEYWORDS: { keywords: string[]; label: string }[] = [
  { keywords: ['can ho', 'căn hộ', 'chung cu', 'chung cư', 'apartment'], label: 'Căn hộ chung cư' },
  { keywords: ['nha rieng', 'nhà riêng', 'house'], label: 'Nhà riêng' },
  { keywords: ['biet thu', 'biệt thự', 'villa'], label: 'Biệt thự' },
  { keywords: ['nha pho', 'nhà phố', 'townhouse'], label: 'Nhà phố' },
  { keywords: ['penthouse'], label: 'Penthouse' },
  { keywords: ['studio'], label: 'Studio' },
  { keywords: ['van phong', 'văn phòng', 'office'], label: 'Văn phòng' },
  { keywords: ['shophouse', 'shop house'], label: 'Shophouse' },
  { keywords: ['ban le', 'bán lẻ', 'retail'], label: 'Cửa hàng bán lẻ' },
  {
    keywords: ['trung tam thuong mai', 'trung tâm thương mại', 'mall'],
    label: 'Trung tâm thương mại',
  },
  { keywords: ['nha hang', 'nhà hàng', 'restaurant'], label: 'Nhà hàng' },
  { keywords: ['khach san', 'khách sạn', 'hotel'], label: 'Khách sạn' },
  { keywords: ['kho bai', 'kho bãi', 'warehouse'], label: 'Kho bãi' },
  { keywords: ['nha may', 'nhà máy', 'factory'], label: 'Nhà xưởng' },
  { keywords: ['xuong', 'xưởng', 'workshop'], label: 'Xưởng sản xuất nhỏ' },
  { keywords: ['logistics'], label: 'Kho vận Logistics' },
  { keywords: ['dat tho cu', 'đất thổ cư', 'land_residential'], label: 'Đất thổ cư' },
  {
    keywords: ['dat thuong mai', 'đất thương mại', 'land_commercial'],
    label: 'Đất thương mại dịch vụ',
  },
  { keywords: ['dat cong nghiep', 'đất công nghiệp', 'land_industrial'], label: 'Đất công nghiệp' },
  {
    keywords: ['dat nong nghiep', 'đất nông nghiệp', 'land_agricultural'],
    label: 'Đất nông nghiệp',
  },
]

export function resolveListingCategoryLabel({
  title,
  propertyTypeCode,
  propertyCategoryCode,
}: ResolveCategoryInput): string {
  if (propertyTypeCode) {
    const typeLabel = TYPE_CODE_TO_LABEL.get(propertyTypeCode.toUpperCase())
    if (typeLabel) return typeLabel
  }

  if (propertyCategoryCode) {
    const categoryLabel = CATEGORY_CODE_TO_LABEL.get(propertyCategoryCode.toUpperCase())
    if (categoryLabel) return categoryLabel
  }

  const normalizedTitle = (title || '').toLowerCase()
  for (const entry of TITLE_KEYWORDS) {
    if (entry.keywords.some((keyword) => normalizedTitle.includes(keyword))) {
      return entry.label
    }
  }

  return 'Bất động sản'
}
