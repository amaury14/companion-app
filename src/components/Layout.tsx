import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import { colors } from '../theme/colors';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            {children}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        flex: 1
    }
});
