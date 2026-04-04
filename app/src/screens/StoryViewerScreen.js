import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;

export default function StoryViewerScreen({ route, navigation }) {
  const { user, avatar } = route.params || { user: 'User', avatar: null };
  const [progress, setProgress] = useState(0);

  // Imagem de story estática baseada num placeholder para caso de teste
  const storyImage = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1200&fit=crop';

  useEffect(() => {
    let timer;
    if (progress < 1) {
      timer = setInterval(() => {
        setProgress(prev => {
          if (prev >= 1) {
            clearInterval(timer);
            return 1;
          }
          return prev + 0.01; // atualiza a cada 50ms (0.01 de 100%)
        });
      }, STORY_DURATION / 100);
    } else {
      handleClose();
    }
    return () => clearInterval(timer);
  }, [progress]);

  const handleClose = () => {
    navigation.goBack();
  };

  const handlePress = (evt) => {
    const x = evt.nativeEvent.locationX;
    if (x < width * 0.3) {
      setProgress(0); // Reinicia ao focar a esquerda (idealmente voltava um story, mas como tem 1 mock só reiniciamos)
    } else {
      handleClose(); // Tocou na direita, tenta avançar (fechamos pois só tem 1 no mock)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS !== 'ios' && <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />}
      <View style={styles.storyContainer}>
        <Image source={{ uri: storyImage }} style={styles.image} />
        
        {/* Overlay Dark Limitado */}
        <View style={styles.overlay} />

        {/* Action Taps */}
        <TouchableOpacity activeOpacity={1} style={styles.touchArea} onPress={handlePress} />

        {/* UI Elements */}
        <View style={styles.topUI}>
          {/* Progress Bar Container */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarFilled, { width: `${progress * 100}%` }]} />
          </View>
          
          <View style={styles.headerRow}>
            <View style={styles.userInfo}>
              {avatar && <Image source={{ uri: avatar }} style={styles.avatar} />}
              <Text style={styles.username}>{user}</Text>
              <Text style={styles.timeMark}>2h</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={32} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomUI}>
          <TouchableOpacity style={styles.locationChip}>
            <Ionicons name="location" size={14} color={colors.text} />
            <Text style={styles.bottomPlace}>Praia do Rosa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyContainer: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  touchArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  topUI: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 12,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    marginBottom: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressBarFilled: {
    height: '100%',
    backgroundColor: colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.white,
  },
  username: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timeMark: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 8,
  },
  closeBtn: {
    padding: 4,
  },
  bottomUI: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  locationChip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  bottomPlace: {
    marginLeft: 6,
    fontWeight: '700',
    color: colors.text,
    fontSize: 14,
  },
});
