import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import * as Location from 'expo-location';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { CompanionStackParamList } from '../../navigation/CompanionStack/CompanionStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { categoryData } from '../../utils/data/category-data';
import { statusData } from '../../utils/data/status.data';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { statusKeys, statusTexts } from '../../utils/keys/status-keys';

type Props = NativeStackScreenProps<CompanionStackParamList, 'CompanionHome'>;

export default function CompanionHomeScreen({ navigation }: Props) {
    const [services, setServices] = useState<Service[]>([]);
    const [servicesRejected, setServicesRejected] = useState<string[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [ableAccept, setAbleAccept] = useState(false);
    const authUser = auth.currentUser;

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
                        : 'Dirección no disponible';
                    fetched.push({
                        ...data,
                        category: categoryData.find(item => item.value === data.category)?.name ?? data.category,
                        status: statusData.find(item => item.value === data.status)?.name ?? data.status,
                        dateText: data.date?.toDate().toLocaleDateString() || 'Sin fecha',
                        timeStamp: data.date?.toMillis(),
                        locationText
                    });
                }
            });
            setServices(fetched);
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
    }, [authUser?.uid, servicesRejected]);

    const handleRefresh = useCallback(async () => {
        await fetchServices();
    }, [fetchServices]);

    const acceptService = async (serviceId: string) => {
        try {
            await updateDoc(doc(db, dbKeys.services, serviceId), {
                status: statusKeys.in_progress,
                companionId: authUser?.uid,
            });
            alert('Servicio aceptado');
            fetchServices();
        } catch (err) {
            console.error(err);
        }
    };

    const rejectService = (serviceId: string) => {
        setServices(services.filter(item => item.id !== serviceId));
        setServicesRejected([...servicesRejected, serviceId]);
        alert('Servicio rechazado');
        fetchServices();
    };

    const getAddressFromCoords = async (latitude: number, longitude: number) => {
        try {
            const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });

            if (addresses.length > 0) {
                const { street, name, city, region } = addresses[0];
                return `${street || name}, ${city}, ${region}`; //, ${country}
            } else {
                return 'Dirección no disponible';
            }
        } catch (error) {
            console.error('Error obteniendo la dirección:', error);
            return 'Dirección no disponible';
        }
    };

    useEffect(() => {
        fetchServices();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchServices();
        });

        return unsubscribe;
    }, [fetchServices, navigation]);

    const renderItem = ({ item }: { item: Service }) => (
        <View style={styles.serviceItem}>
            <Text style={styles.inputText}>📅 {item.dateText ?? 'Sin fecha'} • {item.category} • {item.status}</Text>
            <Text style={styles.inputText}>💲 UYU {item.companionPayment} • {item.duration} hora(s)</Text>
            <Text style={styles.inputText}>📍 {item.locationText || 'Dirección no disponible'}</Text>
            <View style={styles.buttonRow}>
                {
                    ableAccept &&
                    <TouchableOpacity style={styles.button} onPress={() => acceptService(item.id)}>
                        <Text style={styles.buttonText}>Aceptar</Text>
                    </TouchableOpacity>
                }
                {
                    item.status !== statusTexts.in_progress &&
                    <TouchableOpacity style={{ ...styles.button, backgroundColor: colors.danger }} onPress={() => rejectService(item.id)}>
                        <Text style={styles.buttonText}>Rechazar</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    );

    return (
        <Layout>
            <View style={styles.container}>
                <Header></Header>
                <View style={styles.body}>
                    <Text style={styles.title}>Servicios Disponibles</Text>

                    <FlatList
                        data={services}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        renderItem={renderItem}
                        ListEmptyComponent={<Text style={styles.noRecords}>No tenés servicios registrados.</Text>}
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
    serviceItem: {
        backgroundColor: colors.lightGray,
        borderRadius: 8,
        marginBottom: 8,
        padding: 12,
        paddingHorizontal: 8,
        paddingVertical: 12
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8
    },
    noRecords: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold'
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
    inputText: {
        color: colors.black,
        fontSize: 16,
        fontWeight: '500'
    }
});
