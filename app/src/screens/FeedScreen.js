import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export default function FeedScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>GeoPost</Text>
            <Text style={styles.subtitle}>Seu feed de lugares</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.primary,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textLight,
        marginTop: 8,
    },
})