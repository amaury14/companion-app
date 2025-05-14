import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, increment, Timestamp, updateDoc } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';

import Layout from '../../components/Layout';
import ServiceCard from '../../components/ServiceCard';
import { useUser } from '../../context/UserContext';
import { CompanionStackParamList } from '../../navigation/CompanionStack/CompanionStack';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { uiTexts } from '../../utils/data/ui-text-data';
import { dbKeys } from '../../utils/keys/db-keys';
import { statusKeys, statusTexts } from '../../utils/keys/status-keys';

type Props = NativeStackScreenProps<CompanionStackParamList, 'ActiveService'>;

const ActiveServiceScreen = ({ navigation }: Props) => {
    const route = useRoute<RouteProp<CompanionStackParamList, 'ActiveService'>>();
    const { service } = route.params;
    const { user } = useUser();

    const [serviceData, setServiceData] = useState<Service>(service);
    const [isFuture, setIsFuture] = useState<boolean>(true);

    useEffect(() => {
        if (serviceData?.date) {
            setIsFuture(new Date() < serviceData.date.toDate());
        }
    }, [serviceData?.date]);

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
            console.error(uiTexts.erroOnStartingService, error);
            Alert.alert(`❌ ${uiTexts.erroOnStartingService}`);
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
            if (user?.id) {
                await updateDoc(doc(db, dbKeys.users, user?.id), { completedServices: increment(1) });
            }
            if (serviceData?.requesterId) {
                await updateDoc(doc(db, dbKeys.users, serviceData?.requesterId), { completedServices: increment(1) });
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
                <ServiceCard serviceData={serviceData}></ServiceCard>
                {
                    !serviceData.checkInTime &&
                    <Pressable style={[styles.button, isFuture && styles.buttonDisabled]} disabled={isFuture} onPress={handleStart}>
                        <MaterialIcons name="arrow-right" size={22} color={colors.white} />
                        <Text style={styles.buttonText}>{uiTexts.startService}</Text>
                    </Pressable>
                }
                {
                    isFuture &&
                    <Text style={styles.waitForText}>{uiTexts.waitForServicedTime}</Text>
                }
                {
                    serviceData.checkInTime &&
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
