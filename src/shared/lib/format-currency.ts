/**
 * Format Vietnamese Dong (VND) prices for display
 *
 * @param price - The price in VND
 * @returns Formatted string with triệu/tỷ suffix, or placeholder for invalid values
 *
 * Examples:
 * - 2000000000 → "2 tỷ"
 * - 20000000 → "20 triệu"
 * - 2500000000 → "2.5 tỷ"
 * - 15500000 → "15.5 triệu"
 * - null → "Liên hệ"
 * - undefined → "Liên hệ"
 * - NaN → "Liên hệ"
 * - negative → "Liên hệ"
 */
export const formatVND = (price: number | null | undefined): string => {
  // Handle null, undefined, or non-numeric values
  if (price === null || price === undefined || Number.isNaN(price)) {
    return 'Liên hệ'
  }

  // Handle negative prices (data error)
  if (price < 0) {
    return 'Liên hệ'
  }

  // Handle infinity
  if (!Number.isFinite(price)) {
    return 'Liên hệ'
  }

  // Valid price - format it
  if (price >= 1000000000) {
    // Format as tỷ (billion)
    const billionValue = price / 1000000000
    return billionValue % 1 === 0 ? `${billionValue} tỷ` : `${billionValue.toFixed(2)} tỷ`
  } else if (price >= 1000000) {
    // Format as triệu (million)
    const millionValue = price / 1000000
    return millionValue % 1 === 0 ? `${millionValue} triệu` : `${millionValue.toFixed(2)} triệu`
  } else {
    // Less than 1 million, show full number with Vietnamese formatting
    return price.toLocaleString('vi-VN')
  }
}
