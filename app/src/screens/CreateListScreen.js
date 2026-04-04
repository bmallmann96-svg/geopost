import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList,
  SafeAreaView, Platform, StatusBar, ScrollView, ActivityIndicator,
  Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

const API = 'https://geopost-production.up.railway.app';

const EMOJI_OPTIONS = ['🍕', '🍣', '🍺', '🌮', '🥗', '🎭', '🏛️', '🌿', '🛍️', '☕', '🏨', '🎵', '📍', '🌅', '🏖️', '🎨'];
const COLOR_OPTIONS = [
  { value: '#F97316', label: 'Laranja' },
  { value: '#7F77DD', label: 'Roxo' },
  { value: '#1D9E75', label: 'Verde' },
  { value: '#378ADD', label: 'Azul' },
  { value: '#D4537E', label: 'Rosa' },
  { value: '#E24B4A', label: 'Vermelho' },
];

export default function CreateListScreen({ navigation }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('📍');
  const [selectedColor, setSelectedColor] = useState('#F97316');
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const res = await fetch(`${API}/posts/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setUserPosts(await res.json());
    } catch (e) {
      console.log('Error fetching posts', e);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePost = (postId) => {
    setSelectedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'O título da lista é obrigatório.');
      return;
    }
    setIsCreating(true);
    try {
      const token = await AsyncStorage.getItem('@token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      // Cria a lista
      const createRes = await fetch(`${API}/lists`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: title.trim(), description: description.trim() || null, emoji: selectedEmoji, color: selectedColor }),
      });
      if (!createRes.ok) throw new Error('Erro ao criar lista');
      const newList = await createRes.json();

      // Adiciona os posts selecionados
      await Promise.all(
        selectedPosts.map(postId =>
          fetch(`${API}/lists/${newList.id}/items`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ postId }),
          })
        )
      );

      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova lista</Text>
        <TouchableOpacity
          style={[styles.headerBtn, styles.createBtn, !title.trim() && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={isCreating || !title.trim()}
        >
          {isCreating
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Text style={styles.createBtnText}>Criar</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Título */}
        <View style={styles.section}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Restaurantes favoritos de SP"
            placeholderTextColor="#8E8E93"
            value={title}
            onChangeText={setTitle}
            maxLength={60}
          />
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
            placeholder="Uma breve descrição da lista..."
            placeholderTextColor="#8E8E93"
            value={description}
            onChangeText={setDescription}
            multiline
            maxLength={200}
          />
        </View>

        {/* Emoji */}
        <View style={styles.section}>
          <Text style={styles.label}>Emoji</Text>
          <View style={styles.emojiGrid}>
            {EMOJI_OPTIONS.map(e => (
              <TouchableOpacity
                key={e}
                style={[styles.emojiBtn, selectedEmoji === e && styles.emojiBtnSelected]}
                onPress={() => setSelectedEmoji(e)}
              >
                <Text style={styles.emojiText}>{e}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cor */}
        <View style={styles.section}>
          <Text style={styles.label}>Cor dos pins no mapa</Text>
          <View style={styles.colorRow}>
            {COLOR_OPTIONS.map(c => (
              <TouchableOpacity
                key={c.value}
                onPress={() => setSelectedColor(c.value)}
                style={[styles.colorDot, { backgroundColor: c.value }, selectedColor === c.value && styles.colorDotSelected]}
              />
            ))}
          </View>
        </View>

        {/* Posts do usuário */}
        <View style={styles.section}>
          <Text style={styles.label}>Adicionar lugares ({selectedPosts.length} selecionados)</Text>
          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 12 }} />
          ) : userPosts.length === 0 ? (
            <Text style={styles.noPostsText}>Você ainda não tem posts para adicionar.</Text>
          ) : (
            userPosts.map(post => {
              const isSelected = selectedPosts.includes(post.id);
              return (
                <TouchableOpacity
                  key={post.id}
                  style={[styles.postItem, isSelected && styles.postItemSelected]}
                  onPress={() => togglePost(post.id)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: post.photoUrl }} style={styles.postThumb} />
                  <View style={styles.postInfo}>
                    <Text style={styles.postName} numberOfLines={1}>{post.placeName}</Text>
                    <Text style={styles.postCategory}>{post.category}</Text>
                  </View>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
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
  headerBtn: { padding: 4, minWidth: 70 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  cancelText: { fontSize: 16, color: '#8E8E93' },
  createBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnDisabled: { backgroundColor: '#E5E5EA' },
  createBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },

  scrollContent: { padding: 20, paddingBottom: 48 },
  section: { marginBottom: 28 },
  label: { fontSize: 14, fontWeight: '600', color: '#8E8E93', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
  },

  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  emojiBtnSelected: { backgroundColor: '#FFF1E8', borderWidth: 2, borderColor: colors.primary },
  emojiText: { fontSize: 24 },

  colorRow: { flexDirection: 'row', gap: 16 },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  colorDotSelected: {
    borderWidth: 3,
    borderColor: '#1C1C1E',
    transform: [{ scale: 1.15 }],
  },

  postItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
    marginBottom: 4,
  },
  postItemSelected: { backgroundColor: '#FFF1E8' },
  postThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginRight: 12,
  },
  postInfo: { flex: 1 },
  postName: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  postCategory: { fontSize: 13, color: '#8E8E93', marginTop: 2 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  noPostsText: { color: '#8E8E93', fontStyle: 'italic', fontSize: 14 },
});
