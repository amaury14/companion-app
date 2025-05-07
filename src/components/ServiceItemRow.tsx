import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { statusTexts } from '../utils/keys/status-keys';
import { getStatusIcon } from '../utils/util';

export type ServiceItemRowProps = {
    category: string;
    date: string;
    id: string;
    price: number;
    status: string;
    duration: number;
    onCancel: (id: string) => void;
};

function ServiceItemRow({ id, date, category, status, price, duration, onCancel }: ServiceItemRowProps) {
    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <Text style={styles.text}>{getStatusIcon(status)} {date} • {category}</Text>
                <Text style={styles.subtext}>Estado: {status} • Costo: 💲UYU {price} • {duration} hora(s)</Text>
            </View>
            {
                status === statusTexts.pending &&
                <TouchableOpacity onPress={() => onCancel(id)} style={styles.cancelButton}>
                    <Ionicons name="close-circle" size={35} color={colors.danger} />
                </TouchableOpacity>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        flexDirection: 'row',
        marginBottom: 8,
        padding: 12,
        paddingHorizontal: 8,
        paddingVertical: 12
    },
    text: {
        fontSize: 18,
        fontWeight: '500'
    },
    subtext: {
        color: colors.black,
        fontSize: 16,
        marginTop: 2
    },
    cancelButton: {
        marginLeft: 12,
        padding: 4
    }
});

export default React.memo(ServiceItemRow);
