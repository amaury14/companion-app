import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, increment, Timestamp, updateDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { differenceInHours, differenceInMinutes } from 'date-fns';
import * as Progress from 'react-native-progress';

import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { CompanionStackParamList } from '../../navigation/CompanionStack/CompanionStack';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { uiTexts } from '../../utils/data/ui-text-data';
import { updateTime } from '../../utils/keys/costs-keys';
import { dbKeys } from '../../utils/keys/db-keys';
import { statusKeys, statusTexts } from '../../utils/keys/status-keys';

type Props = NativeStackScreenProps<CompanionStackParamList, 'ActiveService'>;

const ActiveServiceScreen = ({ navigation }: Props) => {
    const route = useRoute<RouteProp<CompanionStackParamList, 'ActiveService'>>();
    const { service } = route.params;
    const { user } = useUser();

    const getElapsedTime = (startTime: Date) => {
        if (startTime) {
            const now = new Date();
            const diffHours = differenceInHours(now, startTime);
            const diffMin = differenceInMinutes(now, startTime);
            return diffMin > 60 ? `${diffHours} ${uiTexts.hours}` : `${diffMin} ${uiTexts.min}`;
        }
        return `0 ${uiTexts.min}`;
    }

    const [serviceData, setServiceData] = useState<Service>(service);
    const [elapsedTime, setElapsedTime] = useState<string>(
        service?.startTime ? getElapsedTime(service.startTime?.toDate()) : `0 ${uiTexts.min}`
    );
    const [isFuture, setIsFuture] = useState<boolean>(true);

    useEffect(() => {
        if (serviceData?.startTime) {
            const start = serviceData.startTime.toDate();
            const interval = setInterval(() => {
                setElapsedTime(getElapsedTime(start));
            }, updateTime);

            return () => clearInterval(interval);
        }
    }, [serviceData?.startTime]);

    useEffect(() => {
        if (serviceData?.date) {
            setIsFuture(new Date() < serviceData.date.toDate());
        }
    }, [serviceData?.date]);

    const handleStart = async () => {
        try {
            const startTime = new Date();
            await updateDoc(doc(db, dbKeys.services, serviceData.id), { status: statusKeys.in_progress, startTime });
            setServiceData({
                ...serviceData,
                startTime: Timestamp.fromDate(startTime),
                status: statusTexts.in_progress
            });
            Alert.alert(`⏳ ${uiTexts.serviceStarted}`);
        } catch (error) {
            console.error(uiTexts.erroOnStartingService, error);
            Alert.alert(`❌ ${uiTexts.erroOnStartingService}`);
        }
    };

    const handleComplete = async () => {
        try {
            const endTime = new Date();
            await updateDoc(doc(db, dbKeys.services, serviceData.id), { status: statusKeys.completed, endTime });
            setServiceData({
                ...serviceData,
                status: statusTexts.completed,
                endTime: Timestamp.fromDate(endTime)
            });
            if (user?.id) {
                await updateDoc(doc(db, dbKeys.users, user?.id), { completedServices: increment(1) });
            }
            Alert.alert(`✅ ${uiTexts.serviceCompleted}`);
            navigation.navigate('CompanionHome');
        } catch (error) {
            console.error(uiTexts.errorOnCompleteService, error);
            Alert.alert(`❌ ${uiTexts.errorOnCompleteService}`);
        }
    };

    return (
        <Layout>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.header}>{uiTexts.serviceOngoing}</Text>

                <View style={styles.card}>
                    <Info label={`📅 ${uiTexts.date}`} value={serviceData.dateText ?? uiTexts.notAvailable} />
                    <Info label={`📍 ${uiTexts.location}`} value={serviceData.locationText ?? uiTexts.notAvailable} />
                    <Info label={`📂 ${uiTexts.category}`} value={serviceData.category} />
                    <Info label={`⏱ ${uiTexts.estimatedDuration}`} value={`${serviceData.duration} ${uiTexts.hours}`} />
                    <Info label={`⏳ ${uiTexts.elapsedTime}`} value={`${elapsedTime}`} />
                    <Info label={`🧑‍⚕️ ${uiTexts.companionPayment}`} value={`${uiTexts.currency} ${serviceData.companionPayment}`} />
                    <Info label={`📌 ${uiTexts.status}`} value={serviceData.status} />
                    {
                        serviceData.status === statusTexts.in_progress &&
                        <Progress.Bar color={colors.franceblue} height={15} indeterminate={true} unfilledColor={colors.gray} width={null} />
                    }
                </View>

                {
                    !serviceData.startTime &&
                    <Pressable style={[styles.button, isFuture && styles.buttonDisabled]} disabled={isFuture} onPress={handleStart}>
                        <MaterialIcons name="arrow-right" size={22} color={colors.white} />
                        <Text style={styles.buttonText}>{uiTexts.startService}</Text>
                    </Pressable>
                }
                {
                    serviceData.startTime &&
                    <Pressable style={styles.button} onPress={handleComplete}>
                        <MaterialIcons name="check-circle" size={22} color={colors.white} />
                        <Text style={styles.buttonText}>{uiTexts.endService}</Text>
                    </Pressable>
                }
            </ScrollView>
        </Layout>
    );
};

export default ActiveServiceScreen;

const Info = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

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
    card: {
        backgroundColor: colors.lightGray,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 20,
        padding: 16,
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 8
    },
    infoRow: {
        marginBottom: 12
    },
    infoLabel: {
        color: colors.black,
        fontSize: 16
    },
    infoValue: {
        color: colors.black,
        fontSize: 18,
        fontWeight: '500'
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
        fontWeight: '600',
        fontSize: 20
    }
});
