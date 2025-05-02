import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';

export type ServiceItemRowProps = {
    id: string;
    date: string;
    category: string;
    status: string;
    price: number;
    onCancel: (id: string) => void;
};

export default function ServiceItemRow({ id, date, category, status, price, onCancel }: ServiceItemRowProps) {
    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <Text style={styles.text}>🗓️ {date} • {category}</Text>
                <Text style={styles.subtext}>Estado: {status} • Costo: UYU {price}</Text>
            </View>
            <TouchableOpacity onPress={() => onCancel(id)} style={styles.cancelButton}>
                <Ionicons name="close-circle" size={24} color={colors.danger} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: colors.gray,
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 12
    },
    text: {
        fontSize: 19,
        fontWeight: '500'
    },
    subtext: {
        color: colors.black,
        fontSize: 18,
        marginTop: 2
    },
    cancelButton: {
        marginLeft: 12,
        padding: 4
    }
});
