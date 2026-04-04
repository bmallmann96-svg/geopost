import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  SafeAreaView, Platform, StatusBar, ActivityIndicator, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const API = 'https://geopost-production.up.railway.app';

export default function MyListsScreen({ navigation }) {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    if (!user?.id) return;
    try {
      const token = await AsyncStorage.getItem('@token');
      const res = await fetch(`${API}/lists/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLists(await res.json());
    } catch (e) {
      console.log('Error fetching lists', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { fetchLists(); }, [fetchLists]));

  const renderListCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ListDetail', { listId: item.id, listTitle: item.title, listEmoji: item.emoji, listColor: item.color })}
      activeOpacity={0.8}
    >
      {/* Cor da lista no lado esquerdo */}
      <View style={[styles.cardAccent, { backgroundColor: item.color }]} />

      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardEmoji}>{item.emoji}</Text>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.cardDescription} numberOfLines={1}>{item.description}</Text>
            ) : null}
            <Text style={styles.cardCount}>{item.itemCount} {item.itemCount === 1 ? 'lugar' : 'lugares'}</Text>
          </View>
        </View>

        {/* Preview de fotos */}
        {item.previews.length > 0 && (
          <View style={styles.previewRow}>
            {item.previews.map((url, idx) => (
              <Image key={idx} source={{ uri: url }} style={styles.previewThumb} />
            ))}
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={colors.textLight} style={{ alignSelf: 'center', marginRight: 12 }} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas listas</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('CreateList')}
        >
          <Ionicons name="add" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : lists.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🗺️</Text>
          <Text style={styles.emptyTitle}>Crie sua primeira lista</Text>
          <Text style={styles.emptySubtitle}>Organize seus lugares favoritos em coleções personalizadas.</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('CreateList')}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.createBtnText}>Nova lista</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={item => item.id}
          renderItem={renderListCard}
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#F0F0F0' }} />}
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
  addBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },

  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'stretch',
  },
  cardAccent: {
    width: 4,
    borderRadius: 2,
    marginLeft: 16,
    marginRight: 12,
    minHeight: 50,
  },
  cardBody: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardEmoji: {
    fontSize: 28,
    marginRight: 12,
    lineHeight: 34,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  cardDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  cardCount: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  previewRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  previewThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    marginRight: 6,
    backgroundColor: '#F5F5F5',
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 4,
  },
});
