import { addHours } from 'date-fns';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, Timestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Layout from '../../components/Layout';
import ServiceCard from '../../components/ServiceCard';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { AppStackParamList } from '../../types/stack-param-list';
import { uiTexts } from '../../utils/data/ui-text-data';
import { update5Minute, updateMinute } from '../../utils/keys/costs-keys';
import { dbKeys } from '../../utils/keys/db-keys';
import { statusKeys, statusTexts } from '../../utils/keys/status-keys';

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

    useEffect(() => {
        if (!serviceData?.date || isStartEnable) return;

        const interval = setInterval(() => {
            const now = new Date();
            const target = serviceData.date.toDate();

            if (now >= target) {
                setIsStartEnable(true);
                clearInterval(interval); // stop checking once condition is met
            }
        }, updateMinute);

        return () => clearInterval(interval); // cleanup on unmount
    }, [serviceData?.date, isStartEnable]);

    useEffect(() => {
        if (!serviceData?.checkInTime) return;

        const now = new Date();
        const interval = setInterval(() => {
            if (now > addHours(serviceData.checkInTime?.toDate() ?? now, serviceData.duration)) {
                setAbleToComplete(true);
                clearInterval(interval); // stop checking once condition is met
            }
        }, update5Minute);

        if (now > addHours(serviceData.checkInTime?.toDate() ?? now, serviceData.duration)) {
            setAbleToComplete(true);
            clearInterval(interval); // stop checking once condition is met
        }

        return () => clearInterval(interval); // cleanup on unmount
    }, [serviceData?.checkInTime, serviceData?.duration]);

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
                    serviceData.checkInTime &&
                    <Pressable style={[styles.button, !ableToComplete && styles.buttonDisabled]} disabled={!ableToComplete} onPress={handleComplete}>
                        <MaterialIcons name="check-circle" size={22} color={colors.white} />
                        <Text style={styles.buttonText}>{uiTexts.endService}</Text>
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
        fontWeight: '600',
        fontSize: 20
    },
    waitForText: {
        color: colors.black,
        fontWeight: '500',
        fontSize: 17
    }
});
