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
      const res = await fetch('http://192.168.0.15:3000/posts/feed', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Mapeia para a estrutura esperada pelo PostCard
        const formattedPosts = data.map(p => ({
          id: p.id,
          user: p.user,
          imageUrl: p.photoUrl,
          placeName: p.placeName,
          category: p.category,
          rating: p.rating,
          caption: p.caption,
          likes: Math.floor(Math.random() * 500), // mock metrics
          comments: Math.floor(Math.random() * 50), // mock metrics
          price: p.metadata?.price,
          hours: p.metadata?.hours,
          tips: p.metadata?.tips,
          entryFee: p.metadata?.entryFee,
          lat: p.latitude,
          lng: p.longitude,
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
          data={posts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<StoryBar />}
          renderItem={({ item }) => <PostCard post={item} />}
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
});