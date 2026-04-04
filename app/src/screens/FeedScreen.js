import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, RefreshControl, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import PostCard from '../components/PostCard';
import StoryBar from '../components/StoryBar';

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const res = await fetch('https://geopost-production.up.railway.app/posts/feed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const formattedPosts = data.map(p => ({
          id: p.id,
          user: p.user,
          imageUrl: p.photoUrl,
          placeName: p.placeName,
          category: p.category,
          rating: p.rating,
          caption: p.caption,
          priority: p.priority,
          likes: Math.floor(Math.random() * 500),
          comments: Math.floor(Math.random() * 50),
          // Campos legados (tourist/moment via metadata)
          price: p.metadata?.price,
          hours: p.metadata?.hours,
          tips: p.metadata?.tips,
          entryFee: p.metadata?.entryFee,
          lat: p.latitude,
          lng: p.longitude,
          // Novos campos de restaurante
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
          // Campos de ponto turístico
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
        }));
        setPosts(formattedPosts);
      }
    } catch (e) {
      console.log('Error fetching posts', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  // Injeta item separador entre posts de seguidores e outros
  const feedWithSeparator = React.useMemo(() => {
    const firstOtherIdx = posts.findIndex(p => p.priority === 2);
    if (firstOtherIdx <= 0) return posts; // nenhum post de seguindo, ou todos são outros -> sem separador

    return [
      ...posts.slice(0, firstOtherIdx),
      { id: '__separator__', isSeparator: true },
      ...posts.slice(firstOtherIdx),
    ];
  }, [posts]);

  const renderItem = ({ item }) => {
    if (item.isSeparator) {
      return (
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>Outros posts</Text>
          <View style={styles.separatorLine} />
        </View>
      );
    }
    return <PostCard post={item} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>GeoPost</Text>
        <Ionicons name="notifications-outline" size={24} color={colors.text} />
      </View>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : posts.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textLight }}>Nenhum post encontrado. Seja o primeiro a publicar!</Text>
        </View>
      ) : (
        <FlatList
          data={feedWithSeparator}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<StoryBar />}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: -0.5,
  },
  listContent: {
    paddingBottom: 20,
    backgroundColor: colors.surface,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surface,
  },
  separatorLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C7C7CC',
  },
  separatorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginHorizontal: 10,
    letterSpacing: 0.3,
  },
});