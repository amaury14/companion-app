import React from 'react';
import { KeyboardAvoidingView, SafeAreaView, StyleSheet, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';

import { colors } from '../theme/colors';

/**
 * General screen wrapper with gradient background, SafeAreaView, and optional scroll handling.
 */
function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient
                colors={[colors.azureblue, colors.franceblue, colors.argentinianblue]}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <StatusBar barStyle="light-content" backgroundColor="black" />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    {children}
                </KeyboardAvoidingView>
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

export default React.memo(Layout);
