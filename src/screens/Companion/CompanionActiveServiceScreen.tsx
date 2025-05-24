import { addHours } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, Pressable, Alert, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import ServiceCard from '../../components/ServiceCard';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { AppStackParamList } from '../../types/stack-param-list';
import { uiTexts } from '../../utils/data/ui-text-data';
import { update10Seconds, update5Minute } from '../../utils/keys/costs-keys';
import { dbKeys } from '../../utils/keys/db-keys';
import { statusKeys, statusTexts } from '../../utils/keys/status-keys';
import ReviewForm from '../Review/ReviewForm';

type Props = NativeStackScreenProps<AppStackParamList, 'CompanionActiveService'>;

/**
 * Displays real-time service progress, including a timer and animated progress bar. Allows marking the service as complete.
 */
export default function CompanionActiveServiceScreen({ navigation }: Props) {
    const route = useRoute<RouteProp<AppStackParamList, 'CompanionActiveService'>>();
    const { service } = route.params;

    const [serviceData, setServiceData] = useState<Service>(service);
    const [isStartEnable, setIsStartEnable] = useState<boolean>(false);
    const [ableToComplete, setAbleToComplete] = useState<boolean>(false);

    const checkStartTime = (interval: NodeJS.Timeout, target: Date) => {
        if (new Date() >= target) {
            setIsStartEnable(true);
            clearInterval(interval); // stop checking once condition is met
        }
    };

    const checkCompleteTime = useCallback((interval: NodeJS.Timeout) => {
        if (new Date() > addHours(serviceData.checkInTime?.toDate() ?? new Date(), serviceData.duration)) {
            setAbleToComplete(true);
            clearInterval(interval); // stop checking once condition is met
        }
    }, [serviceData]);

    useEffect(() => {
        if (!serviceData?.date || isStartEnable) return;

        const target = serviceData.date.toDate();
        const interval = setInterval(() => {
            checkStartTime(interval, target);
        }, update10Seconds);

        checkStartTime(interval, target);

        return () => clearInterval(interval); // cleanup on unmount
    }, [serviceData?.date, isStartEnable]);

    useEffect(() => {
        if (!serviceData?.checkInTime) return;

        const interval = setInterval(() => {
            checkCompleteTime(interval);
        }, update5Minute);

        checkCompleteTime(interval);

        return () => clearInterval(interval); // cleanup on unmount
    }, [serviceData, checkCompleteTime]);

    const handleStart = async () => {
        try {
            const checkInTime = new Date();
            await updateDoc(doc(db, dbKeys.services, serviceData.id), { status: statusKeys.in_progress, checkInTime });
            setServiceData({
                ...serviceData,
                checkInTime: Timestamp.fromDate(checkInTime),
                status: statusTexts.in_progress
            });
            Alert.alert(`⏳ ${uiTexts.serviceStarted}`);
        } catch (error) {
            console.error(uiTexts.errorOnStartingService, error);
            Alert.alert(`❌ ${uiTexts.errorOnStartingService}`);
        }
    };

    const handleComplete = async () => {
        try {
            const checkOutTime = new Date();
            await updateDoc(doc(db, dbKeys.services, serviceData.id), { status: statusKeys.completed, checkOutTime });
            setServiceData({
                ...serviceData,
                checkOutTime: Timestamp.fromDate(checkOutTime),
                status: statusTexts.completed
            });
            Alert.alert(`✅ ${uiTexts.serviceCompleted}`, uiTexts.askClientConfirm);
        } catch (error) {
            console.error(uiTexts.errorOnCompleteService, error);
            Alert.alert(`❌ ${uiTexts.errorOnCompleteService}`);
        }
    };

    return (
        <Layout>
            <Header title={uiTexts.serviceOngoing}></Header>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <ServiceCard serviceData={serviceData}></ServiceCard>
                {
                    !serviceData.checkInTime &&
                    <Pressable style={[styles.button, !isStartEnable && styles.buttonDisabled]} disabled={!isStartEnable} onPress={handleStart}>
                        <MaterialIcons name="arrow-right" size={35} color={colors.white} />
                        <Text style={styles.buttonText}>{uiTexts.startService}</Text>
                    </Pressable>
                }
                {
                    !isStartEnable && !serviceData.checkInTime &&
                    <Text style={styles.waitForText}>{uiTexts.waitForServicedTime}</Text>
                }
                {
                    serviceData.checkInTime && serviceData.status === statusTexts.in_progress &&
                    <Pressable style={[styles.button, !ableToComplete && styles.buttonDisabled]} disabled={!ableToComplete} onPress={handleComplete}>
                        <MaterialIcons name="check-circle" size={22} color={colors.white} />
                        <Text style={styles.buttonText}>{uiTexts.endService}</Text>
                    </Pressable>
                }
                {
                    serviceData.status === statusTexts.completed &&
                    <View style={{ marginBottom: 5 }}>
                        <ReviewForm
                            reviewerId={serviceData.companionId}
                            reviewedUserId={serviceData.requesterId}
                            serviceId={serviceData.id}
                            onSuccess={() => navigation.navigate('CompanionHome')}
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
        fontWeight: '600',
        fontSize: 20
    },
    bottomButtonsBar: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    waitForText: {
        color: colors.black,
        fontWeight: '500',
        fontSize: 17
    }
});
