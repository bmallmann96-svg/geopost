import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { View } from 'react-native'

import FeedScreen from './src/screens/FeedScreen'
import ExploreScreen from './src/screens/ExploreScreen'
import ProfileScreen from './src/screens/ProfileScreen'
import NewPostScreen from './src/screens/NewPostScreen'
import PostDetailsScreen from './src/screens/PostDetailsScreen'
import SettingsScreen from './src/screens/SettingsScreen'
import UserProfileScreen from './src/screens/UserProfileScreen'
import MyListsScreen from './src/screens/MyListsScreen'
import CreateListScreen from './src/screens/CreateListScreen'
import ListDetailScreen from './src/screens/ListDetailScreen'
import LoginScreen from './src/screens/LoginScreen'
import RegisterScreen from './src/screens/RegisterScreen'
import StoryViewerScreen from './src/screens/StoryViewerScreen'
import StoryCreatorScreen from './src/screens/StoryCreatorScreen'
import SinglePostScreen from './src/screens/SinglePostScreen'
import EditPostScreen from './src/screens/EditPostScreen'
import EditListScreen from './src/screens/EditListScreen'
import ShareCardScreen from './src/screens/ShareCardScreen'
import { colors } from './src/theme/colors'
import { AuthProvider, useAuth } from './src/context/AuthContext'

const Tab = createBottomTabNavigator()
const Stack = createNativeStackNavigator()
const MainStack = createNativeStackNavigator()

function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  )
}

function MainTabs() {
  return (
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
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Feed' }} />
      <Tab.Screen name="Explorar" component={ExploreScreen} options={{ title: 'Explorar' }} />
      
      {/* Botão Centralizado */}
      <Tab.Screen 
        name="NewPost" 
        component={NewPostScreen} 
        options={{
          title: '',
          tabBarStyle: { display: 'none' }, // Esconde a barra quando entra na tela
          tabBarIcon: () => (
            <View style={{
              marginTop: -20,
              backgroundColor: colors.primary,
              width: 60,
              height: 60,
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
              elevation: 5,
            }}>
              <Ionicons name="add" size={32} color={colors.white} />
            </View>
          )
        }} 
      />

      <Tab.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Perfil' }} />
      
      {/* Tela oculta da tab bar */}
      <Tab.Screen 
        name="PostDetails" 
        component={PostDetailsScreen} 
        options={{
          tabBarButton: () => null,
          tabBarStyle: { display: 'none' }  
        }}
      />
    </Tab.Navigator>
  )
}

function MainAppNavigator() {
  const { user } = useAuth()

  if (!user) {
    return <AuthNavigator />
  }

  return (
    <MainStack.Navigator screenOptions={{ headerShown: false, presentation: 'fullScreenModal' }}>
      <MainStack.Screen name="Tabs" component={MainTabs} options={{ presentation: 'card' }} />
      <MainStack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'card' }} />
      <MainStack.Screen name="UserProfile" component={UserProfileScreen} options={{ presentation: 'card' }} />
      <MainStack.Screen name="MyLists" component={MyListsScreen} options={{ presentation: 'card' }} />
      <MainStack.Screen name="CreateList" component={CreateListScreen} options={{ presentation: 'card' }} />
      <MainStack.Screen name="ListDetail" component={ListDetailScreen} options={{ presentation: 'card' }} />
      <MainStack.Screen name="SinglePost" component={SinglePostScreen} options={{ presentation: 'card' }} />
      <MainStack.Screen name="EditPost" component={EditPostScreen} options={{ presentation: 'card' }} />
      <MainStack.Screen name="EditList" component={EditListScreen} options={{ presentation: 'card' }} />
      <MainStack.Screen name="StoryViewer" component={StoryViewerScreen} />
      <MainStack.Screen name="StoryCreator" component={StoryCreatorScreen} />
      <MainStack.Screen name="ShareCard" component={ShareCardScreen} options={{ presentation: 'card' }} />
    </MainStack.Navigator>
  )
}

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <MainAppNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}

export default App