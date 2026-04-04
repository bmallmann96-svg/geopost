import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, FlatList,
  SafeAreaView, Platform, StatusBar, Dimensions, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';

const API = 'https://geopost-production.up.railway.app';
const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('map');
  const [posts, setPosts] = useState([]);
  const [lists, setLists] = useState([]);
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('@token');
      const headers = { Authorization: `Bearer ${token}` };

      const [postsRes, statsRes, listsRes] = await Promise.all([
        fetch(`${API}/posts/user/${user.id}`, { headers }),
        fetch(`${API}/users/${user.id}`, { headers }),
        fetch(`${API}/lists/user/${user.id}`, { headers }),
      ]);

      if (postsRes.ok) setPosts(await postsRes.json());
      if (statsRes.ok) {
        const s = await statsRes.json();
        setStats({ followersCount: s.followersCount, followingCount: s.followingCount });
      }
      if (listsRes.ok) setLists(await listsRes.json());
    } catch (e) {
      console.log('Error fetching profile data', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));

  const userInitials = user?.name ? user.name.substring(0, 1).toUpperCase() : 'U';

  // Mapeia qual lista cada post pertence (para cor do pin)
  const postListColorMap = {};
  lists.forEach(list => {
    // A cor já está disponível na lista; mas precisamos saber quais postIds ela tem
    // Aqui usamos apenas o preview - para pins corretos precisaríamos do detalhe
    // Deixamos laranja como padrão; ao abrir a lista os pins mostram a cor correta
  });

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={{ width: '100%', alignItems: 'flex-end', marginBottom: 8, paddingHorizontal: 4 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileInfoRow}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitials}>{userInitials}</Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{posts.length}</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.followersCount}</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.followingCount}</Text>
            <Text style={styles.statLabel}>Seguindo</Text>
          </View>
        </View>
      </View>

      <Text style={styles.name}>{user?.name || ''}</Text>
      <Text style={styles.username}>{user?.username || ''}</Text>
      <Text style={styles.bio} numberOfLines={2}>{user?.bio || 'Bem vindo ao GeoPost!'}</Text>

      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Editar perfil</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSwitchers = () => (
    <View style={styles.switcherContainer}>
      <TouchableOpacity
        style={[styles.switchButton, viewMode === 'map' && styles.switchButtonActive]}
        onPress={() => setViewMode('map')}
      >
        <Ionicons name="map-outline" size={24} color={viewMode === 'map' ? colors.primary : colors.textLight} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.switchButton, viewMode === 'grid' && styles.switchButtonActive]}
        onPress={() => setViewMode('grid')}
      >
        <Ionicons name="grid-outline" size={24} color={viewMode === 'grid' ? colors.primary : colors.textLight} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.switchButton, viewMode === 'lists' && styles.switchButtonActive]}
        onPress={() => navigation.navigate('MyLists')}
      >
        <Ionicons name="list-outline" size={24} color={viewMode === 'lists' ? colors.primary : colors.textLight} />
      </TouchableOpacity>
    </View>
  );

  const renderGridContent = () => (
    <FlatList
      data={posts}
      keyExtractor={(item) => item.id}
      numColumns={3}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.gridItemContainer}>
          <Image source={{ uri: item.photoUrl }} style={styles.gridImage} />
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.gridContent}
    />
  );

  const renderMapContent = () => (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: -14.235,
          longitude: -51.92528,
          latitudeDelta: 30,
          longitudeDelta: 30,
        }}
      >
        {posts.map(pin => (
          <Marker
            key={pin.id}
            coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
          >
            <Ionicons name="location" size={36} color={colors.primary} />
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Image source={{ uri: pin.photoUrl }} style={styles.calloutImage} />
                <Text style={styles.calloutTitle}>{pin.placeName}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      {renderSwitchers()}
      <View style={styles.contentContainer}>
        {viewMode === 'map' ? renderMapContent() : renderGridContent()}
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
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginLeft: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  username: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
    lineHeight: 20,
  },
  editButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  switcherContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginTop: 12,
  },
  switchButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  switchButtonActive: {
    borderBottomColor: colors.primary,
  },
  contentContainer: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  gridContent: {
    paddingBottom: 20,
  },
  gridItemContainer: {
    width: width / 3,
    height: width / 3,
    padding: 1,
  },
  gridImage: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  calloutContainer: {
    width: 120,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
  },
  calloutImage: {
    width: 100,
    height: 60,
    borderRadius: 6,
    marginBottom: 6,
  },
  calloutTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
  },
});