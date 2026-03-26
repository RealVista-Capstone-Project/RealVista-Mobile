import BuyPageScreen from '../buy-page'
import RentPageScreen from '../rent-page'
import { useLocalSearchParams } from 'expo-router'

export default function ExploreTabScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>()

  if (mode === 'rent') {
    return <RentPageScreen />
  }

  return <BuyPageScreen />
}
