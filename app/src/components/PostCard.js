import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, LayoutAnimation, UIManager, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import StarsRating from './StarsRating';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function PostCard({ post }) {
  const [expanded, setExpanded] = useState(false);
  const navigation = useNavigation();

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const initialAvatar = post.user.name.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initialAvatar}</Text>
          </View>
          <View>
            <Text style={styles.userName}>{post.user.name}</Text>
            <Text style={styles.usernameText}>@{post.user.username}</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textLight} />
        </TouchableOpacity>
      </View>

      {/* Foto */}
      <Image source={{ uri: post.imageUrl }} style={styles.image} />

      {/* Footer / Info */}
      <View style={styles.footer}>
        <View style={styles.placeInfoRow}>
          <Ionicons name="location" size={16} color={colors.primary} style={{ marginTop: 2, marginRight: 2 }} />
          <Text style={styles.placeName}>{post.placeName}</Text>
        </View>
        <Text style={styles.category}>{post.category}</Text>

        {post.rating ? <StarsRating rating={post.rating} size="small" /> : null}

        {/* Legenda com expansão */}
        <Text 
          style={styles.caption} 
          numberOfLines={expanded ? undefined : 2}
        >
          {post.caption}
        </Text>
        
        {!expanded && (
          <TouchableOpacity onPress={toggleExpand} style={styles.moreButton}>
            <Text style={styles.moreText}>ver mais</Text>
          </TouchableOpacity>
        )}

        {/* Ações */}
        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="heart-outline" size={24} color={colors.text} />
              <Text style={styles.actionText}>{post.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
              <Text style={styles.actionText}>{post.comments}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.exploreSimilarButton} onPress={() => navigation.navigate('Explorar')}>
            <Text style={styles.exploreSimilarText}>Explorar similares</Text>
          </TouchableOpacity>
        </View>

        {/* Área expandida */}
        {expanded && (
          <View style={styles.expandedContent}>

            {/* ── Campos do restaurante ─────────── */}
            {post.category === 'restaurant' && (
              <>
                {/* Avaliações por dimensão */}
                {(post.foodRating || post.serviceRating || post.ambienceRating || post.valueRating) && (
                  <View style={styles.extraInfoBox}>
                    {[
                      { label: 'Comida', value: post.foodRating },
                      { label: 'Atendimento', value: post.serviceRating },
                      { label: 'Ambiente', value: post.ambienceRating },
                      { label: 'Custo-benefício', value: post.valueRating },
                    ].filter(d => d.value).map(({ label, value }) => (
                      <View key={label} style={styles.dimensionRow}>
                        <Text style={styles.dimensionLabel}>{label}</Text>
                        <StarsRating rating={value} size="small" />
                      </View>
                    ))}
                  </View>
                )}

                {/* Faixa de preço */}
                {post.priceRange && (
                  <View style={styles.priceRow}>
                    <Ionicons name="cash-outline" size={16} color={colors.primary} />
                    <Text style={styles.priceText}>{post.priceRange}</Text>
                  </View>
                )}

                {/* Best dish */}
                {post.bestDish && (
                  <View style={styles.bestDishRow}>
                    <Ionicons name="restaurant-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.bestDishText}>
                      <Text style={{ fontWeight: '700' }}>Melhor pedido: </Text>
                      {post.bestDish}
                    </Text>
                  </View>
                )}

                {/* Dica em itálico */}
                {post.tip && (
                  <View style={styles.tipBox}>
                    <Text style={styles.tipText}>"{post.tip}"</Text>
                  </View>
                )}

                {/* Chips: cuisine, occasion, mealTime */}
                {post.cuisineTypes?.length > 0 && (
                  <View style={styles.chipsRow}>
                    {post.cuisineTypes.map(c => <View key={c} style={styles.chip}><Text style={styles.chipText}>{c}</Text></View>)}
                  </View>
                )}
                {post.occasions?.length > 0 && (
                  <View style={styles.chipsRow}>
                    {post.occasions.map(o => <View key={o} style={styles.chip}><Text style={styles.chipText}>{o}</Text></View>)}
                  </View>
                )}
                {post.mealTimes?.length > 0 && (
                  <View style={styles.chipsRow}>
                    {post.mealTimes.map(m => <View key={m} style={styles.chip}><Text style={styles.chipText}>{m}</Text></View>)}
                  </View>
                )}

                {/* Would return badge */}
                {post.wouldReturn && (
                  <View style={[
                    styles.wouldReturnBadge,
                    post.wouldReturn === 'Sim' && { backgroundColor: '#D1FAE5' },
                    post.wouldReturn === 'Talvez' && { backgroundColor: '#FEF9C3' },
                    post.wouldReturn === 'Não' && { backgroundColor: '#FEE2E2' },
                  ]}>
                    <Text style={[
                      styles.wouldReturnText,
                      post.wouldReturn === 'Sim' && { color: '#065F46' },
                      post.wouldReturn === 'Talvez' && { color: '#92400E' },
                      post.wouldReturn === 'Não' && { color: '#991B1B' },
                    ]}>
                      {post.wouldReturn === 'Sim' ? '✓ Voltaria' : post.wouldReturn === 'Não' ? '✕ Não voltaria' : '~ Talvez voltasse'}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* ── Campos de ponto turístico ─────── */}
            {post.category === 'tourist' && (
              <>
                {/* Avaliações por dimensão */}
                {(post.experienceRating || post.valueRating || post.accessibilityRating || post.conservationRating) && (
                  <View style={styles.extraInfoBox}>
                    {[
                      { label: 'Experiência', value: post.experienceRating },
                      { label: 'Custo-benefício', value: post.valueRating },
                      { label: 'Acessibilidade', value: post.accessibilityRating },
                      { label: 'Conservação', value: post.conservationRating },
                    ].filter(d => d.value).map(({ label, value }) => (
                      <View key={label} style={styles.dimensionRow}>
                        <Text style={styles.dimensionLabel}>{label}</Text>
                        <StarsRating rating={value} size="small" />
                      </View>
                    ))}
                  </View>
                )}

                {/* Dica principal */}
                {post.touristTip && (
                  <View style={styles.tipBox}>
                    <Text style={styles.tipText}>"{post.touristTip}"</Text>
                  </View>
                )}

                {/* O que não perder */}
                {post.mustSee && (
                  <View style={styles.bestDishRow}>
                    <Ionicons name="eye-outline" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.bestDishText}>
                      <Text style={{ fontWeight: '700' }}>Não perca: </Text>
                      {post.mustSee}
                    </Text>
                  </View>
                )}

                {/* Chips: tipos de atrativo */}
                {post.attractionTypes?.length > 0 && (
                  <View style={styles.chipsRow}>
                    {post.attractionTypes.map(t => <View key={t} style={styles.chip}><Text style={styles.chipText}>{t}</Text></View>)}
                  </View>
                )}

                {/* Info da visita */}
                <View style={styles.extraInfoBox}>
                  {post.visitDuration && (
                    <Text style={styles.extraInfoText}>
                      <Ionicons name="time-outline" size={13} color={colors.textLight} /> <Text style={{ fontWeight: '700' }}>Tempo recomendado:</Text> {post.visitDuration}
                    </Text>
                  )}
                  {post.bestTimeOfDay?.length > 0 && (
                    <Text style={styles.extraInfoText}>
                      <Text style={{ fontWeight: '700' }}>Melhor horário:</Text> {post.bestTimeOfDay.join(', ')}
                    </Text>
                  )}
                  {post.crowdLevel && (
                    <Text style={styles.extraInfoText}>
                      <Text style={{ fontWeight: '700' }}>Lotação:</Text> {post.crowdLevel}
                    </Text>
                  )}
                  {post.wheelchairAccess && (
                    <Text style={styles.extraInfoText}>
                      <Text style={{ fontWeight: '700' }}>♿ Cadeirante:</Text> {post.wheelchairAccess}
                    </Text>
                  )}
                  {post.petsAllowed && (
                    <Text style={styles.extraInfoText}>
                      <Text style={{ fontWeight: '700' }}>🐾 Animais:</Text> {post.petsAllowed}
                    </Text>
                  )}
                </View>

                {/* Would return badge */}
                {post.wouldReturn && (
                  <View style={[
                    styles.wouldReturnBadge,
                    post.wouldReturn === 'Sim' && { backgroundColor: '#D1FAE5' },
                    post.wouldReturn === 'Talvez' && { backgroundColor: '#FEF9C3' },
                    post.wouldReturn === 'Não' && { backgroundColor: '#FEE2E2' },
                  ]}>
                    <Text style={[
                      styles.wouldReturnText,
                      post.wouldReturn === 'Sim' && { color: '#065F46' },
                      post.wouldReturn === 'Talvez' && { color: '#92400E' },
                      post.wouldReturn === 'Não' && { color: '#991B1B' },
                    ]}>
                      {post.wouldReturn === 'Sim' ? '✓ Voltaria' : post.wouldReturn === 'Não' ? '✕ Não voltaria' : '~ Talvez voltasse'}
                    </Text>
                  </View>
                )}
              </>
            )}

            {/* ── Campos legados (metadata) ── */}
            {(post.price || post.entryFee || post.hours || post.tips) && (
              <View style={styles.extraInfoBox}>
                {post.price && <Text style={styles.extraInfoText}><Text style={{ fontWeight: '700' }}>Preço:</Text> {post.price}</Text>}
                {post.entryFee && <Text style={styles.extraInfoText}><Text style={{ fontWeight: '700' }}>Entrada:</Text> {post.entryFee}</Text>}
                {post.hours && <Text style={styles.extraInfoText}><Text style={{ fontWeight: '700' }}>Horários:</Text> {post.hours}</Text>}
                {post.tips && <Text style={styles.extraInfoText}><Text style={{ fontWeight: '700' }}>Dica:</Text> {post.tips}</Text>}
              </View>
            )}

            {/* Mini mapa estático */}
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
                initialRegion={{
                  latitude: post.lat || -23.5505,
                  longitude: post.lng || -46.6333,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker coordinate={{ latitude: post.lat || -23.5505, longitude: post.lng || -46.6333 }}>
                  <Ionicons name="location" size={36} color={colors.primary} />
                </Marker>
              </MapView>
            </View>

            {/* Posts próximos */}
            <View style={styles.similarPostsContainer}>
              <Text style={styles.similarPostsTitle}>Posts próximos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailsScroll}>
                {[1, 2, 3, 4].map((item) => (
                  <View key={item} style={styles.thumbnailWrapper}>
                    <Image source={{ uri: `https://images.unsplash.com/photo-1542314831-c5336928da25?w=200&h=200&fit=crop&q=${Math.random()*100}` }} style={styles.thumbnail} />
                  </View>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={styles.exploreGoButton}
              onPress={() => navigation.navigate('Explorar')}
            >
              <Text style={styles.exploreGoText}>Ver no Explorar</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity onPress={toggleExpand} style={styles.lessButton}>
              <Text style={styles.moreText}>ver menos</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  userName: {
    fontWeight: '600',
    fontSize: 14,
    color: colors.text,
  },
  usernameText: {
    fontSize: 12,
    color: colors.textLight,
  },
  image: {
    width: '100%',
    height: 260,
  },
  footer: {
    padding: 16,
  },
  placeInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  category: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 4,
    marginLeft: 18,
  },
  caption: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginTop: 8,
  },
  moreButton: {
    marginTop: 4,
  },
  moreText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  lessButton: {
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  leftActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  exploreSimilarButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  exploreSimilarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  extraInfoBox: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  extraInfoText: {
    fontSize: 13,
    color: colors.text,
    marginBottom: 4,
  },
  mapContainer: {
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  similarPostsContainer: {
    marginBottom: 16,
  },
  similarPostsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  thumbnailsScroll: {
    paddingRight: 16,
  },
  thumbnailWrapper: {
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 80,
    height: 80,
  },
  exploreGoButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
  },
  exploreGoText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 15,
    marginRight: 8,
  },
  // ── Novos estilos de restaurante ──────────────────────
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dimensionLabel: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
    letterSpacing: 1,
  },
  bestDishRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bestDishText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    flexWrap: 'wrap',
  },
  tipBox: {
    backgroundColor: '#FFF8F3',
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  tipText: {
    fontStyle: 'italic',
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
  },
  wouldReturnBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
    marginBottom: 10,
  },
  wouldReturnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
