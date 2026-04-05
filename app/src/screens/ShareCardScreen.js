import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { colors } from '../theme/colors';

const API = 'https://geopost-production.up.railway.app';
const { width } = Dimensions.get('window');

// Proporção 1:1, deixando 40px de margem em cada lado
const CARD_SIZE = width - 80; 

export default function ShareCardScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const viewShotRef = useRef();

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const token = await AsyncStorage.getItem('@token');
      const res = await fetch(`${API}/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPost(await res.json());
      } else {
        Alert.alert('Erro', 'Não foi possível carregar o post');
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Erro', 'Ocorreu um problema de conexão');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso para salvar a foto na galeria.');
        return;
      }

      const uri = await viewShotRef.current.capture();
      await MediaLibrary.saveToLibraryAsync(uri);
      Alert.alert('Sucesso', 'Card salvo na galeria com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a imagem.');
    }
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Indisponível', 'Compartilhamento nativo não está disponível neste dispositivo');
        return;
      }

      const uri = await viewShotRef.current.capture();
      await Sharing.shareAsync(uri, {
        dialogTitle: 'Compartilhar post',
        mimeType: 'image/jpeg'
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar a imagem.');
    }
  };

  if (isLoading || !post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Compartilhar</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        
        {/* VIEW SHOT - ONDE A MÁGICA ACONTECE */}
        <View style={styles.cardWrapper}>
          <ViewShot 
            ref={viewShotRef} 
            options={{ format: "jpg", quality: 0.9 }}
            style={styles.viewShotContainer}
          >
            <View style={styles.card}>
              
              {/* Foto Principal */}
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: post.photoUrl }} 
                  style={styles.image} 
                  resizeMode="cover"
                />
              </View>

              {/* Informações */}
              <View style={styles.infoContainer}>
                <Text style={styles.placeName} numberOfLines={1}>{post.placeName}</Text>
                
                <View style={styles.metaRow}>
                  {post.rating > 0 && (
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={14} color="#FFFFFF" />
                      <Text style={styles.ratingText}>{post.rating.toFixed(1)}</Text>
                    </View>
                  )}
                  {post.category && (
                    <Text style={styles.categoryText}>• {post.category}</Text>
                  )}
                </View>

                {post.tip ? (
                  <Text style={styles.tipText} numberOfLines={2}>"{post.tip}"</Text>
                ) : null}

                {/* Footer do Card */}
                <View style={styles.cardFooter}>
                  <Text style={styles.logoText}>GeoPost</Text>
                  <Text style={styles.usernameText}>geopost.app/@{post.user?.username}</Text>
                </View>

              </View>

            </View>
          </ViewShot>
        </View>

      </View>

      {/* Botões Bottom */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtnSecondary} onPress={handleSaveToGallery}>
          <Ionicons name="download-outline" size={20} color={colors.text} />
          <Text style={styles.actionBtnTextSecondary}>Salvar na Galeria</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleShare}>
          <Ionicons name="share-social" size={20} color="#FFFFFF" />
          <Text style={styles.actionBtnTextPrimary}>Compartilhar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  centered: {
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
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  viewShotContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: '60%', 
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  placeName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
    marginLeft: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  tipText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#3A3A3C',
    lineHeight: 20,
  },
  cardFooter: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    paddingTop: 12,
  },
  logoText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  usernameText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '500',
  },
  actionBar: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionBtnTextPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  actionBtnTextSecondary: {
    color: '#1C1C1E',
    fontSize: 16,
    fontWeight: '600',
  },
});
