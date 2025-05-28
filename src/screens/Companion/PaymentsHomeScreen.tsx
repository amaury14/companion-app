import { addDays, addMonths, format, subYears } from 'date-fns';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import SelectDropdown from 'react-native-select-dropdown';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import PaymentItemRow from '../../components/PaymentItemRow';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { MonthItem } from '../../types/month-item';
import { Service } from '../../types/service';
import { AppStackParamList } from '../../types/stack-param-list';
import { categoryData } from '../../utils/data/category-data';
import { statusData } from '../../utils/data/status.data';
import { uiTexts } from '../../utils/data/ui-text-data';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { statusKeys } from '../../utils/keys/status-keys';
import { formatDateWithTime, generateMonthsBetweenDates, getAddressFromCoords, sortServices } from '../../utils/util';

type Props = NativeStackScreenProps<AppStackParamList, 'PaymentsHome'>;

/**
 * Payments screen for companions. Lists payments by month.
 */
export default function PaymentsHomeScreen({ navigation }: Props) {
    const [refreshing, setRefreshing] = useState(false);
    const [services, setServices] = useState<Service[]>([]);
    const [payment, setPayment] = useState<number>(0);
    const [monthItems] = useState<MonthItem[]>(generateMonthsBetweenDates(subYears(new Date(), 1), new Date()));
    const [selectedMonth, setSelectedMonth] = useState<MonthItem>(monthItems[0]);
    const { user } = useUser();

    const fetchServices = useCallback(async () => {
        try {
            const uid = user?.id;
            if (!uid) return;
            setRefreshing(true);

            const queryObj = query(
                collection(db, dbKeys.services),
                where(fieldKeys.status, '==', statusKeys.completed),
                where(fieldKeys.confirmed, '==', true),
                where(fieldKeys.companionId, '==', uid),
                where(fieldKeys.date, '>=', addDays(new Date(selectedMonth.date), 1)),
                where(fieldKeys.date, '<=', addMonths(new Date(selectedMonth.date), 1)),
            );
            const docs = await getDocs(queryObj);
            const results = docs?.docs?.map(doc => ({ id: doc.id, ...doc.data() } as Service));
            const resultsStatusPromises = results?.map(async data => {
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
                ...(resultsStatusPromises ?? [])
            ]);
            const fetched = allResults?.filter((item): item is Service => !!item);
            const sorted = await sortServices(fetched);
            setPayment(sorted.reduce((sum, item) => sum + item.companionPayment, 0));
            setServices(sorted);
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
    }, [user, selectedMonth]);

    const handleRefresh = useCallback(async () => {
        await fetchServices();
    }, [fetchServices]);

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
                <Header title={uiTexts.payments}></Header>
                <View style={styles.body}>
                    <Text style={styles.title}>{uiTexts.paymentTotal}:💲 {uiTexts.currency} {payment}</Text>
                    <Text style={styles.paymentText}>{uiTexts.serviceQuantity}: {services.length}</Text>
                    <Text style={styles.paymentText}>{uiTexts.toPayThe}: {format(addMonths(new Date(selectedMonth.date), 1), "dd-MMMM-yyyy")}</Text>

                    <Text style={styles.inputText}>{uiTexts.filterByMonth}:</Text>
                    <View style={{ width: '100%' }}>
                        <SelectDropdown
                            data={monthItems}
                            defaultValue={selectedMonth}
                            onSelect={(selectedItem) => setSelectedMonth(selectedItem)}
                            renderButton={(selectedItem) => {
                                return (
                                    <View style={styles.dropdownButtonStyle}>
                                        <Text style={styles.dropdownButtonTxtStyle}>
                                            {(selectedItem && selectedItem.label) || uiTexts.selectMonth}
                                        </Text>
                                    </View>
                                );
                            }}
                            renderItem={(item) => {
                                return (
                                    <View style={styles.dropdownItemStyle}>
                                        <Text style={styles.dropdownItemTxtStyle}>{item.label}</Text>
                                    </View>
                                );
                            }}
                            showsVerticalScrollIndicator={false}
                            dropdownStyle={styles.dropdownMenuStyle}
                        />
                    </View>

                    <FlatList
                        data={services}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingBottom: 16 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        renderItem={({ item }) => (
                            <PaymentItemRow
                                item={item}
                                viewService={() => navigation.navigate('ViewService', { serviceId: item.id })}
                                viewUser={(item) => {
                                    if (item.requesterId?.length) {
                                        navigation.navigate('UserProfile', { userId: item.requesterId });
                                    }
                                }}
                            />
                        )
                        }
                        ListEmptyComponent={<Text style={styles.noRecords}>{uiTexts.noPaymentsAvailable}</Text>}
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
        marginBottom: 8
    },
    noRecords: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold'
    },
    paymentText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8
    },
    inputText: {
        color: colors.black,
        fontSize: 18,
        fontWeight: 'bold'
    },
    dropdownButtonStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 0,
        width: '100%'
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500'
    },
    dropdownButtonArrowStyle: {
        fontSize: 28,
    },
    dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8
    },
    dropdownMenuStyle: {
        borderRadius: 8
    },
    dropdownItemStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: '100%'
    },
    dropdownItemTxtStyle: {
        color: colors.darkergray,
        flex: 1,
        fontSize: 18,
        fontWeight: '500'
    }
});
