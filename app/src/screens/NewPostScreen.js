import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { colors } from '../theme/colors';

const CLOUD_NAME = Constants.expoConfig?.extra?.cloudinaryCloudName || 'geopost_placeholder';
const UPLOAD_PRESET = Constants.expoConfig?.extra?.cloudinaryUploadPreset || 'geopost_unsigned';

const POST_TYPES = [
  { id: 'restaurant', title: 'Restaurante/Bar', icon: 'restaurant-outline' },
  { id: 'tourist', title: 'Ponto Turístico', icon: 'map-outline' },
  { id: 'moment', title: 'Momento', icon: 'camera-outline' },
];

export default function NewPostScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState('restaurant');
  const [place, setPlace] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 5],
      quality: 0.8,
    });

    if (!result.canceled) {
      uploadToCloudinary(result.assets[0]);
    }
  };

  const uploadToCloudinary = async (asset) => {
    setIsUploading(true);
    try {
      const data = new FormData();
      data.append('file', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'upload.jpg'
      });
      data.append('upload_preset', UPLOAD_PRESET);
      data.append('cloud_name', CLOUD_NAME);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      });
      const result = await res.json();
      setPhotoUrl(result.secure_url);
    } catch (e) {
      console.log('Error uploading image', e);
      alert('Erro ao enviar imagem.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleNext = () => {
    if (!photoUrl) {
      alert('Selecione uma foto primeiro!');
      return;
    }
    navigation.navigate('PostDetails', { type: selectedType, place, photoUrl });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Novo Post</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.photoContainer} onPress={pickImage} disabled={isUploading}>
            {isUploading ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : photoUrl ? (
              <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%', borderRadius: 16 }} />
            ) : (
              <>
                <View style={styles.photoIconWrapper}>
                  <Ionicons name="image-outline" size={32} color={colors.textLight} />
                </View>
                <Text style={styles.photoText}>Selecionar foto da galeria</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.section}>
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
                    <Ionicons 
                      name={type.icon} 
                      size={24} 
                      color={isSelected ? colors.primary : colors.textLight} 
                    />
                    <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>
                      {type.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Onde foi?</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="search" size={20} color={colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Busque por um lugar..."
                placeholderTextColor={colors.textLight}
                value={place}
                onChangeText={setPlace}
              />
            </View>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.nextButton, !selectedType && styles.nextButtonDisabled]}
            onPress={handleNext}
            disabled={!selectedType}
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  scrollContent: {
    padding: 20,
  },
  photoContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 32,
  },
  photoIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  photoText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textLight,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
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
  typeCardSelected: {
    backgroundColor: '#FFF1E8', // Leve laranja de fundo
    borderColor: colors.primary,
  },
  typeText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: colors.textLight,
    textAlign: 'center',
  },
  typeTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    height: '100%',
  },
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
  nextButtonDisabled: {
    backgroundColor: colors.textLight,
    shadowOpacity: 0,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
    marginRight: 8,
  },
});
