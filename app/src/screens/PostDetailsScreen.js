import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

const API = 'https://geopost-production.up.railway.app';

// ── Componentes auxiliares ──────────────────────────────────

/** Estrelas interativas para input */
const StarRatingInput = ({ rating, onRatingChange, size = 36 }) => (
  <View style={{ flexDirection: 'row' }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => onRatingChange(star)} activeOpacity={0.7} style={{ marginRight: 4 }}>
        <Ionicons
          name={star <= rating ? 'star' : 'star-outline'}
          size={size}
          color={star <= rating ? '#FBBF24' : colors.border}
        />
      </TouchableOpacity>
    ))}
  </View>
);

/** Chip de seleção — multi ou single */
const Chip = ({ label, selected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected]}
    activeOpacity={0.7}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

/** Título de seção */
const SectionTitle = ({ title }) => <Text style={styles.sectionTitle}>{title}</Text>;

/** Campo de texto com ícone */
const CustomInput = ({ icon, placeholder, value, onChangeText, multiline, maxLength }) => (
  <View style={[styles.inputContainer, multiline && styles.inputContainerMultiline]}>
    <Ionicons name={icon} size={20} color={colors.textLight} style={styles.inputIcon} />
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      placeholder={placeholder}
      placeholderTextColor={colors.textLight}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      maxLength={maxLength}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

// ── Dados de opções ─────────────────────────────────────────
const CUISINE_OPTIONS = ['Brasileira', 'Italiana', 'Japonesa', 'Árabe', 'Contemporânea', 'Bar/Petiscos', 'Frutos do Mar', 'Vegana/Vegetariana', 'Pizza', 'Outro'];
const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$'];
const OCCASION_OPTIONS = ['Romântico', 'Família', 'Amigos', 'Negócios', 'Solo', 'Data', 'Aniversário'];
const MEAL_TIME_OPTIONS = ['Café da manhã', 'Almoço', 'Jantar', 'Happy Hour', 'Madrugada'];
const WOULD_RETURN_OPTIONS = ['Sim', 'Talvez', 'Não'];

// ── Tela principal ──────────────────────────────────────────
export default function PostDetailsScreen({ route, navigation }) {
  const { type, place, photoUrl, mediaType = 'photo' } = route?.params || { type: 'moment' };

  // Estado geral
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Estado de restaurante
  const [rating, setRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [ambienceRating, setAmbienceRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [priceRange, setPriceRange] = useState('');
  const [occasions, setOccasions] = useState([]);
  const [mealTimes, setMealTimes] = useState([]);
  const [wouldReturn, setWouldReturn] = useState('');
  const [bestDish, setBestDish] = useState('');
  const [tip, setTip] = useState('');

  // Estado de turístico (legado)
  const [entryFee, setEntryFee] = useState('');
  const [hours, setHours] = useState('');
  const [tips, setTips] = useState('');

  const toggleMulti = (value, list, setList) => {
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const token = await AsyncStorage.getItem('@token');

      const body =
        type === 'restaurant'
          ? {
              photoUrl,
              caption,
              rating,
              latitude: -23.5505,
              longitude: -46.6333,
              placeName: place || 'Local desconhecido',
              placeId: 'fake-id',
              category: type,
              mediaType,
              cuisineTypes,
              priceRange,
              occasions,
              mealTimes,
              wouldReturn,
              bestDish,
              tip,
              foodRating,
              serviceRating,
              ambienceRating,
              valueRating,
            }
          : {
              photoUrl,
              caption,
              rating,
              latitude: -23.5505,
              longitude: -46.6333,
              placeName: place || 'Local desconhecido',
              placeId: 'fake-id',
              category: type,
              mediaType,
              extras: { entryFee, hours, tips },
            };

      const res = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Erro ao publicar postagem.');
      navigation.navigate('Feed');
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Seções do formulário de Restaurante ──────────────────
  const renderRestaurantFields = () => (
    <>
      {/* Avaliação geral */}
      <View style={styles.section}>
        <SectionTitle title="Avaliação geral" />
        <StarRatingInput rating={rating} onRatingChange={setRating} size={36} />
      </View>

      {/* Avaliação por dimensão */}
      <View style={styles.section}>
        <SectionTitle title="Avalie por dimensão" />
        {[
          { label: 'Comida', value: foodRating, setter: setFoodRating },
          { label: 'Atendimento', value: serviceRating, setter: setServiceRating },
          { label: 'Ambiente', value: ambienceRating, setter: setAmbienceRating },
          { label: 'Custo-benefício', value: valueRating, setter: setValueRating },
        ].map(({ label, value, setter }) => (
          <View key={label} style={styles.dimensionRow}>
            <Text style={styles.dimensionLabel}>{label}</Text>
            <StarRatingInput rating={value} onRatingChange={setter} size={22} />
          </View>
        ))}
      </View>

      {/* Sobre o lugar */}
      <View style={styles.section}>
        <SectionTitle title="Sobre o lugar" />

        <Text style={styles.fieldLabel}>Tipo de cozinha</Text>
        <View style={styles.chipsWrap}>
          {CUISINE_OPTIONS.map(o => (
            <Chip
              key={o}
              label={o}
              selected={cuisineTypes.includes(o)}
              onPress={() => toggleMulti(o, cuisineTypes, setCuisineTypes)}
            />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Faixa de preço</Text>
        <View style={styles.chipsRow}>
          {PRICE_OPTIONS.map(o => (
            <Chip
              key={o}
              label={o}
              selected={priceRange === o}
              onPress={() => setPriceRange(priceRange === o ? '' : o)}
            />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Ocasião</Text>
        <View style={styles.chipsWrap}>
          {OCCASION_OPTIONS.map(o => (
            <Chip
              key={o}
              label={o}
              selected={occasions.includes(o)}
              onPress={() => toggleMulti(o, occasions, setOccasions)}
            />
          ))}
        </View>

        <Text style={styles.fieldLabel}>Horário da visita</Text>
        <View style={styles.chipsWrap}>
          {MEAL_TIME_OPTIONS.map(o => (
            <Chip
              key={o}
              label={o}
              selected={mealTimes.includes(o)}
              onPress={() => toggleMulti(o, mealTimes, setMealTimes)}
            />
          ))}
        </View>
      </View>

      {/* Sua opinião */}
      <View style={styles.section}>
        <SectionTitle title="Sua opinião" />

        <Text style={styles.fieldLabel}>Melhor pedido</Text>
        <CustomInput
          icon="restaurant-outline"
          placeholder="Ex: Risoto de camarão"
          value={bestDish}
          onChangeText={setBestDish}
        />

        <View style={{ height: 12 }} />
        <Text style={styles.fieldLabel}>Dica ({tip.length}/280)</Text>
        <CustomInput
          icon="bulb-outline"
          placeholder="O que você recomenda para quem for pela primeira vez?"
          value={tip}
          onChangeText={setTip}
          multiline
          maxLength={280}
        />

        <Text style={styles.fieldLabel}>Visitaria novamente?</Text>
        <View style={styles.chipsRow}>
          {WOULD_RETURN_OPTIONS.map(o => (
            <Chip
              key={o}
              label={o}
              selected={wouldReturn === o}
              onPress={() => setWouldReturn(wouldReturn === o ? '' : o)}
            />
          ))}
        </View>
      </View>
    </>
  );

  // ── Seção de Ponto Turístico (legado) ────────────────────
  const renderTouristFields = () => (
    <View style={styles.section}>
      <SectionTitle title="Avaliação" />
      <StarRatingInput rating={rating} onRatingChange={setRating} size={36} />
      <View style={styles.section}>
        <SectionTitle title="Detalhes" />
        <CustomInput icon="ticket-outline" placeholder="Custo de entrada (Grátis, R$ 20...)" value={entryFee} onChangeText={setEntryFee} />
        <View style={{ height: 12 }} />
        <CustomInput icon="time-outline" placeholder="Horário sugerido" value={hours} onChangeText={setHours} />
        <View style={{ height: 12 }} />
        <CustomInput icon="bulb-outline" placeholder="Dicas úteis (O que levar, onde estacionar...)" value={tips} onChangeText={setTips} multiline />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Detalhes</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {errorMsg ? (
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 16, fontWeight: '500' }}>{errorMsg}</Text>
          ) : null}

          {/* Legenda */}
          <View style={styles.section}>
            <SectionTitle title="Legenda" />
            <CustomInput
              icon="chatbox-ellipses-outline"
              placeholder={type === 'moment' ? 'Escreva sobre esse momento...' : 'Conte um pouco sobre sua experiência...'}
              value={caption}
              onChangeText={setCaption}
              multiline
            />
          </View>

          {type === 'restaurant' && renderRestaurantFields()}
          {type === 'tourist' && renderTouristFields()}
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
  scrollContent: { padding: 20, paddingBottom: 40 },

  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 14 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.textLight, marginTop: 16, marginBottom: 8 },

  // Dimensão row
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dimensionLabel: { fontSize: 15, color: colors.text, fontWeight: '500' },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipsRow: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: '#F97316' },
  chipText: { fontSize: 13, fontWeight: '500', color: '#1C1C1E' },
  chipTextSelected: { color: '#FFFFFF' },

  // Inputs
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputContainerMultiline: { alignItems: 'flex-start', paddingTop: 14, minHeight: 100 },
  inputIcon: { marginRight: 12, marginTop: 2 },
  input: { flex: 1, fontSize: 16, color: colors.text, minHeight: 52 },
  inputMultiline: { minHeight: 100 },

  // Footer
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
  publishButtonText: { color: colors.white, fontSize: 17, fontWeight: '600' },
});
