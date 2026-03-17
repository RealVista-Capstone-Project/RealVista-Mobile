import { AppRegistry } from 'react-native'
// eslint-disable-next-line import/no-unresolved
import App from './App'
import { name as appName } from './app.json'

// Register main app
AppRegistry.registerComponent(appName, () => App)
