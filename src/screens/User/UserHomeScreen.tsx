import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { collection, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import ServiceItemRow from '../../components/ServiceItemRow';
import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { categoryData } from '../../utils/data/category-data';
import { statusData } from '../../utils/data/status.data';
import { uiTexts } from '../../utils/data/ui-text-data';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { statusKeys, statusTexts } from '../../utils/keys/status-keys';
import { sortServices } from '../../utils/util';

type Props = NativeStackScreenProps<UserStackParamList, 'UserHome'>;

export default function UserHomeScreen({ navigation }: Props) {
    const [refreshing, setRefreshing] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [pending, setPending] = useState<Service[]>([]);

    const fetchServices = useCallback(async () => {
        try {
            setRefreshing(true);
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const queryObj = query(collection(db, dbKeys.services), where(fieldKeys.requesterId, '==', uid));
            const querySnapshot = await getDocs(queryObj);
            const fetched: Service[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data() as Service;
                fetched.push({
                    ...data,
                    id: doc.id,
                    category: categoryData.find(item => item.value === data.category)?.name ?? data.category,
                    status: statusData.find(item => item.value === data.status)?.name ?? data.status,
                    dateText: data.date?.toDate().toLocaleDateString() ?? uiTexts.noDate,
                    price: data.price ?? 0,
                    timeStamp: (data.date as Timestamp).toMillis()
                });
            });
            const sorted = sortServices(fetched);
            setServices(sorted);
            setPending(sorted.filter(item => item.status === statusTexts.pending));
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
    }, []);

    const updateServiceStatus = async (serviceId: string, newStatus: string) => {
        if (!serviceId) return;
        try {
            setRefreshing(true);
            const serviceRef = doc(db, dbKeys.services, serviceId);

            await updateDoc(serviceRef, {
                status: newStatus,
            });
            setRefreshing(false);

            await fetchServices();
        } catch (error) {
            console.error('Error al actualizar el servicio:', error);
        }
    };

    const handleRefresh = useCallback(async () => {
        await fetchServices();
    }, [fetchServices]);

    const handleCreateService = () => {
        navigation.navigate('CreateService');
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
                    <TouchableOpacity
                        disabled={pending.length > 0}
                        style={{
                            ...styles.newServiceButton,
                            backgroundColor: pending.length > 0 ? colors.gray : colors.argentinianblue,
                        }}
                        onPress={handleCreateService}
                    >
                        <Text style={styles.newServiceButtonText}>{uiTexts.newService}</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>{uiTexts.services}</Text>
                    <FlatList
                        data={services}
                        keyExtractor={(item) => item.id}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        renderItem={({ item }) => (
                            <ServiceItemRow
                                item={item}
                                onCancel={(id) => {
                                    Alert.alert(uiTexts.cancelService, uiTexts.areYouSure, [
                                        { text: uiTexts.cancel, style: 'cancel' },
                                        {
                                            text: uiTexts.yes,
                                            style: 'destructive',
                                            onPress: () => updateServiceStatus(id, statusKeys.cancelled)
                                        },
                                    ]);
                                }}
                                onViewCompanion={(item) => handleViewUser(item.companionId)}
                            />
                        )}
                        ListEmptyComponent={<Text style={styles.noRecords}>{uiTexts.noServices}</Text>}
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
    body: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 18, marginVertical: 20 },
    serviceItem: {
        padding: 12,
        borderBottomColor: colors.gray,
        borderBottomWidth: 1
    },
    serviceText: { fontSize: 18 },
    status: { fontSize: 16, color: colors.black },
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
