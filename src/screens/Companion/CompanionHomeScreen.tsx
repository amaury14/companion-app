import { collection, getDocs, updateDoc, doc, query, where, setDoc, serverTimestamp } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import CompanionServiceItemRow from '../../components/CompanionServiceItemRow';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import UserHeader from '../../components/UserHeader';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { AppStackParamList } from '../../types/stack-param-list';
import { categoryData } from '../../utils/data/category-data';
import { statusData } from '../../utils/data/status.data';
import { uiTexts } from '../../utils/data/ui-text-data';
import { radioKilometers, update5Minute } from '../../utils/keys/costs-keys';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { statusKeys } from '../../utils/keys/status-keys';
import { scheduleReminder } from '../../utils/notifications';
import { formatDateWithTime, getAddressFromCoords, getDistanceFromLatLonInKm, sortServices } from '../../utils/util';

type Props = NativeStackScreenProps<AppStackParamList, 'CompanionHome'>;

/**
 * Main screen for companions. Lists available nearby services filtered by distance and allows accepting/rejecting and manage them.
 */
export default function CompanionHomeScreen({ navigation }: Props) {
    const [refreshing, setRefreshing] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [servicesRejected, setServicesRejected] = useState<string[]>([]);
    const { user } = useUser();

    const fetchServices = useCallback(async () => {
        try {
            const uid = user?.id;
            if (!uid) return;
            setRefreshing(true);

            const queryObjPending = query(
                collection(db, dbKeys.services),
                where(fieldKeys.status, '==', statusKeys.pending)
            );
            const queryObjCompanion = query(
                collection(db, dbKeys.services),
                where(fieldKeys.companionId, '==', uid)
            );
            const pending = await getDocs(queryObjPending);
            const companion = await getDocs(queryObjCompanion);
            const resultsStatus = pending?.docs?.map(doc => ({ id: doc.id, ...doc.data() } as Service));
            const resultsCompanion = companion?.docs?.map(doc => ({ id: doc.id, ...doc.data() } as Service));

            const resultsStatusPromises = resultsStatus?.map(async data => {
                if (servicesRejected?.includes(data.id)) return null;

                const distance = getDistanceFromLatLonInKm(
                    user?.address?.latitude ?? 0,
                    user?.address?.longitude ?? 0,
                    data.location?.latitude ?? 0,
                    data.location?.longitude ?? 0
                );
                if (distance > radioKilometers) return null;

                const locationText = data.location?.latitude && data.location?.longitude
                    ? await getAddressFromCoords(data.location.latitude, data.location.longitude)
                    : uiTexts.noAddress;

                return {
                    ...data,
                    category: categoryData.find(item => item.value === data.category)?.name ?? data.category,
                    status: statusData.find(item => item.value === data.status)?.name ?? data.status,
                    dateText: formatDateWithTime(data.date?.toDate()) || uiTexts.noDate,
                    timeStamp: data.date?.toMillis(),
                    locationText
                } as Service;
            });
            const resultsCompanionPromises = resultsCompanion?.map(async data => {
                const locationText = data.location?.latitude && data.location?.longitude
                    ? await getAddressFromCoords(data.location.latitude, data.location.longitude)
                    : uiTexts.noAddress;

                return {
                    ...data,
                    category: categoryData.find(item => item.value === data.category)?.name ?? data.category,
                    status: statusData.find(item => item.value === data.status)?.name ?? data.status,
                    dateText: formatDateWithTime(data.date?.toDate()) || uiTexts.noDate,
                    timeStamp: data.date?.toMillis(),
                    locationText
                } as Service;
            });
            const allResults = await Promise.all([
                ...(resultsStatusPromises ?? []),
                ...(resultsCompanionPromises ?? [])
            ]);
            const fetched = allResults?.filter((item): item is Service => !!item);
            const sorted = await sortServices(fetched);
            setServices(sorted);
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
    }, [user, servicesRejected]);

    const handleRefresh = useCallback(async () => {
        await fetchServices();
    }, [fetchServices]);

    const acceptService = async (service: Service) => {
        try {
            // Updates service companionId and status
            await updateDoc(doc(db, dbKeys.services, service?.id), {
                companionId: user?.id,
                status: statusKeys.accepted
            });
            // Creates the chat room for this service
            await setDoc(doc(db, dbKeys.chatRooms, service?.id), {
                createdAt: serverTimestamp(),
                participants: [user?.id, service?.requesterId],
                serviceId: service?.id
            });
            // Adding notification 5 minutes previous service
            await scheduleReminder(
                service,
                update5Minute,
                `⏰ ${uiTexts.reminderService}`,
                `${uiTexts.serviceStartsAt} ${service?.dateText}`
            );
            alert(uiTexts.serviceAccepted);
            fetchServices();
        } catch (err) {
            console.error(err);
        }
    };

    const rejectService = (serviceId: string) => {
        setServices(services.filter(item => item.id !== serviceId));
        setServicesRejected([...servicesRejected, serviceId]);
        alert(uiTexts.serviceRejected);
        fetchServices();
    };

    const handleViewUser = (userId: string) => {
        if (userId?.length) {
            navigation.navigate('UserProfile', { userId });
        }
    };

    useEffect(() => {
        fetchServices();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchServices();
        });

        return unsubscribe;
    }, [fetchServices, navigation]);

    return (
        <Layout>
            <View style={styles.container}>
                <UserHeader userClick={(user) => handleViewUser(user?.id ?? '')}></UserHeader>

                <View style={styles.body}>
                    <Text style={styles.title}>{uiTexts.companionServices}</Text>

                    <FlatList
                        data={services}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        renderItem={({ item }) => (
                            <CompanionServiceItemRow
                                item={item}
                                acceptService={() => acceptService(item)}
                                manageService={() => navigation.navigate('CompanionActiveService', { service: item })}
                                rejectService={() => {
                                    Alert.alert(uiTexts.rejectService, uiTexts.areYouSure, [
                                        { text: uiTexts.cancel, style: 'cancel' },
                                        {
                                            text: uiTexts.yes,
                                            style: 'destructive',
                                            onPress: () => rejectService(item.id)
                                        }
                                    ])
                                }}
                                viewService={() => navigation.navigate('ViewService', { service: item })}
                                viewUser={(item) => handleViewUser(item.requesterId)}
                            />
                        )
                        }
                        ListEmptyComponent={<Text style={styles.noRecords}>{uiTexts.noServicesAvailable}</Text>}
                    />
                    {
                        refreshing &&
                        <Loader color={colors.azureblue} size={'large'}></Loader>
                    }
                </View>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    body: { flex: 1, padding: 20 },
    title: {
        color: colors.white,
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 12
    },
    noRecords: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold'
    }
});
