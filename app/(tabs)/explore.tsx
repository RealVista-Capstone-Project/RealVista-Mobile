import { BuyPage } from '@/screens/buy/ui/buy-page'
import { RentPage } from '@/screens/rent/ui/rent-page'
import { useLocalSearchParams } from 'expo-router'

export default function ExploreTabScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>()

  if (mode === 'rent') {
    return <RentPage />
  }

  return <BuyPage />
}
