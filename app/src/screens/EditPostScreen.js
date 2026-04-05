import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, SafeAreaView, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';

const API = 'https://geopost-production.up.railway.app';
const GOOGLE_PLACES_API_KEY = Constants.expoConfig?.ios?.config?.googleMapsApiKey || 'AIzaSyA5u0yMtmI3V23lw177o-889C04vC4JIGI';

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
export default function EditPostScreen({ route, navigation }) {
  const { post } = route.params;
  const type = post.category || 'moment';
  const photoUrl = post.imageUrl;
  const mediaType = post.mediaType || 'photo';

  const [placeName, setPlaceName] = useState(post.placeName || '');
  const [placeId, setPlaceId] = useState(post.placeId || '');
  const [latitude, setLatitude] = useState(post.latitude || null);
  const [longitude, setLongitude] = useState(post.longitude || null);
  const [listVisible, setListVisible] = useState(false);

  const [caption, setCaption] = useState(post.caption || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Campos compartilhados
  const [rating, setRating] = useState(post.rating || 0);
  const [wouldReturn, setWouldReturn] = useState(post.wouldReturn || '');

  // Restaurante
  const [foodRating, setFoodRating] = useState(post.foodRating || 0);
  const [serviceRating, setServiceRating] = useState(post.serviceRating || 0);
  const [ambienceRating, setAmbienceRating] = useState(post.ambienceRating || 0);
  const [valueRating, setValueRating] = useState(post.valueRating || 0);
  const [cuisineTypes, setCuisineTypes] = useState(post.cuisineTypes || []);
  const [priceRange, setPriceRange] = useState(post.priceRange || '');
  const [occasions, setOccasions] = useState(post.occasions || []);
  const [mealTimes, setMealTimes] = useState(post.mealTimes || []);
  const [bestDish, setBestDish] = useState(post.bestDish || '');
  const [tip, setTip] = useState(post.tip || '');

  // Ponto Turístico
  const [experienceRating, setExperienceRating] = useState(post.experienceRating || 0);
  const [valueRatingT, setValueRatingT] = useState(post.valueRating || 0);
  const [accessibilityRating, setAccessibilityRating] = useState(post.accessibilityRating || 0);
  const [conservationRating, setConservationRating] = useState(post.conservationRating || 0);
  const [attractionTypes, setAttractionTypes] = useState(post.attractionTypes || []);
  const [visitDuration, setVisitDuration] = useState(post.visitDuration || '');
  const [bestSeason, setBestSeason] = useState(post.bestSeason || []);
  const [bestTimeOfDay, setBestTimeOfDay] = useState(post.bestTimeOfDay || []);
  const [crowdLevel, setCrowdLevel] = useState(post.crowdLevel || '');
  const [howToGetThere, setHowToGetThere] = useState(post.howToGetThere || []);
  const [wheelchairAccess, setWheelchairAccess] = useState(post.wheelchairAccess || '');
  const [petsAllowed, setPetsAllowed] = useState(post.petsAllowed || '');
  const [touristTip, setTouristTip] = useState(post.touristTip || '');
  const [mustSee, setMustSee] = useState(post.mustSee || '');

  const toggleMulti = (value, list, setList) =>
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);

  // ── Validações de publicação ─────────────────────────────
  const canPublishRestaurant = rating > 0;
  const canPublishTourist = rating > 0 && touristTip.trim().length > 0 && wouldReturn !== '';
  const canPublish =
    type === 'restaurant' ? canPublishRestaurant :
    type === 'tourist' ? canPublishTourist : true;

  const handleUpdate = async () => {
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
          caption, rating, placeName, placeId, latitude, longitude,
          cuisineTypes, priceRange, occasions, mealTimes, wouldReturn,
          bestDish, tip, foodRating, serviceRating, ambienceRating, valueRating,
        };
      } else if (type === 'tourist') {
        body = {
          caption, rating, placeName, placeId, latitude, longitude,
          attractionTypes, visitDuration, bestSeason, bestTimeOfDay, crowdLevel,
          howToGetThere, wheelchairAccess, petsAllowed, touristTip, mustSee,
          experienceRating, accessibilityRating: accessibilityRating, conservationRating,
          valueRating: valueRatingT, wouldReturn,
        };
      } else {
        body = { caption, rating, placeName, placeId, latitude, longitude };
      }

      const res = await fetch(`${API}/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Erro ao salvar postagem.');
      navigation.goBack(); // Volta para tela SinglePost
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

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Mídia não editável */}
          <View style={{ marginBottom: 20, alignItems: 'center', zIndex: 1 }}>
            {photoUrl && <Image source={{ uri: photoUrl }} style={{ width: '100%', height: 200, borderRadius: 12, opacity: 0.8 }} />}
            <Text style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: 4, borderRadius: 4, fontSize: 12 }}>Mídia original</Text>
          </View>

          {errorMsg ? (
            <Text style={{ color: 'red', textAlign: 'center', marginBottom: 16, fontWeight: '500', zIndex: 1 }}>{errorMsg}</Text>
          ) : null}

          {/* Busca de Local (Georreferenciamento) */}
          <View style={[styles.section, { zIndex: 999 }]}>
            <SectionTitle title="Localização" />
            <View style={{ height: 52, zIndex: 999 }}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <GooglePlacesAutocomplete
                  placeholder="Busque o lugar pelo nome..."
                  getDefaultValue={() => placeName}
                  listViewDisplayed={listVisible}
                  onPress={(data, details = null) => {
                    setListVisible(false);
                    setPlaceName(details?.name || data.description);
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
                    defaultValue: placeName,
                    onFocus: () => setListVisible(true),
                  }}
                />
              </View>
            </View>
            {placeName ? (
              <Text style={styles.selectedPlaceText}>
                <Ionicons name="location" size={14} color={colors.primary} /> {placeName} selecionado.
              </Text>
            ) : null}
          </View>

          <View style={[styles.section, { zIndex: 1 }]}>
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
            onPress={handleUpdate}
            disabled={isSubmitting || !canPublish}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.publishButtonText}>Salvar Alterações</Text>
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
});
