import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Componente para Avaliação de Estrelas
const StarRating = ({ rating, onRatingChange }) => {
  return (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity key={star} onPress={() => onRatingChange(star)} activeOpacity={0.7}>
          <Ionicons 
            name={star <= rating ? "star" : "star-outline"} 
            size={36} 
            color={star <= rating ? "#FBBF24" : colors.border} 
            style={styles.starIcon}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Input Field Componente Auxiliar
const CustomInput = ({ icon, placeholder, value, onChangeText, multiline, keyboardType }) => (
  <View style={[styles.inputContainer, multiline && styles.inputContainerMultiline]}>
    <Ionicons name={icon} size={20} color={colors.textLight} style={styles.inputIcon} />
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      placeholder={placeholder}
      placeholderTextColor={colors.textLight}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      keyboardType={keyboardType || 'default'}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PostDetailsScreen({ route, navigation }) {
  const { type, place, photoUrl } = route?.params || { type: 'moment' };

  const [caption, setCaption] = useState('');
  const [rating, setRating] = useState(0);
  const [price, setPrice] = useState('');
  const [hours, setHours] = useState('');
  const [entryFee, setEntryFee] = useState('');
  const [tips, setTips] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handlePublish = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const token = await AsyncStorage.getItem('@token');
      const extras = { price, hours, entryFee, tips };
      
      const res = await fetch('https://geopost-production.up.railway.app/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          photoUrl,
          caption,
          rating,
          latitude: -23.5505, 
          longitude: -46.6333, 
          placeName: place || 'Local desconhecido',
          placeId: 'fake-id',
          category: type,
          extras
        })
      });
      
      if (!res.ok) throw new Error('Erro ao publicar postagem.');

      navigation.navigate('Feed');
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldsForType = () => {
    if (type === 'restaurant') {
      return (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliação</Text>
            <StarRating rating={rating} onRatingChange={setRating} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes</Text>
            <CustomInput icon="cash-outline" placeholder="Preço médio por pessoa (ex: R$ 40 - R$ 80)" value={price} onChangeText={setPrice} />
            <View style={styles.spacing} />
            <CustomInput icon="time-outline" placeholder="Melhor horário pra visitar" value={hours} onChangeText={setHours} />
          </View>
        </>
      );
    }
    
    if (type === 'tourist') {
      return (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Avaliação</Text>
            <StarRating rating={rating} onRatingChange={setRating} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalhes</Text>
            <CustomInput icon="ticket-outline" placeholder="Custo de entrada (Grátis, R$ 20...)" value={entryFee} onChangeText={setEntryFee} />
            <View style={styles.spacing} />
            <CustomInput icon="time-outline" placeholder="Horário sugerido" value={hours} onChangeText={setHours} />
            <View style={styles.spacing} />
            <CustomInput icon="bulb-outline" placeholder="Dicas úteis (O que levar, onde estacionar...)" value={tips} onChangeText={setTips} multiline />
          </View>
        </>
      );
    }

    return null; // 'moment' não tem campos adicionais
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {errorMsg ? (
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 16, fontWeight: '500' }}>
              {errorMsg}
            </Text>
          ) : null}
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legenda</Text>
            <CustomInput 
              icon="chatbox-ellipses-outline" 
              placeholder={type === 'moment' ? "Escreva sobre esse momento..." : "Conte um pouco sobre sua experiência..."} 
              value={caption} 
              onChangeText={setCaption} 
              multiline 
            />
          </View>

          {renderFieldsForType()}

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.publishButton}
            onPress={handlePublish}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.publishButtonText}>Publicar Post</Text>
            )}
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
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  starIcon: {
    marginRight: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingTop: 14,
    minHeight: 100,
  },
  inputIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    minHeight: 52,
  },
  inputMultiline: {
    minHeight: 100,
  },
  spacing: {
    height: 12,
  },
  footer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  publishButton: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  publishButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
