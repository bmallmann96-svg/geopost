import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meu Perfil</Text>
            <Text style={styles.subtitle}>Seus lugares no mapa</Text>
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