import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, ScrollView, SafeAreaView, ActivityIndicator,
  Platform, StatusBar, Image, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { colors } from '../theme/colors';

const API = 'https://geopost-production.up.railway.app';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const FILTERS = ['Tudo', 'Usuários', 'Restaurantes', 'Pontos Turísticos', 'Momentos'];

const FAKE_POSTS = [
  { id: '1', placeName: 'Valle Nevado', category: 'Momento', rating: 0, imageUrl: 'https://images.unsplash.com/photo-1542861219-c6e3b2eefbb5?w=400&h=400&fit=crop' },
  { id: '2', placeName: 'Pão de Açúcar', category: 'Ponto Turístico', rating: 5, imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=400&fit=crop' },
  { id: '3', placeName: 'Trattoria Italiana', category: 'Restaurante', rating: 4.6, imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=400&fit=crop' },
  { id: '4', placeName: 'Praia do Rosa', category: 'Momento', rating: 0, imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop' },
  { id: '5', placeName: 'Café do Bosque', category: 'Restaurante', rating: 4.8, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop' },
  { id: '6', placeName: 'Museu de Arte', category: 'Ponto Turístico', rating: 4.5, imageUrl: 'https://images.unsplash.com/photo-1518998053401-a48e778912ef?w=400&h=400&fit=crop' },
  { id: '7', placeName: 'Rua das Luzes', category: 'Momento', rating: 0, imageUrl: 'https://images.unsplash.com/photo-1563810141692-7f724d101d29?w=400&h=400&fit=crop' },
  { id: '8', placeName: 'Deck Mar', category: 'Restaurante', rating: 4.3, imageUrl: 'https://images.unsplash.com/photo-1522778526135-18861937ff71?w=400&h=400&fit=crop' },
];

const FAKE_PINS = [
  { id: 'p1', latitude: -23.548, longitude: -46.636, name: 'Trattoria' },
  { id: 'p2', latitude: -23.556, longitude: -46.620, name: 'Café do Bosque' },
  { id: 'p3', latitude: -23.540, longitude: -46.650, name: 'Museu de Arte' },
  { id: 'p4', latitude: -23.562, longitude: -46.628, name: 'Pão de Açúcar' },
  { id: 'p5', latitude: -23.544, longitude: -46.644, name: 'Deck Mar' },
];

function StarsMini({ rating }) {
  if (!rating || rating === 0) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
      <Ionicons name="star" size={11} color="#FBBF24" />
      <Text style={{ fontSize: 11, color: colors.textLight, marginLeft: 2 }}>{rating.toFixed(1)}</Text>
    </View>
  );
}

export default function ExploreScreen() {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tudo');
  const [viewMode, setViewMode] = useState('grid');

  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Pegar localização ao entrar no modo mapa
  useEffect(() => {
    if (viewMode === 'map' && !userLocation) {
      (async () => {
        setIsLoadingLocation(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation(loc.coords);
        }
        setIsLoadingLocation(false);
      })();
    }
  }, [viewMode]);

  // Buscar usuários quando debounce atualiza
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setSearchResults([]);
      return;
    }
    const isUserSearch = activeFilter === 'Tudo' || activeFilter === 'Usuários';
    if (!isUserSearch) return;

    (async () => {
      setIsSearching(true);
      try {
        const token = await AsyncStorage.getItem('@token');
        const res = await fetch(`${API}/users/search?q=${encodeURIComponent(debouncedSearch)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (e) {
        console.log('Error searching users', e);
      } finally {
        setIsSearching(false);
      }
    })();
  }, [debouncedSearch, activeFilter]);

  const handleFollow = useCallback(async (userId) => {
    try {
      const token = await AsyncStorage.getItem('@token');
      await fetch(`${API}/follows`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      });
      setSearchResults(prev =>
        prev.map(u => u.id === userId ? { ...u, isFollowing: true } : u)
      );
    } catch (e) {
      console.log('Error following', e);
    }
  }, []);

  const handleUnfollow = useCallback(async (userId) => {
    try {
      const token = await AsyncStorage.getItem('@token');
      await fetch(`${API}/follows/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(prev =>
        prev.map(u => u.id === userId ? { ...u, isFollowing: false } : u)
      );
    } catch (e) {
      console.log('Error unfollowing', e);
    }
  }, []);

  const isSearchActive = debouncedSearch.trim().length > 0;
  const isPlaceFilter = !['Tudo', 'Usuários'].includes(activeFilter);

  // ── RENDERS ──────────────────────────────────────────────
  const renderUserItem = ({ item }) => {
    const initial = item.name ? item.name.charAt(0).toUpperCase() : '?';
    return (
      <View style={styles.userItem}>
        <View style={styles.userAvatar}>
          {item.avatar
            ? <Image source={{ uri: item.avatar }} style={styles.userAvatarImage} />
            : <Text style={styles.userAvatarInitial}>{initial}</Text>
          }
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.userUsername} numberOfLines={1}>@{item.username}</Text>
        </View>
        {item.isFollowing ? (
          <TouchableOpacity style={styles.btnFollowing} onPress={() => handleUnfollow(item.id)}>
            <Text style={styles.btnFollowingText}>Seguindo</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.btnFollow} onPress={() => handleFollow(item.id)}>
            <Text style={styles.btnFollowText}>Seguir</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderGridItem = ({ item }) => (
    <View style={styles.gridCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
      <View style={styles.gridInfo}>
        <Text style={styles.gridPlaceName} numberOfLines={1}>{item.placeName}</Text>
        <Text style={styles.gridCategory} numberOfLines={1}>{item.category}</Text>
        <StarsMini rating={item.rating} />
      </View>
    </View>
  );

  const mapRegion = userLocation
    ? { latitude: userLocation.latitude, longitude: userLocation.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : { latitude: -23.5505, longitude: -46.6333, latitudeDelta: 0.05, longitudeDelta: 0.05 };

  const mapPins = userLocation
    ? FAKE_PINS.map((p, i) => ({ ...p, latitude: userLocation.latitude + (i - 2) * 0.006, longitude: userLocation.longitude + (i - 2) * 0.006 }))
    : FAKE_PINS;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explorar</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textLight} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lugares ou pessoas..."
            placeholderTextColor={colors.textLight}
            value={searchText}
            onChangeText={setSearchText}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchText(''); setDebouncedSearch(''); }}>
              <Ionicons name="close-circle" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.pill, activeFilter === f && styles.pillActive]}
          >
            <Text style={[styles.pillText, activeFilter === f && styles.pillTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Corpo */}
      {isSearchActive ? (
        // ── RESULTADOS DE BUSCA ──
        isPlaceFilter ? (
          <View style={styles.emptyCenter}>
            <Ionicons name="map-outline" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>Em breve</Text>
            <Text style={styles.emptySubtitle}>Busca de lugares está chegando.</Text>
          </View>
        ) : isSearching ? (
          <View style={styles.emptyCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyCenter}>
            <Ionicons name="person-outline" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>Nenhum usuário encontrado</Text>
            <Text style={styles.emptySubtitle}>Tente outro termo de busca.</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={item => item.id}
            renderItem={renderUserItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )
      ) : (
        // ── MODO PADRÃO: MAPA / GRADE ──
        <>
          {/* Switcher */}
          <View style={styles.switcherRow}>
            <TouchableOpacity
              style={[styles.switchBtn, viewMode === 'map' && styles.switchBtnActive]}
              onPress={() => setViewMode('map')}
            >
              <Ionicons name="map-outline" size={22} color={viewMode === 'map' ? colors.primary : colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.switchBtn, viewMode === 'grid' && styles.switchBtnActive]}
              onPress={() => setViewMode('grid')}
            >
              <Ionicons name="grid-outline" size={22} color={viewMode === 'grid' ? colors.primary : colors.textLight} />
            </TouchableOpacity>
          </View>

          {viewMode === 'map' ? (
            isLoadingLocation ? (
              <View style={styles.emptyCenter}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textLight, marginTop: 12 }}>Obtendo localização...</Text>
              </View>
            ) : (
              <MapView provider={PROVIDER_GOOGLE} style={styles.map} region={mapRegion} showsUserLocation>
                {mapPins.map(pin => (
                  <Marker key={pin.id} coordinate={{ latitude: pin.latitude, longitude: pin.longitude }} title={pin.name}>
                    <View style={styles.pinDot}>
                      <Ionicons name="location" size={30} color={colors.primary} />
                    </View>
                  </Marker>
                ))}
              </MapView>
            )
          ) : (
            <FlatList
              data={FAKE_POSTS}
              keyExtractor={item => item.id}
              numColumns={2}
              renderItem={renderGridItem}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
            />
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1C1C1E',
    height: '100%',
  },
  pillsScroll: {
    maxHeight: 52,
  },
  pillsContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: '#F97316',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  switcherRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  switchBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  switchBtnActive: {
    borderBottomColor: '#F97316',
  },
  map: {
    flex: 1,
  },
  pinDot: {
    alignItems: 'center',
  },
  gridContent: {
    padding: 16,
    paddingBottom: 30,
  },
  gridCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  gridImage: {
    width: '100%',
    height: CARD_WIDTH,
  },
  gridInfo: {
    padding: 8,
  },
  gridPlaceName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  gridCategory: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  // User list
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFF1E8',
    borderWidth: 1.5,
    borderColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  userAvatarImage: {
    width: '100%',
    height: '100%',
  },
  userAvatarInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F97316',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  userUsername: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 1,
  },
  btnFollow: {
    backgroundColor: '#F97316',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  btnFollowText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  btnFollowing: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F97316',
  },
  btnFollowingText: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginLeft: 74,
  },
  emptyCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20,
  },
});