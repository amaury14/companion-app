import { MaterialIcons } from '@expo/vector-icons';
import { doc, increment, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Text, StyleSheet, ScrollView, Pressable, Alert, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import ServiceCard from '../../components/ServiceCard';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { AppStackParamList } from '../../types/stack-param-list';
import { uiTexts } from '../../utils/data/ui-text-data';
import { dbKeys } from '../../utils/keys/db-keys';
import { statusTexts } from '../../utils/keys/status-keys';
import ReviewForm from '../Review/ReviewForm';

type Props = NativeStackScreenProps<AppStackParamList, 'UserActiveService'>;

/**
 * Shows detailed information about an ongoing service from the user's perspective, with status, companion info, and time tracking.
 */
export default function UserActiveServiceScreen({ navigation }: Props) {
    const route = useRoute<RouteProp<AppStackParamList, 'UserActiveService'>>();
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
            Alert.alert(`✅ ${uiTexts.serviceCompleted}`, `${uiTexts.reviewService}`);
        } catch (error) {
            console.error(uiTexts.errorOnCompleteService, error);
            Alert.alert(`❌ ${uiTexts.errorOnCompleteService}`);
        }
    };

    return (
        <Layout>
            <Header title={uiTexts.serviceOngoing}></Header>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <ServiceCard handleTime={true} serviceData={serviceData}></ServiceCard>
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
                {
                    serviceData.status === statusTexts.completed && serviceData.confirmed &&
                    <View style={{ marginBottom: 5 }}>
                        <ReviewForm
                            reviewerId={serviceData.requesterId}
                            reviewedUserId={serviceData.companionId}
                            serviceId={serviceData.id}
                            onSuccess={() => navigation.navigate('UserHome')}
                        ></ReviewForm>
                    </View>
                }
                <View style={styles.bottomButtonsBar}>
                    <Pressable style={styles.button} onPress={() => navigation.navigate('ChatScreen', { chatId: serviceData.id })}>
                        <MaterialIcons name="chat-bubble" size={22} color={colors.white} />
                        <Text style={styles.buttonText}>{uiTexts.messaging}</Text>
                    </Pressable>
                    <Pressable style={styles.button} onPress={() => navigation.navigate('ServiceTracking', {
                        serviceId: serviceData.id,
                        destination: serviceData.location ?? { latitude: 0, longitude: 0 }
                    })}>
                        <MaterialIcons name="map" size={22} color={colors.white} />
                        <Text style={styles.buttonText}>{uiTexts.trackService}</Text>
                    </Pressable>
                </View>
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
    button: {
        alignItems: 'center',
        backgroundColor: colors.azureblue,
        borderRadius: 10,
        flexDirection: 'row',
        gap: 8,
        marginBottom: 5,
        marginRight: 5,
        justifyContent: 'center',
        padding: 5
    },
    buttonDisabled: {
        backgroundColor: colors.gray
    },
    buttonText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: '600'
    },
    bottomButtonsBar: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    waitForText: {
        color: colors.black,
        fontSize: 17,
        fontWeight: '500'
    }
});
