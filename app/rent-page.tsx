import { Redirect } from 'expo-router'

/** Legacy stack route: always land in Khám phá (thuê) so tabs + header stay mounted. */
export default function RentPageRedirect() {
  return <Redirect href={{ pathname: '/(tabs)/explore', params: { mode: 'rent' } }} />
}
