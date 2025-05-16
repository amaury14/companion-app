import { MaterialIcons } from '@expo/vector-icons';
import { doc, increment, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Layout from '../../components/Layout';
import ServiceCard from '../../components/ServiceCard';
import { useUser } from '../../context/UserContext';
import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { uiTexts } from '../../utils/data/ui-text-data';
import { statusTexts } from '../../utils/keys/status-keys';
import { dbKeys } from '../../utils/keys/db-keys';

type Props = NativeStackScreenProps<UserStackParamList, 'UserActiveService'>;

/**
 * Shows detailed information about an ongoing service from the user's perspective, with status, companion info, and time tracking.
 */
export default function UserActiveServiceScreen({ navigation }: Props) {
    const route = useRoute<RouteProp<UserStackParamList, 'UserActiveService'>>();
    const { service } = route.params;
    const [serviceData, setServiceData] = useState<Service>(service);
    const { user } = useUser();

    const handleComplete = async () => {
        try {
            await updateDoc(doc(db, dbKeys.services, serviceData.id), { confirmed: true });
            setServiceData({
                ...serviceData,
                confirmed: true
            });
            if (user?.id) {
                await updateDoc(doc(db, dbKeys.users, user?.id), { completedServices: increment(1) });
            }
            if (serviceData?.companionId) {
                await updateDoc(doc(db, dbKeys.users, serviceData?.companionId), { completedServices: increment(1) });
            }
            Alert.alert(`✅ ${uiTexts.serviceCompleted}`);
            navigation.navigate('UserHome');
        } catch (error) {
            console.error(uiTexts.errorOnCompleteService, error);
            Alert.alert(`❌ ${uiTexts.errorOnCompleteService}`);
        }
    };

    return (
        <Layout>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.header}>{uiTexts.serviceOngoing}</Text>
                <ServiceCard serviceData={serviceData}></ServiceCard>
                {
                    serviceData.status === statusTexts.completed && !serviceData.confirmed &&
                    <Pressable
                        style={styles.button}
                        onPress={() => {
                            Alert.alert(uiTexts.confirmService, uiTexts.areYouSure, [
                                { text: uiTexts.no, style: 'cancel' },
                                {
                                    text: uiTexts.yes,
                                    style: 'destructive',
                                    onPress: () => handleComplete()
                                }
                            ])
                        }}
                    >
                        <MaterialIcons name="check-circle" size={22} color={colors.white} />
                        <Text style={styles.buttonText}>{uiTexts.confirmService}</Text>
                    </Pressable>
                }
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        padding: 20
    },
    header: {
        color: colors.white,
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 16
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.azureblue,
        borderRadius: 10,
        flexDirection: 'row',
        gap: 8,
        justifyContent: 'center',
        padding: 12
    },
    buttonDisabled: {
        backgroundColor: colors.gray
    },
    buttonText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '600'
    },
    waitForText: {
        color: colors.black,
        fontSize: 17,
        fontWeight: '500'
    }
});
