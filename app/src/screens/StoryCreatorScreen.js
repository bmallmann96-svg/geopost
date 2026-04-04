import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function StoryCreatorScreen({ navigation }) {
  const [markedPlace, setMarkedPlace] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.cameraView}>
        <View style={styles.cameraHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={32} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setMarkedPlace(!markedPlace)} 
            style={[styles.placeButton, markedPlace && styles.placeButtonActive]}
          >
            <Ionicons name="location" size={18} color={markedPlace ? colors.primary : colors.white} />
            <Text style={[styles.placeButtonText, markedPlace && styles.placeButtonTextActive]}>
              {markedPlace ? 'Casa Marques' : 'Marcar Lugar'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center UI */}
        <View style={styles.centerHelper}>
          <Ionicons name="camera-outline" size={64} color="rgba(255,255,255,0.4)" />
          <Text style={styles.helperText}>[Câmera Simulada]</Text>
          <Text style={styles.helperSubText}>Pressione p/ foto, segure p/ vídeo (Max 30s)</Text>
          
          <View style={styles.privacySticker}>
            {markedPlace ? (
              <Text style={styles.privacyText}>Aparecerá publicamente no mapa do local (24h)</Text>
            ) : (
              <Text style={styles.privacyText}>Aparecerá apenas para seguidores (24h)</Text>
            )}
          </View>
        </View>

        {/* Bottom Shutter UI */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.shutterButton} onPress={() => navigation.goBack()}>
             <View style={styles.shutterInner} />
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
  cameraView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  placeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  placeButtonActive: {
    backgroundColor: 'white',
  },
  placeButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  placeButtonTextActive: {
    color: colors.primary,
  },
  centerHelper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helperText: {
    color: colors.white,
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  helperSubText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 8,
    fontSize: 14,
  },
  privacySticker: {
    marginTop: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  privacyText: {
    color: colors.white,
    fontSize: 12,
  },
  bottomControls: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
  },
});
