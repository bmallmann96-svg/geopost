import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'

import FeedScreen from './src/screens/FeedScreen'
import ExploreScreen from './src/screens/ExploreScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import { colors } from './src/theme/colors'

const Tab = createBottomTabNavigator()

function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
            height: 85,
            paddingBottom: 25,
            paddingTop: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarIcon: ({ focused, color }) => {
            let iconName
            if (route.name === 'Feed') {
              iconName = focused ? 'home' : 'home-outline'
            } else if (route.name === 'Explorar') {
              iconName = focused ? 'compass' : 'compass-outline'
            } else if (route.name === 'Perfil') {
              iconName = focused ? 'person' : 'person-outline'
            }
            return <Ionicons name={iconName} size={24} color={color} />
          },
        })}
      >
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="Explorar" component={ExploreScreen} />
        <Tab.Screen name="Perfil" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default App