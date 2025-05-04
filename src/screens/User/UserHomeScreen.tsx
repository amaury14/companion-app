import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import ServiceItemRow from '../../components/ServiceItemRow';
import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { categoryData } from '../../utils/data/category-data';
import { statusData } from '../../utils/data/status.data';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { statusKeys, statusTexts } from '../../utils/keys/status-keys';
import { sortServices } from '../../utils/util';

type Props = NativeStackScreenProps<UserStackParamList, 'UserHome'>;

export default function UserHomeScreen({ navigation }: Props) {
    const [name, setName] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [pending, setPending] = useState<Service[]>([]);

    const fetchServices = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const queryObj = query(collection(db, dbKeys.services), where(fieldKeys.requesterId, '==', uid));
        const querySnapshot = await getDocs(queryObj);
        const fetched: Service[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetched.push({
                id: doc.id,
                category: categoryData.find(item => item.value === data.category)?.name ?? data.category,
                status: statusData.find(item => item.value === data.status)?.name ?? data.status,
                date: data.date?.toDate().toLocaleDateString() || 'Sin fecha',
                price: data.price ?? 0,
                timeStamp: (data.date as Timestamp).toMillis()
            });
        });
        const sorted = sortServices(fetched);
        setServices(sorted);
        setPending(sorted.filter(item => item.status === statusTexts.pending));
    };

    const fetchUserName = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const userDoc = await getDoc(doc(db, dbKeys.users, uid));
        if (userDoc.exists()) {
            setName(userDoc.data()?.name ?? userDoc.data()?.displayName ?? '');
        }
    };

    const updateServiceStatus = async (serviceId: string, newStatus: string) => {
        if (!serviceId) return;
        try {
            setRefreshing(true);
            const serviceRef = doc(db, dbKeys.services, serviceId);

            await updateDoc(serviceRef, {
                status: newStatus,
            });

            await fetchServices();
        } catch (error) {
            console.error('Error al actualizar el servicio:', error);
        }
        setRefreshing(false);
    };

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchServices();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        fetchUserName();
        fetchServices();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchServices();
        });

        return unsubscribe;
    }, [navigation]);

    const handleCreateService = () => {
        navigation.navigate('CreateService');
    };

    const logout = () => {
        auth.signOut();
    };

    return (
        <Layout>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Hola, {name || 'Usuario'}</Text>
                    <TouchableOpacity style={styles.exitButton} onPress={logout}>
                        <Text style={styles.exitButtonText}>Salir</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.body}>
                    <TouchableOpacity
                        disabled={pending.length > 0}
                        style={{
                            ...styles.newServiceButton,
                            backgroundColor: pending.length > 0 ? colors.gray : colors.argentinianblue,
                        }}
                        onPress={handleCreateService}
                    >
                        <Text style={styles.newServiceButtonText}>Solicitar nuevo servicio</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Tus servicios actuales/anteriores</Text>
                    <FlatList
                        data={services}
                        keyExtractor={(item) => item.id}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        renderItem={({ item }) => (
                            <ServiceItemRow
                                id={item.id}
                                date={item.date}
                                category={item.category}
                                status={item.status}
                                price={item.price}
                                onCancel={(id) => {
                                    Alert.alert('Cancelar servicio', '¿Estás seguro?', [
                                        { text: 'Cancelar', style: 'cancel' },
                                        {
                                            text: 'Sí',
                                            style: 'destructive',
                                            onPress: () => updateServiceStatus(id, statusKeys.cancelled)
                                        },
                                    ]);
                                }}
                            />
                        )}
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
    container: { flex: 1 },
    header: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'row',
        backgroundColor: colors.header,
        padding: 10
    },
    headerText: { color: colors.white, fontSize: 20, fontWeight: 'bold' },
    body: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 18, marginVertical: 20 },
    serviceItem: {
        padding: 12,
        borderBottomColor: colors.gray,
        borderBottomWidth: 1
    },
    serviceText: { fontSize: 18 },
    status: { fontSize: 16, color: colors.black },
    exitButton: {
        alignItems: 'center',
        backgroundColor: colors.azureblue,
        borderRadius: 8,
        marginTop: 0,
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    exitButtonText: {
        color: colors.white,
        fontWeight: 'bold'
    },
    newServiceButton: {
        alignItems: 'center',
        backgroundColor: colors.argentinianblue,
        borderRadius: 8,
        marginTop: 0,
        paddingHorizontal: 10,
        paddingVertical: 10
    },
    newServiceButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold'
    },
    noRecords: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold'
    }
});
