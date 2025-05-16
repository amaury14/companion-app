import { collection, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import ServiceItemRow from '../../components/ServiceItemRow';
import { useUser } from '../../context/UserContext';
import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { categoryData } from '../../utils/data/category-data';
import { statusData } from '../../utils/data/status.data';
import { uiTexts } from '../../utils/data/ui-text-data';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { statusKeys, statusTexts } from '../../utils/keys/status-keys';
import { formatDateWithTime, getAddressFromCoords, sortServices } from '../../utils/util';

type Props = NativeStackScreenProps<UserStackParamList, 'UserHome'>;

/**
 * Main screen for the user role. Shows a summary of past services and allows requesting new ones.
 */
export default function UserHomeScreen({ navigation }: Props) {
    const [refreshing, setRefreshing] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [ongoingServices, setOngoingServices] = useState<Service[]>([]);
    const { user } = useUser();

    const fetchServices = useCallback(async () => {
        try {
            const uid = user?.id;
            if (!uid) return;
            setRefreshing(true);

            const queryObj = query(collection(db, dbKeys.services), where(fieldKeys.requesterId, '==', uid));
            const querySnapshot = await getDocs(queryObj);
            const queryData = querySnapshot?.docs?.map(doc => ({ id: doc.id, ...doc.data() } as Service));
            const queryDataPromises = queryData?.map(async data => {
                const locationText = data.location?.latitude && data.location?.longitude
                    ? await getAddressFromCoords(data.location.latitude, data.location.longitude)
                    : uiTexts.noAddress;
                return {
                    ...data,
                    category: categoryData.find(item => item.value === data.category)?.name ?? data.category,
                    status: statusData.find(item => item.value === data.status)?.name ?? data.status,
                    dateText: formatDateWithTime(data.date?.toDate()) ?? uiTexts.noDate,
                    price: data.price ?? 0,
                    timeStamp: (data.date as Timestamp).toMillis(),
                    locationText
                };
            });
            const allResults = await Promise.all([
                ...(queryDataPromises ?? [])
            ]);
            const sorted = sortServices(allResults);
            setServices(sorted);
            setOngoingServices(sorted.filter(item =>
                item.status === statusTexts.pending ||
                item.status === statusTexts.in_progress ||
                item.status === statusTexts.accepted
            ));
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
    }, [user]);

    const updateServiceStatus = useCallback(async (serviceId: string, newStatus: string) => {
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
    }, [fetchServices]);

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
                        disabled={ongoingServices.length > 0}
                        style={{
                            ...styles.newServiceButton,
                            backgroundColor: ongoingServices.length > 0 ? colors.gray : colors.argentinianblue,
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
                                manageService={() => navigation.navigate('UserActiveService', { service: item })}
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
