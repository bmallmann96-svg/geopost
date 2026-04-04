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

const Chip = ({ label, selected, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.chip, selected && styles.chipSelected]} activeOpacity={0.7}>
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </TouchableOpacity>
);

const SectionTitle = ({ title, required }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {required && <Text style={styles.requiredBadge}> obrigatório</Text>}
  </View>
);

const FieldLabel = ({ label, optional }) => (
  <Text style={styles.fieldLabel}>
    {label}
    {optional && <Text style={styles.optionalText}> (opcional)</Text>}
  </Text>
);

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

// ── Opções ──────────────────────────────────────────────────
const CUISINE_OPTIONS = ['Brasileira', 'Italiana', 'Japonesa', 'Árabe', 'Contemporânea', 'Bar/Petiscos', 'Frutos do Mar', 'Vegana/Vegetariana', 'Pizza', 'Outro'];
const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$'];
const OCCASION_OPTIONS = ['Romântico', 'Família', 'Amigos', 'Negócios', 'Solo', 'Data', 'Aniversário'];
const MEAL_TIME_OPTIONS = ['Café da manhã', 'Almoço', 'Jantar', 'Happy Hour', 'Madrugada'];
const WOULD_RETURN_OPTIONS = ['Sim', 'Talvez', 'Não'];

const ATTRACTION_TYPES = ['Monumento', 'Museu', 'Parque', 'Praia', 'Trilha', 'Cachoeira', 'Centro histórico', 'Mirante', 'Religioso', 'Parque temático', 'Outro'];
const VISIT_DURATION_OPTIONS = ['Menos de 1h', '1-2h', '2-4h', 'Dia inteiro'];
const BEST_SEASON_OPTIONS = ['Jan-Mar', 'Abr-Jun', 'Jul-Set', 'Out-Dez'];
const BEST_TIME_OPTIONS = ['Manhã', 'Tarde', 'Anoitecer', 'Qualquer'];
const CROWD_LEVEL_OPTIONS = ['Tranquilo', 'Moderado', 'Muito lotado'];
const HOW_TO_GET_THERE_OPTIONS = ['A pé', 'Carro', 'Transporte público', 'Barco', 'Trilha'];
const WHEELCHAIR_OPTIONS = ['Sim', 'Parcialmente', 'Não'];
const PETS_OPTIONS = ['Sim', 'Não'];

// ── Tela principal ──────────────────────────────────────────
export default function PostDetailsScreen({ route, navigation }) {
  const { type, place, photoUrl, mediaType = 'photo' } = route?.params || { type: 'moment' };

  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Campos compartilhados
  const [rating, setRating] = useState(0);
  const [wouldReturn, setWouldReturn] = useState('');

  // Restaurante
  const [foodRating, setFoodRating] = useState(0);
  const [serviceRating, setServiceRating] = useState(0);
  const [ambienceRating, setAmbienceRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [cuisineTypes, setCuisineTypes] = useState([]);
  const [priceRange, setPriceRange] = useState('');
  const [occasions, setOccasions] = useState([]);
  const [mealTimes, setMealTimes] = useState([]);
  const [bestDish, setBestDish] = useState('');
  const [tip, setTip] = useState('');

  // Ponto Turístico
  const [experienceRating, setExperienceRating] = useState(0);
  const [valueRatingT, setValueRatingT] = useState(0);
  const [accessibilityRating, setAccessibilityRating] = useState(0);
  const [conservationRating, setConservationRating] = useState(0);
  const [attractionTypes, setAttractionTypes] = useState([]);
  const [visitDuration, setVisitDuration] = useState('');
  const [bestSeason, setBestSeason] = useState([]);
  const [bestTimeOfDay, setBestTimeOfDay] = useState([]);
  const [crowdLevel, setCrowdLevel] = useState('');
  const [howToGetThere, setHowToGetThere] = useState([]);
  const [wheelchairAccess, setWheelchairAccess] = useState('');
  const [petsAllowed, setPetsAllowed] = useState('');
  const [touristTip, setTouristTip] = useState('');
  const [mustSee, setMustSee] = useState('');

  const toggleMulti = (value, list, setList) =>
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);

  // ── Validações de publicação ─────────────────────────────
  const canPublishRestaurant = rating > 0;
  const canPublishTourist = rating > 0 && touristTip.trim().length > 0 && wouldReturn !== '';
  const canPublish =
    type === 'restaurant' ? canPublishRestaurant :
    type === 'tourist' ? canPublishTourist : true;

  const handlePublish = async () => {
    if (type === 'tourist' && !canPublishTourist) {
      Alert.alert('Campos obrigatórios', 'Preencha: Avaliação geral, Dica principal e Visitaria novamente.');
      return;
    }
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const token = await AsyncStorage.getItem('@token');
      let body;

      if (type === 'restaurant') {
        body = {
          photoUrl, caption, rating,
          latitude: -23.5505, longitude: -46.6333,
          placeName: place || 'Local desconhecido', placeId: 'fake-id', category: type, mediaType,
          cuisineTypes, priceRange, occasions, mealTimes, wouldReturn,
          bestDish, tip, foodRating, serviceRating, ambienceRating, valueRating,
        };
      } else if (type === 'tourist') {
        body = {
          photoUrl, caption, rating,
          latitude: -23.5505, longitude: -46.6333,
          placeName: place || 'Local desconhecido', placeId: 'fake-id', category: type, mediaType,
          attractionTypes, visitDuration, bestSeason, bestTimeOfDay, crowdLevel,
          howToGetThere, wheelchairAccess, petsAllowed, touristTip, mustSee,
          experienceRating, accessibilityRating: accessibilityRating, conservationRating,
          valueRating: valueRatingT, wouldReturn,
        };
      } else {
        body = {
          photoUrl, caption, rating,
          latitude: -23.5505, longitude: -46.6333,
          placeName: place || 'Local desconhecido', placeId: 'fake-id', category: type, mediaType,
        };
      }

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

  // ── Formulário de Restaurante ────────────────────────────
  const renderRestaurantFields = () => (
    <>
      <View style={styles.section}>
        <SectionTitle title="Avaliação geral" required />
        <StarRatingInput rating={rating} onRatingChange={setRating} size={36} />
      </View>

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

      <View style={styles.section}>
        <SectionTitle title="Sobre o lugar" />
        <FieldLabel label="Tipo de cozinha" optional />
        <View style={styles.chipsWrap}>
          {CUISINE_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={cuisineTypes.includes(o)} onPress={() => toggleMulti(o, cuisineTypes, setCuisineTypes)} />
          ))}
        </View>
        <FieldLabel label="Faixa de preço" optional />
        <View style={styles.chipsRow}>
          {PRICE_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={priceRange === o} onPress={() => setPriceRange(priceRange === o ? '' : o)} />
          ))}
        </View>
        <FieldLabel label="Ocasião" optional />
        <View style={styles.chipsWrap}>
          {OCCASION_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={occasions.includes(o)} onPress={() => toggleMulti(o, occasions, setOccasions)} />
          ))}
        </View>
        <FieldLabel label="Horário da visita" optional />
        <View style={styles.chipsWrap}>
          {MEAL_TIME_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={mealTimes.includes(o)} onPress={() => toggleMulti(o, mealTimes, setMealTimes)} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle title="Sua opinião" />
        <FieldLabel label="Melhor pedido" optional />
        <CustomInput icon="restaurant-outline" placeholder="Ex: Risoto de camarão" value={bestDish} onChangeText={setBestDish} />
        <View style={{ height: 12 }} />
        <FieldLabel label={`Dica (${tip.length}/280)`} optional />
        <CustomInput icon="bulb-outline" placeholder="O que você recomenda para quem for pela primeira vez?" value={tip} onChangeText={setTip} multiline maxLength={280} />
        <FieldLabel label="Visitaria novamente?" optional />
        <View style={styles.chipsRow}>
          {WOULD_RETURN_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={wouldReturn === o} onPress={() => setWouldReturn(wouldReturn === o ? '' : o)} />
          ))}
        </View>
      </View>
    </>
  );

  // ── Formulário de Ponto Turístico ────────────────────────
  const renderTouristFields = () => (
    <>
      {/* Avaliação geral — obrigatório */}
      <View style={styles.section}>
        <SectionTitle title="Avaliação geral" required />
        <StarRatingInput rating={rating} onRatingChange={setRating} size={36} />
      </View>

      {/* Avalie por dimensão — opcional */}
      <View style={styles.section}>
        <SectionTitle title="Avalie por dimensão" />
        {[
          { label: 'Experiência', value: experienceRating, setter: setExperienceRating },
          { label: 'Custo-benefício', value: valueRatingT, setter: setValueRatingT },
          { label: 'Acessibilidade', value: accessibilityRating, setter: setAccessibilityRating },
          { label: 'Conservação', value: conservationRating, setter: setConservationRating },
        ].map(({ label, value, setter }) => (
          <View key={label} style={styles.dimensionRow}>
            <Text style={styles.dimensionLabel}>{label}<Text style={styles.optionalText}> (opcional)</Text></Text>
            <StarRatingInput rating={value} onRatingChange={setter} size={22} />
          </View>
        ))}
      </View>

      {/* Sobre a visita — opcional */}
      <View style={styles.section}>
        <SectionTitle title="Sobre a visita" />

        <FieldLabel label="Tipo de atrativo" optional />
        <View style={styles.chipsWrap}>
          {ATTRACTION_TYPES.map(o => (
            <Chip key={o} label={o} selected={attractionTypes.includes(o)} onPress={() => toggleMulti(o, attractionTypes, setAttractionTypes)} />
          ))}
        </View>

        <FieldLabel label="Tempo recomendado" optional />
        <View style={styles.chipsWrap}>
          {VISIT_DURATION_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={visitDuration === o} onPress={() => setVisitDuration(visitDuration === o ? '' : o)} />
          ))}
        </View>

        <FieldLabel label="Melhor época" optional />
        <View style={styles.chipsWrap}>
          {BEST_SEASON_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={bestSeason.includes(o)} onPress={() => toggleMulti(o, bestSeason, setBestSeason)} />
          ))}
        </View>

        <FieldLabel label="Melhor horário" optional />
        <View style={styles.chipsWrap}>
          {BEST_TIME_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={bestTimeOfDay.includes(o)} onPress={() => toggleMulti(o, bestTimeOfDay, setBestTimeOfDay)} />
          ))}
        </View>

        <FieldLabel label="Lotação" optional />
        <View style={styles.chipsRow}>
          {CROWD_LEVEL_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={crowdLevel === o} onPress={() => setCrowdLevel(crowdLevel === o ? '' : o)} />
          ))}
        </View>
      </View>

      {/* Acesso — opcional */}
      <View style={styles.section}>
        <SectionTitle title="Acesso" />

        <FieldLabel label="Como chegar" optional />
        <View style={styles.chipsWrap}>
          {HOW_TO_GET_THERE_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={howToGetThere.includes(o)} onPress={() => toggleMulti(o, howToGetThere, setHowToGetThere)} />
          ))}
        </View>

        <FieldLabel label="Acessível para cadeirantes" optional />
        <View style={styles.chipsRow}>
          {WHEELCHAIR_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={wheelchairAccess === o} onPress={() => setWheelchairAccess(wheelchairAccess === o ? '' : o)} />
          ))}
        </View>

        <FieldLabel label="Permite animais" optional />
        <View style={styles.chipsRow}>
          {PETS_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={petsAllowed === o} onPress={() => setPetsAllowed(petsAllowed === o ? '' : o)} />
          ))}
        </View>
      </View>

      {/* Sua opinião */}
      <View style={styles.section}>
        <SectionTitle title="Sua opinião" />

        <FieldLabel label={`Dica principal (${touristTip.length}/280)`} />
        <Text style={styles.requiredHint}>* obrigatório</Text>
        <CustomInput
          icon="bulb-outline"
          placeholder="O que você recomenda para quem vai pela primeira vez?"
          value={touristTip}
          onChangeText={setTouristTip}
          multiline
          maxLength={280}
        />

        <View style={{ height: 12 }} />
        <FieldLabel label="O que não perder" optional />
        <CustomInput
          icon="eye-outline"
          placeholder="Ex: Pôr do sol visto do mirante"
          value={mustSee}
          onChangeText={setMustSee}
        />

        <FieldLabel label="Visitaria novamente?" />
        <Text style={styles.requiredHint}>* obrigatório</Text>
        <View style={styles.chipsRow}>
          {WOULD_RETURN_OPTIONS.map(o => (
            <Chip key={o} label={o} selected={wouldReturn === o} onPress={() => setWouldReturn(wouldReturn === o ? '' : o)} />
          ))}
        </View>
      </View>
    </>
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
            style={[styles.publishButton, !canPublish && styles.publishButtonDisabled]}
            onPress={handlePublish}
            disabled={isSubmitting || !canPublish}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.publishButtonText}>Publicar Post</Text>
            )}
          </TouchableOpacity>
          {!canPublish && type === 'tourist' && (
            <Text style={styles.publishHint}>Preencha: avaliação, dica principal e se visitaria novamente</Text>
          )}
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
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  requiredBadge: { fontSize: 12, fontWeight: '600', color: colors.primary },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: colors.textLight, marginTop: 16, marginBottom: 8 },
  optionalText: { fontSize: 12, fontWeight: '400', color: '#AEAEB2', fontStyle: 'italic' },
  requiredHint: { fontSize: 12, color: colors.primary, marginTop: -6, marginBottom: 8 },

  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dimensionLabel: { fontSize: 15, color: colors.text, fontWeight: '500', flex: 1 },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  publishButtonDisabled: { backgroundColor: '#D1D1D6', shadowOpacity: 0 },
  publishButtonText: { color: colors.white, fontSize: 17, fontWeight: '600' },
  publishHint: { textAlign: 'center', color: '#8E8E93', fontSize: 12, marginTop: 8 },
});
