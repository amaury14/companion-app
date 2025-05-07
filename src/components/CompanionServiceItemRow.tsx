import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { Service } from '../types/service';
import { statusTexts } from '../utils/keys/status-keys';

export type CompanionServiceItemRowProps = {
    ableAccept: boolean;
    acceptService: (id: string) => void;
    item: Service;
    rejectService: (id: string) => void;
};

function CompanionServiceItemRow({ ableAccept, item, acceptService, rejectService }: CompanionServiceItemRowProps) {
    return (
        <View style={styles.serviceItem}>
            <Text style={styles.inputText}>📅 {item.dateText ?? 'Sin fecha'} • {item.category} • {item.status}</Text>
            <Text style={styles.inputText}>💲 UYU {item.companionPayment} • {item.duration} hora(s)</Text>
            <Text style={styles.inputText}>📍 {item.locationText || 'Dirección no disponible'}</Text>
            <View style={styles.buttonRow}>
                {
                    ableAccept &&
                    <TouchableOpacity style={styles.button} onPress={() => acceptService(item.id)}>
                        <Text style={styles.buttonText}>Aceptar</Text>
                    </TouchableOpacity>
                }
                {
                    item.status !== statusTexts.in_progress &&
                    <TouchableOpacity style={{ ...styles.button, backgroundColor: colors.danger }} onPress={() => rejectService(item.id)}>
                        <Text style={styles.buttonText}>Rechazar</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    serviceItem: {
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        marginBottom: 8,
        padding: 12,
        paddingHorizontal: 8,
        paddingVertical: 12
    },
    inputText: {
        color: colors.black,
        fontSize: 16,
        fontWeight: '500'
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.header,
        borderRadius: 8,
        marginLeft: 5,
        paddingHorizontal: 6,
        paddingVertical: 3
    },
    buttonText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold'
    }
});

export default React.memo(CompanionServiceItemRow);
