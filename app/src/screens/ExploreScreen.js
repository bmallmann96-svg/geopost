import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export default function ExploreScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Explorar</Text>
            <Text style={styles.subtitle}>Descubra lugares perto de você</Text>
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