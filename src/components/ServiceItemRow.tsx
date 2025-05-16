import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../theme/colors';
import { Service } from '../types/service';
import { uiTexts } from '../utils/data/ui-text-data';
import { statusTexts } from '../utils/keys/status-keys';
import { getStatusIcon } from '../utils/util';

export type ServiceItemRowProps = {
    item: Service;
    manageService: (item: Service) => void;
    onCancel: (id: string) => void;
    onViewCompanion: (item: Service) => void;
};

/**
 * Reusable row component for displaying a summary of a service, with status, location, and quick action buttons (e.g., cancel).
 */
function ServiceItemRow({ item, manageService, onCancel, onViewCompanion }: ServiceItemRowProps) {
    return (
        <View style={styles.container}>
            <View style={{ flex: 1 }}>
                <Text style={styles.text}>{getStatusIcon(item.status)} {item.dateText}</Text>
                <Text style={styles.text}>{item.category}</Text>
                <Text style={styles.subtext}>
                    {uiTexts.status}: {item.status}
                    {
                        item.status != statusTexts.cancelled &&
                        <Text> • {uiTexts.cost}: 💲{uiTexts.currency} {item.price} • {item.duration} {uiTexts.hours}</Text>
                    }
                </Text>
            </View>
            <View style={styles.buttonHolder}>
            {
                (
                    item.status === statusTexts.in_progress ||
                    item.status === statusTexts.accepted ||
                    (item.status === statusTexts.completed && !item.confirmed)
                ) &&
                <TouchableOpacity onPress={() => manageService(item)} style={styles.cancelButton}>
                    <Ionicons name="settings" size={30} color={colors.dragonblue} />
                </TouchableOpacity>
            }
            {
                item.status === statusTexts.pending &&
                <TouchableOpacity onPress={() => onCancel(item.id)} style={styles.cancelButton}>
                    <Ionicons name="close-circle" size={30} color={colors.danger} />
                </TouchableOpacity>
            }
            {
                (
                    item.status === statusTexts.in_progress ||
                    item.status === statusTexts.accepted ||
                    item.status === statusTexts.completed
                ) &&
                <TouchableOpacity onPress={() => onViewCompanion(item)} style={styles.cancelButton}>
                    <Ionicons name="person" size={30} color={colors.success} />
                </TouchableOpacity>
            }
            </View>
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
    buttonHolder: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    cancelButton: {
        padding: 4
    }
});

export default React.memo(ServiceItemRow);
