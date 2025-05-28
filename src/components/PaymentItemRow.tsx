import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { Service } from '../types/service';
import { uiTexts } from '../utils/data/ui-text-data';

export type PaymentItemRowProps = {
    item: Service;
    viewService: (item: Service) => void;
    viewUser: (item: Service) => void;
};

/**
 * Specialized version of ServiceItemRow for companions payments.
 */
function PaymentItemRow({ item, viewService, viewUser }: PaymentItemRowProps) {
    return (
        <View style={styles.serviceItem}>
            <Text style={styles.inputText}>📅 {item.dateText ?? uiTexts.noDate} • 📂 {item.category}</Text>
            <Text style={styles.inputText}>💲 {uiTexts.currency} {item.companionPayment} • {item.duration} {uiTexts.hours}</Text>
            <View style={styles.infoButtonRow}>
                <TouchableOpacity style={styles.infoButton} onPress={() => viewService(item)}>
                    <MaterialIcons name="info" size={25} color={colors.header} />
                </TouchableOpacity>
                <TouchableOpacity style={{ ...styles.infoButton }} onPress={() => viewUser(item)}>
                    <Ionicons name="person" size={30} color={colors.success} />
                </TouchableOpacity>
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
    infoButtonRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    infoButton: {
        marginTop: 6
    }
});

export default React.memo(PaymentItemRow);
