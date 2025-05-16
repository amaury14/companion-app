import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

export type LoaderProps = {
    color: string;
    size: number | "small" | "large" | undefined;
};

/**
 * Simple centralized loading spinner component used throughout the app.
 */
function Loader({ color, size }: LoaderProps) {
    return (
        <View style={styles.indicatorContent}>
            <ActivityIndicator size={size} color={color} />
        </View>
    );
}

const styles = StyleSheet.create({
    indicatorContent: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10
    }
});

export default React.memo(Loader);
