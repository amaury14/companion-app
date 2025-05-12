import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import * as Location from 'expo-location';

import CompanionServiceItemRow from '../../components/CompanionServiceItemRow';
import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { useUser } from '../../context/UserContext';
import { CompanionStackParamList } from '../../navigation/CompanionStack/CompanionStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { categoryData } from '../../utils/data/category-data';
import { statusData } from '../../utils/data/status.data';
import { uiTexts } from '../../utils/data/ui-text-data';
import { radioKilometers } from '../../utils/keys/costs-keys';
import { statusKeys } from '../../utils/keys/status-keys';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { getDistanceFromLatLonInKm } from '../../utils/util';

type Props = NativeStackScreenProps<CompanionStackParamList, 'CompanionHome'>;

export default function CompanionHomeScreen({ navigation }: Props) {
    const [services, setServices] = useState<Service[]>([]);
    const [servicesRejected, setServicesRejected] = useState<string[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [ableAccept, setAbleAccept] = useState(false);
    const { user } = useUser();
    const authUser = auth?.currentUser;

    const fetchServices = useCallback(async () => {
        try {
            if (!authUser?.uid) return;
            setRefreshing(true);
            setAbleAccept(false);

            const queryObjPending = query(
                collection(db, dbKeys.services),
                where(fieldKeys.status, '==', statusKeys.pending)
            );
            const queryObjCompanion = query(
                collection(db, dbKeys.services),
                where(fieldKeys.companionId, '==', authUser?.uid)
            );
            const pending = await getDocs(queryObjPending);
            const companion = await getDocs(queryObjCompanion);
            const resultsStatus = pending?.docs?.map(doc => ({ id: doc.id, ...doc.data() } as Service));
            const resultsCompanion = companion?.docs?.map(doc => ({ id: doc.id, ...doc.data() } as Service));

            setAbleAccept(!resultsCompanion.length);

            const fetched: Service[] = [];
            [...resultsStatus, ...resultsCompanion]?.forEach(async data => {
                if (!servicesRejected?.find(item => item === data.id)) {
                    const locationText = data.location?.latitude && data.location?.longitude
                        ? await getAddressFromCoords(data.location?.latitude ?? 0, data.location?.longitude ?? 0)
                        : uiTexts.noAddress;
                    const distance = getDistanceFromLatLonInKm(
                        user?.address?.latitude ?? 0,
                        user?.address?.longitude ?? 0,
                        data.location?.latitude ?? 0,
                        data.location?.longitude ?? 0
                    );
                    // Filter services close to the companion
                    if (distance <= radioKilometers) {
                        fetched.push({
                            ...data,
                            category: categoryData.find(item => item.value === data.category)?.name ?? data.category,
                            status: statusData.find(item => item.value === data.status)?.name ?? data.status,
                            dateText: data.date?.toDate().toLocaleDateString() || uiTexts.noDate,
                            timeStamp: data.date?.toMillis(),
                            locationText
                        });
                    }
                }
            });
            setServices(fetched);
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
    }, [authUser?.uid, servicesRejected, user]);

    const handleRefresh = useCallback(async () => {
        await fetchServices();
    }, [fetchServices]);

    const acceptService = async (serviceId: string) => {
        try {
            await updateDoc(doc(db, dbKeys.services, serviceId), {
                status: statusKeys.in_progress,
                companionId: authUser?.uid,
            });
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

    const getAddressFromCoords = async (latitude: number, longitude: number) => {
        try {
            const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });

            if (addresses.length > 0) {
                const { street, name, city, region } = addresses[0];
                return `${street || name}, ${city}, ${region}`; //, ${country}
            } else {
                return uiTexts.noAddress;
            }
        } catch (error) {
            console.error('Error obteniendo la dirección:', error);
            return uiTexts.noAddress;
        }
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
                <Header userClick={(user) => handleViewUser(user?.id ?? '')}></Header>

                <View style={styles.body}>
                    <Text style={styles.title}>{uiTexts.availableServices}</Text>

                    <FlatList
                        data={services}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        renderItem={({ item }) => (
                            <CompanionServiceItemRow
                                ableAccept={ableAccept}
                                item={item}
                                acceptService={() => acceptService(item.id)}
                                rejectService={() => rejectService(item.id)}
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
