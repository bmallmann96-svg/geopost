import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity, FlatList,
  SafeAreaView, Platform, StatusBar, Dimensions, ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const API = 'https://geopost-production.up.railway.app';
const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 4) / 3;

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const { user: loggedUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [userId]);

  const fetchAll = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const headers = { Authorization: `Bearer ${token}` };

      const [profileRes, postsRes] = await Promise.all([
        fetch(`${API}/users/${userId}`, { headers }),
        fetch(`${API}/posts/user/${userId}`, { headers }),
      ]);

      if (profileRes.ok) setProfile(await profileRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
    } catch (e) {
      console.log('Error fetching user profile', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    setIsFollowLoading(true);
    try {
      const token = await AsyncStorage.getItem('@token');
      await fetch(`${API}/follows`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: userId }),
      });
      setProfile(prev => ({
        ...prev,
        isFollowing: true,
        followersCount: prev.followersCount + 1,
      }));
    } catch (e) {
      console.log('Error following', e);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setIsFollowLoading(true);
    try {
      const token = await AsyncStorage.getItem('@token');
      await fetch(`${API}/follows/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(prev => ({
        ...prev,
        isFollowing: false,
        followersCount: Math.max(0, prev.followersCount - 1),
      }));
    } catch (e) {
      console.log('Error unfollowing', e);
    } finally {
      setIsFollowLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={{ color: colors.textLight }}>Usuário não encontrado.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : '?';
  const isOwnProfile = loggedUser?.id === userId;

  const ListHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{profile.username}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Profile Info */}
      <View style={styles.profileSection}>
        <View style={styles.profileInfoRow}>
          <View style={styles.avatarContainer}>
            {profile.avatar
              ? <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
              : <Text style={styles.avatarInitial}>{initial}</Text>
            }
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.postsCount}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.followersCount}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profile.followingCount}</Text>
              <Text style={styles.statLabel}>Seguindo</Text>
            </View>
          </View>
        </View>

        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        {!isOwnProfile && (
          <TouchableOpacity
            style={profile.isFollowing ? styles.btnFollowing : styles.btnFollow}
            onPress={profile.isFollowing ? handleUnfollow : handleFollow}
            disabled={isFollowLoading}
          >
            {isFollowLoading
              ? <ActivityIndicator size="small" color={profile.isFollowing ? colors.primary : colors.white} />
              : <Text style={profile.isFollowing ? styles.btnFollowingText : styles.btnFollowText}>
                  {profile.isFollowing ? 'Seguindo' : 'Seguir'}
                </Text>
            }
          </TouchableOpacity>
        )}
      </View>

      {/* Posts header */}
      <View style={styles.postsHeader}>
        <Ionicons name="grid-outline" size={20} color={colors.text} />
        <Text style={styles.postsHeaderText}>Posts</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {posts.length === 0 ? (
        <>
          <ListHeader />
          <View style={styles.emptyPosts}>
            <Ionicons name="images-outline" size={48} color={colors.border} />
            <Text style={styles.emptyText}>Nenhum post ainda.</Text>
          </View>
        </>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          numColumns={3}
          ListHeaderComponent={<ListHeader />}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.gridItem}>
              <Image source={{ uri: item.photoUrl }} style={styles.gridImage} />
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#FFF1E8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarInitial: {
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
    marginLeft: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E5EA',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  username: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    color: '#1C1C1E',
    marginTop: 8,
    lineHeight: 20,
  },
  btnFollow: {
    marginTop: 14,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnFollowText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  btnFollowing: {
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  btnFollowingText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    marginTop: 8,
    gap: 8,
  },
  postsHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  gridItem: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    padding: 1,
  },
  gridImage: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  emptyPosts: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#8E8E93',
    marginTop: 12,
    fontSize: 15,
  },
});
