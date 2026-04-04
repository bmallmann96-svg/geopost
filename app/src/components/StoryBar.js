import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

const MOCK_STORIES = [
  { id: '1', user: 'Bruno M.', hasUnseen: false, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' },
  { id: '2', user: 'Ana Paula', hasUnseen: true, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop' },
  { id: '3', user: 'Carlos S.', hasUnseen: true, avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop' },
  { id: '4', user: 'Fernanda', hasUnseen: true, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop' },
  { id: '5', user: 'Lucas', hasUnseen: false, avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop' },
];

export default function StoryBar() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Meu Story (Add) */}
        <TouchableOpacity 
          style={styles.storyItem} 
          onPress={() => navigation.navigate('StoryCreator')}
        >
          <View style={styles.addIconContainer}>
            <Ionicons name="add" size={32} color={colors.white} />
          </View>
          <Text style={styles.storyText}>Seu story</Text>
        </TouchableOpacity>

        {/* Stories de Outros */}
        {MOCK_STORIES.map((story) => (
          <TouchableOpacity 
            key={story.id} 
            style={styles.storyItem}
            onPress={() => navigation.navigate('StoryViewer', { storyId: story.id, user: story.user, avatar: story.avatar })}
          >
            <View style={[styles.avatarWrapper, story.hasUnseen && styles.unseenBorder]}>
              <Image source={{ uri: story.avatar }} style={styles.avatarImage} />
            </View>
            <Text style={styles.storyText} numberOfLines={1}>{story.user}</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 68,
  },
  addIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatarWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  unseenBorder: {
    borderColor: colors.primary,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  storyText: {
    fontSize: 11,
    color: colors.text,
    textAlign: 'center',
  },
});
