import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ActivityIndicator, Text, TouchableOpacity, ScrollView, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import PostCard from '../components/PostCard';
import { colors } from '../theme/colors';

const API = 'https://geopost-production.up.railway.app';

export default function SinglePostScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchPost();
    fetchCurrentUser();
  }, [postId]);

  const fetchCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const res = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCurrentUser(await res.json());
    } catch (e) {
      console.log(e);
    }
  };

  const fetchPost = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const res = await fetch(`${API}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const p = await res.json();
        // Mapear para o formato que o PostCard espera
        setPost({
          id: p.id,
          userId: p.userId,
          user: p.user,
          imageUrl: p.photoUrl,
          placeName: p.placeName,
          category: p.category,
          rating: p.rating,
          caption: p.caption,
          likes: Math.floor(Math.random() * 500),
          comments: Math.floor(Math.random() * 50),
          lat: p.latitude,
          lng: p.longitude,
          
          mediaType: p.mediaType,
          cuisineTypes: p.cuisineTypes,
          priceRange: p.priceRange,
          occasions: p.occasions,
          mealTimes: p.mealTimes,
          wouldReturn: p.wouldReturn,
          bestDish: p.bestDish,
          tip: p.tip,
          foodRating: p.foodRating,
          serviceRating: p.serviceRating,
          ambienceRating: p.ambienceRating,
          valueRating: p.valueRating,
          
          visitDuration: p.visitDuration,
          bestSeason: p.bestSeason,
          bestTimeOfDay: p.bestTimeOfDay,
          crowdLevel: p.crowdLevel,
          howToGetThere: p.howToGetThere,
          wheelchairAccess: p.wheelchairAccess,
          petsAllowed: p.petsAllowed,
          touristTip: p.touristTip,
          mustSee: p.mustSee,
          attractionTypes: p.attractionTypes,
          experienceRating: p.experienceRating,
          accessibilityRating: p.accessibilityRating,
          conservationRating: p.conservationRating,
          
          price: p.metadata?.price,
          hours: p.metadata?.hours,
          tips: p.metadata?.tips,
          entryFee: p.metadata?.entryFee,
        });
      }
    } catch (e) {
      console.log('Error fetching single post', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={{ color: colors.textLight }}>Post não encontrado.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    navigation.navigate('EditPost', { post });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Publicação</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: post.lat || -23.5505,
              longitude: post.lng || -46.6333,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude: post.lat || -23.5505, longitude: post.lng || -46.6333 }}>
              <Ionicons name="location" size={36} color={colors.primary} />
            </Marker>
          </MapView>
        </View>
        <View style={{ padding: 12 }}>
          <PostCard 
            post={post} 
            defaultExpanded={true} 
            onEdit={currentUser?.id === post.userId ? handleEdit : null}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.background, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '600', color: colors.text },
  mapContainer: { width: '100%', height: 200 },
  map: { flex: 1 },
});
