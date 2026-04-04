import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { logout } = useAuth();

  const handlePress = () => {
    Alert.alert("Em breve", "Essa opção ainda está em desenvolvimento.");
  };

  const OptionItem = ({ title, color = '#1C1C1E', onPress, isLogout = false }) => (
    <TouchableOpacity style={styles.optionContainer} onPress={onPress}>
      <Text style={[styles.optionTitle, { color }]}>{title}</Text>
      {isLogout ? (
        <Ionicons name="log-out-outline" size={20} color={color} />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <View style={styles.sectionCard}>
            <OptionItem title="Editar perfil" onPress={handlePress} />
            <View style={styles.divider} />
            <OptionItem title="Notificações" onPress={handlePress} />
            <View style={styles.divider} />
            <OptionItem title="Privacidade" onPress={handlePress} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <View style={styles.sectionCard}>
            <OptionItem title="Ajuda" onPress={handlePress} />
            <View style={styles.divider} />
            <OptionItem title="Termos de uso" onPress={handlePress} />
            <View style={styles.divider} />
            <OptionItem title="Política de privacidade" onPress={handlePress} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sessão</Text>
          <View style={styles.sectionCard}>
            <OptionItem title="Sair" color="#EF4444" onPress={logout} isLogout={true} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    color: '#1C1C1E',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: 16,
  },
});
