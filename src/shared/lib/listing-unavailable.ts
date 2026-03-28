/** Listing cannot be opened (detail / negotiate) but may still be unfavorited. */
export function isListingSoldOrRented(status?: string): boolean {
  const u = status?.toUpperCase() ?? ''
  return u === 'SOLD' || u === 'RENTED'
}

export function isListingSold(status?: string): boolean {
  return status?.toUpperCase() === 'SOLD'
}

export function isListingRented(status?: string): boolean {
  return status?.toUpperCase() === 'RENTED'
}
