import { SavedPage } from '@/screens/saved'
import { Redirect, useSegments } from 'expo-router'

/**
 * Used by (tabs)/favorite. Root /saved would hide tabs — normalize into the favorite tab.
 */
export default function SavedScreen() {
  const segments = useSegments()
  const insideTabs = segments[0] === '(tabs)'

  if (!insideTabs) {
    return <Redirect href='/(tabs)/favorite' />
  }

  return <SavedPage />
}
