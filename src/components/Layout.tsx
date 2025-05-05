import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

import { colors } from '../theme/colors';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[colors.azureblue, colors.franceblue, colors.argentinianblue]}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <StatusBar barStyle="light-content" backgroundColor="black" />
                {children}
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        flex: 1
    },
    gradient: {
        flex: 1
    }
});
