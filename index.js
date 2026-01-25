import { AppRegistry } from 'react-native'
import messaging from '@react-native-firebase/messaging'
import App from './App'
import { name as appName } from './app.json'

// Background message handler
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Background notification:', remoteMessage)
})

// Register main app
AppRegistry.registerComponent(appName, () => App)
