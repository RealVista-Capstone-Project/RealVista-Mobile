import { useLocalSearchParams, Stack } from 'expo-router'
import { Manage3dScreen } from '@/screens/manage-3d'

export default function Manage3dRoute() {
  const { id } = useLocalSearchParams<{ id: string }>()
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Manage3dScreen propertyId={id} />
    </>
  )
}
