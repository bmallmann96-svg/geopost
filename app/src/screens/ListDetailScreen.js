import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, Platform, StatusBar, ActivityIndicator,
  Image, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const API = 'https://geopost-production.up.railway.app';
const { width } = Dimensions.get('window');
const GRID_SIZE = (width - 4) / 3;

export default function ListDetailScreen({ route, navigation }) {
  const { listId, listTitle, listEmoji, listColor } = route.params;
  const { user } = useAuth();

  const [list, setList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map');

  useFocusEffect(
    useCallback(() => {
      fetchList();
    }, [listId])
  );

  const fetchList = async () => {
    console.log('ListDetailScreen - fetchList triggered for list:', listId);
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('@token');
      const res = await fetch(`${API}/lists/${listId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
      });
      if (res.ok) {
        const data = await res.json();
        setList(data);
      } else {
         console.log('Error fetching list - status:', res.status);
      }
    } catch (e) {
      console.log('Error fetching list', e);
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

  const posts = list?.posts || [];
  const pinColor = list?.color || listColor || colors.primary;

  // Calcular região do mapa a partir dos posts
  const mapRegion = posts.length > 0
    ? {
        latitude: posts.reduce((s, p) => s + p.latitude, 0) / posts.length,
        longitude: posts.reduce((s, p) => s + p.longitude, 0) / posts.length,
        latitudeDelta: 0.15,
        longitudeDelta: 0.15,
      }
    : { latitude: -23.5505, longitude: -46.6333, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  const renderMapMode = () => (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      region={mapRegion}
    >
      {posts.map(post => (
        <Marker
          key={post.id}
          coordinate={{ latitude: post.latitude, longitude: post.longitude }}
        >
          {/* Pin colorido da lista */}
          <View style={styles.pinWrapper}>
            <View style={[styles.pinCircle, { backgroundColor: pinColor }]}>
              <Text style={styles.pinEmoji}>{list?.emoji || listEmoji || '📍'}</Text>
            </View>
            <View style={[styles.pinTail, { borderTopColor: pinColor }]} />
          </View>
          <Callout tooltip onPress={() => navigation.navigate('SinglePost', { postId: post.id })}>
            <View style={styles.callout}>
              <Image source={{ uri: post.photoUrl }} style={styles.calloutImage} />
              <Text style={styles.calloutName} numberOfLines={1}>{post.placeName}</Text>
            </View>
          </Callout>
        </Marker>
      ))}
    </MapView>
  );

  const renderGridMode = () => (
    <FlatList
      data={posts}
      keyExtractor={item => item.id}
      numColumns={3}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.gridItem}
          onPress={() => navigation.navigate('SinglePost', { postId: item.id })}
        >
          <Image source={{ uri: item.photoUrl }} style={styles.gridImage} />
          <View style={[styles.gridOverlay, { borderColor: pinColor }]} />
        </TouchableOpacity>
      )}
      contentContainerStyle={{ paddingBottom: 30 }}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Nenhum lugar nesta lista ainda.</Text>
        </View>
      }
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{list?.emoji || listEmoji || '📍'}</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{list?.title || listTitle}</Text>
        </View>
        <View style={styles.rightAction}>
          {list && user && list.userId === user.id ? (
            <TouchableOpacity onPress={() => navigation.navigate('EditList', { listId, listTitle: list.title, listDescription: list.description, listEmoji: list.emoji, listColor: list.color })} style={{ padding: 4 }}>
              <Ionicons name="pencil-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32 }} />
          )}
        </View>
      </View>

      {/* Info bar */}
      {list?.description ? (
        <View style={[styles.infoBar, { borderLeftColor: pinColor }]}>
          <Text style={styles.infoText}>{list.description}</Text>
        </View>
      ) : null}

      {/* Switcher mapa / grade */}
      <View style={styles.switcher}>
        <TouchableOpacity
          style={[styles.switchBtn, viewMode === 'map' && { borderBottomColor: pinColor, borderBottomWidth: 2.5 }]}
          onPress={() => setViewMode('map')}
        >
          <Ionicons name="map-outline" size={22} color={viewMode === 'map' ? pinColor : colors.textLight} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.switchBtn, viewMode === 'grid' && { borderBottomColor: pinColor, borderBottomWidth: 2.5 }]}
          onPress={() => setViewMode('grid')}
        >
          <Ionicons name="grid-outline" size={22} color={viewMode === 'grid' ? pinColor : colors.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {viewMode === 'map' ? renderMapMode() : renderGridMode()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backBtn: { padding: 4 },
  headerCenter: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', gap: 6 },
  headerEmoji: { fontSize: 20 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E', marginLeft: 4, flex: 1, textAlign: 'center' },

  infoBar: {
    borderLeftWidth: 3,
    marginHorizontal: 16,
    marginTop: 12,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  infoText: { fontSize: 13, color: '#8E8E93', lineHeight: 20 },

  switcher: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    marginTop: 8,
  },
  switchBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  content: { flex: 1 },
  map: { flex: 1 },

  // Pins personalizados
  pinWrapper: { alignItems: 'center' },
  pinCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  pinEmoji: { fontSize: 18 },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },

  // Callout
  callout: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 6,
    width: 120,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutImage: { width: 108, height: 72, borderRadius: 6, marginBottom: 4 },
  calloutName: { fontSize: 12, fontWeight: '600', color: '#1C1C1E', textAlign: 'center' },

  // Grid
  gridItem: {
    width: GRID_SIZE,
    height: GRID_SIZE,
    padding: 1,
    position: 'relative',
  },
  gridImage: { flex: 1, backgroundColor: '#F5F5F5' },
  gridOverlay: {
    position: 'absolute',
    bottom: 1,
    left: 1,
    right: 1,
    height: 3,
    borderBottomWidth: 3,
  },
  emptyText: { color: '#8E8E93', fontSize: 15, textAlign: 'center' },
});
