import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function StarsRating({ rating, size = 'small' }) {
  const isLarge = size === 'large';
  const iconSize = isLarge ? 20 : 14;
  const ratingTextSize = isLarge ? 16 : 12;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={iconSize}
          color={star <= rating ? colors.primary : colors.border}
          style={styles.star}
        />
      ))}
      {rating > 0 && (
        <Text style={[styles.ratingText, { fontSize: ratingTextSize }]}>
          {rating.toFixed(1)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  star: {
    marginRight: 2,
  },
  ratingText: {
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 4,
  },
});
