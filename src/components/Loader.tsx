import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

export type LoaderProps = {
    color: string;
    size: number | "small" | "large" | undefined;
};

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
        marginTop: 10,
        justifyContent: 'center'
    }
});

export default React.memo(Loader);
