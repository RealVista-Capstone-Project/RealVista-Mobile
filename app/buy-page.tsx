import { Redirect } from 'expo-router'

/** Legacy stack route: always land in Khám phá (mua) so tabs + header stay mounted. */
export default function BuyPageRedirect() {
  return <Redirect href='/(tabs)/explore' />
}
