import { isSameDay } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';

import { colors } from '../theme/colors';
import { Service } from '../types/service';
import { uiTexts } from '../utils/data/ui-text-data';
import { statusTexts } from '../utils/keys/status-keys';

export type CompanionServiceItemRowProps = {
    acceptService: (id: string) => void;
    item: Service;
    manageService: (item: Service) => void;
    rejectService: (id: string) => void;
    viewService: (item: Service) => void;
};

/**
 * Specialized version of ServiceItemRow for companions, showing accept/reject buttons and proximity details.
 */
function CompanionServiceItemRow({ acceptService, item, manageService, rejectService, viewService }: CompanionServiceItemRowProps) {
    const isActive = item.status === statusTexts.pending || item.status === statusTexts.in_progress || item.status === statusTexts.accepted;

    return (
        <View style={styles.serviceItem}>
            <Text style={styles.inputText}>📅 {item.dateText ?? uiTexts.noDate}</Text>
            <Text style={styles.inputText}>📂 {item.category} • {item.status}</Text>
            {
                isActive &&
                <Text style={styles.inputText}>💡 {item.additionalInfo}</Text>
            }
            <Text style={styles.inputText}>💲 {uiTexts.currency} {item.companionPayment} • {item.duration} {uiTexts.hours}</Text>
            {
                isActive &&
                <Text style={styles.inputText}>📍 {item.locationText || uiTexts.noAddress}</Text>
            }
            <Pressable style={styles.infoButton} onPress={() => viewService(item)}>
                <MaterialIcons name="info-outline" size={25} color={colors.black} />
            </Pressable>
            {
                isActive &&
                <View style={styles.buttonRow}>
                    {
                        (item.status === statusTexts.in_progress || item.status === statusTexts.accepted) &&
                        <TouchableOpacity style={{ ...styles.button, backgroundColor: colors.azureblue }} onPress={() => manageService(item)}>
                            <Text style={styles.buttonText}>{uiTexts.manage}</Text>
                        </TouchableOpacity>
                    }
                    {
                        item.status === statusTexts.pending && isSameDay(item.date.toDate(), new Date()) &&
                        <TouchableOpacity style={styles.button} onPress={() => acceptService(item.id)}>
                            <Text style={styles.buttonText}>{uiTexts.accept}</Text>
                        </TouchableOpacity>
                    }
                    {
                        item.status === statusTexts.pending &&
                        <TouchableOpacity style={{ ...styles.button, backgroundColor: colors.danger }} onPress={() => rejectService(item.id)}>
                            <Text style={styles.buttonText}>{uiTexts.reject}</Text>
                        </TouchableOpacity>
                    }
                </View>
            }
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
    },
    infoButton: {
        marginTop: 6
    }
});

export default React.memo(CompanionServiceItemRow);
