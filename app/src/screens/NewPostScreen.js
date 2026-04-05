import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { colors } from '../theme/colors';

const CLOUD_NAME = Constants.expoConfig?.extra?.cloudinaryCloudName || 'geopost_placeholder';
const UPLOAD_PRESET = Constants.expoConfig?.extra?.cloudinaryUploadPreset || 'geopost_unsigned';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.ios?.config?.googleMapsApiKey || 'AIzaSyA5u0yMtmI3V23lw177o-889C04vC4JIGI';

const POST_TYPES = [
  { id: 'restaurant', title: 'Restaurante/Bar', icon: 'restaurant-outline' },
  { id: 'tourist', title: 'Ponto Turístico', icon: 'map-outline' },
  { id: 'moment', title: 'Momento', icon: 'camera-outline' },
];

export default function NewPostScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState('restaurant');
  const [place, setPlace] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [listVisible, setListVisible] = useState(false);

  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState('photo'); // 'photo' | 'video'
  const [videoRef, setVideoRef] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickMedia = async (type) => {
    const mediaTypeOption =
      type === 'photo'
        ? ImagePicker.MediaTypeOptions.Images
        : ImagePicker.MediaTypeOptions.Videos;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaTypeOption,
      allowsEditing: type === 'photo',
      aspect: [4, 5],
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    if (type === 'video') {
      const durationSec = asset.duration ? asset.duration / 1000 : 0;
      if (durationSec > 90) {
        Alert.alert('Vídeo muito longo', 'O vídeo selecionado passa de 90 segundos. Escolha um vídeo menor.');
        return;
      }
    }

    setMediaType(type);
    uploadMedia(asset, type);
  };

  const uploadMedia = async (asset, type) => {
    setIsUploading(true);
    try {
      const resourceType = type === 'video' ? 'video' : 'image';
      const data = new FormData();
      data.append('file', {
        uri: asset.uri,
        type: type === 'video' ? 'video/mp4' : 'image/jpeg',
        name: type === 'video' ? 'upload.mp4' : 'upload.jpg',
      });
      data.append('upload_preset', UPLOAD_PRESET);
      data.append('cloud_name', CLOUD_NAME);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
        {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json', 'Content-Type': 'multipart/form-data' },
        }
      );
      const result = await res.json();
      setMediaUrl(result.secure_url);
    } catch (e) {
      console.log('Error uploading', e);
      Alert.alert('Erro', 'Não foi possível enviar o arquivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (!mediaUrl) {
      Alert.alert('Atenção', 'Selecione uma foto ou vídeo primeiro!');
      return;
    }
    if (!latitude || !longitude) {
      Alert.alert('Atenção', 'Busque e selecione um local válido!');
      return;
    }
    navigation.navigate('PostDetails', {
      type: selectedType,
      place,
      placeId,
      latitude,
      longitude,
      photoUrl: mediaUrl,
      mediaType,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Post</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Área de mídia */}
          <View style={styles.mediaBox}>
            {isUploading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : mediaUrl && mediaType === 'video' ? (
              <Video
                ref={ref => setVideoRef(ref)}
                source={{ uri: mediaUrl }}
                style={styles.mediaPreview}
                useNativeControls
                resizeMode="cover"
                isLooping={false}
              />
            ) : mediaUrl && mediaType === 'photo' ? (
              <Image source={{ uri: mediaUrl }} style={styles.mediaPreview} />
            ) : (
              <View style={styles.mediaPlaceholder}>
                <Ionicons name="image-outline" size={36} color={colors.textLight} />
                <Text style={styles.mediaPlaceholderText}>Selecione uma foto ou vídeo</Text>
              </View>
            )}
          </View>

          {/* Botões de seleção */}
          <View style={styles.mediaPickerRow}>
            <TouchableOpacity
              style={[styles.mediaPickerBtn, mediaType === 'photo' && mediaUrl && styles.mediaPickerBtnActive]}
              onPress={() => pickMedia('photo')}
              disabled={isUploading}
            >
              <Ionicons name="image-outline" size={20} color={mediaType === 'photo' && mediaUrl ? colors.white : colors.primary} />
              <Text style={[styles.mediaPickerBtnText, mediaType === 'photo' && mediaUrl && styles.mediaPickerBtnTextActive]}>
                Foto
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mediaPickerBtn, mediaType === 'video' && mediaUrl && styles.mediaPickerBtnActive]}
              onPress={() => pickMedia('video')}
              disabled={isUploading}
            >
              <Ionicons name="videocam-outline" size={20} color={mediaType === 'video' && mediaUrl ? colors.white : colors.primary} />
              <Text style={[styles.mediaPickerBtnText, mediaType === 'video' && mediaUrl && styles.mediaPickerBtnTextActive]}>
                Vídeo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Busca de Local (Georreferenciamento) */}
          <View style={[styles.section, { zIndex: 999 }]}>
            <Text style={styles.sectionTitle}>Localização</Text>
            <View style={{ height: 52, zIndex: 999 }}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <GooglePlacesAutocomplete
                  placeholder="Busque o lugar pelo nome..."
                  listViewDisplayed={listVisible}
                  onPress={(data, details = null) => {
                    setListVisible(false);
                    setPlace(details?.name || data.description);
                    setPlaceId(data.place_id);
                    if (details?.geometry?.location) {
                      setLatitude(details.geometry.location.lat);
                      setLongitude(details.geometry.location.lng);
                    }
                  }}
                  query={{
                    key: GOOGLE_PLACES_API_KEY,
                    language: 'pt-BR',
                  }}
                  fetchDetails={true}
                  styles={{
                    textInput: styles.autocompleteInput,
                    listView: styles.autocompleteListView,
                    container: { flex: 0 },
                  }}
                  textInputProps={{
                    placeholderTextColor: colors.textLight,
                    onFocus: () => setListVisible(true),
                    /* remove onBlur to not dismiss early when pressing list items */
                  }}
                />
              </View>
            </View>
            {place ? (
              <Text style={styles.selectedPlaceText}>
                <Ionicons name="location" size={14} color={colors.primary} /> {place} selecionado.
              </Text>
            ) : null}
          </View>

          {/* Tipo de publicação */}
          <View style={[styles.section, { zIndex: 1 }]}>
            <Text style={styles.sectionTitle}>Tipo de publicação</Text>
            <View style={styles.typesContainer}>
              {POST_TYPES.map((type) => {
                const isSelected = selectedType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                    onPress={() => setSelectedType(type.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={type.icon} size={24} color={isSelected ? colors.primary : colors.textLight} />
                    <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>{type.title}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, (!selectedType || !mediaUrl || !latitude) && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!selectedType || !mediaUrl || !latitude}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Próximo</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  scrollContent: { padding: 20 },

  mediaBox: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 16,
    overflow: 'hidden',
  },
  mediaPreview: { width: '100%', height: '100%' },
  mediaPlaceholder: { alignItems: 'center' },
  mediaPlaceholderText: { fontSize: 14, color: colors.textLight, marginTop: 10 },

  mediaPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  mediaPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 10,
    gap: 6,
  },
  mediaPickerBtnActive: { backgroundColor: colors.primary },
  mediaPickerBtnText: { fontSize: 15, fontWeight: '600', color: colors.primary },
  mediaPickerBtnTextActive: { color: colors.white },

  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 17, fontWeight: '600', color: colors.text, marginBottom: 16 },
  
  // Autocomplete
  searchContainer: { 
    backgroundColor: colors.surface, 
    borderRadius: 12, 
    minHeight: 52 
  },
  autocompleteInput: {
    backgroundColor: 'transparent',
    color: colors.text,
    fontSize: 16,
    height: 52,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  autocompleteListView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    marginTop: -1,
  },
  selectedPlaceText: {
    marginTop: 8,
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '500',
  },

  typesContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  typeCard: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeCardSelected: { backgroundColor: '#FFF1E8', borderColor: colors.primary },
  typeText: { marginTop: 8, fontSize: 12, fontWeight: '500', color: colors.textLight, textAlign: 'center' },
  typeTextSelected: { color: colors.primary, fontWeight: '600' },

  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  nextButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonDisabled: { backgroundColor: colors.textLight, shadowOpacity: 0 },
  nextButtonText: { color: colors.white, fontSize: 17, fontWeight: '600', marginRight: 8 },
});
