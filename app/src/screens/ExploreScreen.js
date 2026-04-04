import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import StarsRating from '../components/StarsRating';

const EXPLORE_DATA = [
  {
    id: '1',
    user: 'Marta V.',
    placeName: 'Valle Nevado',
    category: 'Momento',
    rating: 0,
    imageUrl: 'https://images.unsplash.com/photo-1542861219-c6e3b2eefbb5?w=800&h=1200&fit=crop',
    caption: 'Frio incrível e muita neve! Melhor temporada até agora, a vista das montanhas é de outro mundo.',
  },
  {
    id: '2',
    user: 'Gui Moura',
    placeName: 'Pão de Açúcar',
    category: 'Ponto Turístico',
    rating: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&h=1200&fit=crop',
    caption: 'O pôr do sol lá de cima não tem igual. Vale cada centavo do ingresso do bondinho.',
  },
  {
    id: '3',
    user: 'Amanda P.',
    placeName: 'Italiano Trattoria',
    category: 'Restaurante/Bar',
    rating: 4.6,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=1200&fit=crop',
    caption: 'Aquele prato de massa artesanal que abraça a alma. O vinho da casa também surpreendeu bastante!',
  },
  {
    id: '4',
    user: 'Bia L.',
    placeName: 'Praia do Rosa',
    category: 'Momento',
    rating: 0,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop',
    caption: 'Sem filtro. Que pico espetacular para passar o verão.',
  },
  {
    id: '5',
    user: 'Carlos O.',
    placeName: 'Café do Bosque',
    category: 'Restaurante/Bar',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=1200&fit=crop',
    caption: 'Café fresquinho e um brownie divino no meio das árvores.',
  },
  {
    id: '6',
    user: 'Julia Q.',
    placeName: 'Museu de Arte',
    category: 'Ponto Turístico',
    rating: 4.5,
    imageUrl: 'https://images.unsplash.com/photo-1518998053401-a48e778912ef?w=800&h=1200&fit=crop',
    caption: 'Exposição irada, instalações interativas muito bem montadas.',
  },
  {
    id: '7',
    user: 'Tito W.',
    placeName: 'Rua das Luzes',
    category: 'Momento',
    rating: 0,
    imageUrl: 'https://images.unsplash.com/photo-1563810141692-7f724d101d29?w=800&h=1200&fit=crop',
    caption: 'Caminhando de noite na região histórica de neon.',
  },
  {
    id: '8',
    user: 'Rebeca',
    placeName: 'Deck Mar',
    category: 'Restaurante/Bar',
    rating: 4.3,
    imageUrl: 'https://images.unsplash.com/photo-1522778526135-18861937ff71?w=800&h=1200&fit=crop',
    caption: 'O drink estava ok mas a porção de camarão tava muito fresca!',
  }
];

export default function ExploreScreen() {
  const [containerHeight, setContainerHeight] = useState(0);

  const renderItem = ({ item }) => {
    return (
      <View style={[styles.itemContainer, { height: containerHeight }]}>
        <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFillObject} />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.85)']}
          style={styles.gradient}
        />

        <View style={styles.sidePanel}>
          <TouchableOpacity style={styles.sideButton}>
            <Ionicons name="heart" size={32} color={colors.white} />
            <Text style={styles.sideText}>12k</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <Ionicons name="chatbubble-ellipses" size={32} color={colors.white} />
            <Text style={styles.sideText}>124</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <Ionicons name="bookmark" size={30} color={colors.white} />
            <Text style={styles.sideText}>Salvar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideButton}>
            <Ionicons name="arrow-redo" size={32} color={colors.white} />
            <Text style={styles.sideText}>Share</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.placeName}>{item.placeName}</Text>
          <View style={styles.row}>
            <Text style={styles.category}>{item.category} • </Text>
            {item.rating > 0 && <StarsRating rating={item.rating} size="small" />}
          </View>
          <Text style={styles.userName}>@{item.user}</Text>
          <Text style={styles.caption} numberOfLines={2}>{item.caption}</Text>
          
          <TouchableOpacity style={styles.detailsButton}>
            <Text style={styles.detailsButtonText}>Ver detalhes</Text>
            <Ionicons name="chevron-up" size={16} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View 
      style={styles.container} 
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      {containerHeight > 0 && (
        <FlatList
          data={EXPLORE_DATA}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={containerHeight}
          snapToAlignment="start"
          decelerationRate="fast"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  itemContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  sidePanel: {
    position: 'absolute',
    right: 12,
    bottom: 110,
    alignItems: 'center',
  },
  sideButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  sideText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  infoContainer: {
    padding: 20,
    paddingRight: 80, 
    paddingBottom: 40,
  },
  placeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  category: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E5E5EA',
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 6,
  },
  caption: {
    fontSize: 14,
    color: colors.white,
    marginTop: 6,
    lineHeight: 20,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  detailsButtonText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 13,
    marginRight: 4,
  },
});