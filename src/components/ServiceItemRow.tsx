import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { Service } from '../types/service';
import { statusTexts } from '../utils/keys/status-keys';
import { getStatusIcon } from '../utils/util';

export type ServiceItemRowProps = {
    item: Service;
    onCancel: (id: string) => void;
    onViewCompanion: (item: Service) => void;
};

function ServiceItemRow({ item, onCancel, onViewCompanion }: ServiceItemRowProps) {
    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <Text style={styles.text}>{getStatusIcon(item.status)} {item.dateText} • {item.category}</Text>
                <Text style={styles.subtext}>Estado: {item.status} • Costo: 💲UYU {item.price} • {item.duration} hora(s)</Text>
            </View>
            {
                item.status === statusTexts.pending &&
                <TouchableOpacity onPress={() => onCancel(item.id)} style={styles.cancelButton}>
                    <Ionicons name="close-circle" size={35} color={colors.danger} />
                </TouchableOpacity>
            }
            {
                item.status === statusTexts.in_progress &&
                <TouchableOpacity onPress={() => onViewCompanion(item)} style={styles.cancelButton}>
                    <Ionicons name="person-outline" size={35} color={colors.franceblue} />
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
