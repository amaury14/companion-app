import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Claim } from '../../types/claim';
import { AppStackParamList } from '../../types/stack-param-list';
import { claimData } from '../../utils/data/claim.data';
import { uiTexts } from '../../utils/data/ui-text-data';
import { claimKeys, claimTexts } from '../../utils/keys/claim-keys';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { formatDateWithTime, sortClaims } from '../../utils/util';

type Props = NativeStackScreenProps<AppStackParamList, 'ViewClaims'>;

/**
 * Main screen for the user claims. Shows a summary of current/past claims.
 */
export default function ViewClaimsScreen({ navigation }: Props) {
    const [refreshing, setRefreshing] = useState(false);
    const [claims, setClaims] = useState<Claim[]>([]);
    const { user } = useUser();

    const fetchClaims = useCallback(async () => {
        try {
            const uid = user?.id;
            if (!uid) return;
            setRefreshing(true);

            const queryObj = query(
                collection(db, dbKeys.claims),
                where(fieldKeys.userId, '==', uid),
                where(fieldKeys.status, '!=', claimKeys.deleted)
            );
            const querySnapshot = await getDocs(queryObj);
            const queryData = querySnapshot?.docs?.map(doc => ({
                ...doc.data(),
                id: doc.id,
                reason: doc.data().reason.name,
                status: claimData.find(item => item.value === doc.data().status)?.name ?? doc.data().status,
            } as Claim));
            const sorted = sortClaims(queryData);
            setClaims(sorted);
        } catch (err) {
            console.error(err);
        }
        setRefreshing(false);
    }, [user]);

    const handleRefresh = useCallback(async () => {
        await fetchClaims();
    }, [fetchClaims]);

    const deleteClaim = useCallback(async (claimId: string) => {
        if (!claimId) return;
        try {
            setRefreshing(true);
            const serviceRef = doc(db, dbKeys.claims, claimId);

            await updateDoc(serviceRef, {
                deletedDate: Timestamp.fromDate(new Date()),
                status: claimKeys.deleted
            });
            setRefreshing(false);

            await fetchClaims();
        } catch (error) {
            console.error(uiTexts.errorUpdatingClaim, error);
        }
    }, [fetchClaims]);

    useEffect(() => {
        fetchClaims();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchClaims();
        });

        return unsubscribe;
    }, [fetchClaims, navigation]);

    const renderItem = ({ item }: { item: Claim }) => (
        <View style={styles.claimContainer}>
            <View>
                <Text style={styles.title}>📝 {item.reason}</Text>
                <Text style={styles.desc}>{item.description}</Text>
                <Text style={styles.meta}>
                    {uiTexts.status}: <Text style={styles[item.status]}>{item.status.toUpperCase()}</Text>
                </Text>
                <View style={styles.inlineContent}>
                    <Text style={styles.meta}>{uiTexts.service}:</Text>
                    <TouchableOpacity style={{ marginLeft: 5 }} onPress={() => navigation.navigate('ViewService', { serviceId: item.serviceId })}>
                        <MaterialIcons name="info-outline" size={25} color={colors.black} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.meta}>
                    {uiTexts.date}: {item.createdAt?.toDate ? formatDateWithTime(item.createdAt.toDate()) : '—'}
                </Text>
                {
                    item.response &&
                    <>
                        <Text style={{ ...styles.meta, marginTop: 10 }}>{uiTexts.solution}:</Text>
                        <Text style={{ ...styles.desc, marginBottom: 0 }}>{item.response}</Text>
                    </>
                }
            </View>
            {
                item.status === claimTexts.open &&
                <TouchableOpacity onPress={() => {
                    Alert.alert(uiTexts.deleteClaim, uiTexts.areYouSure, [
                        { text: uiTexts.cancel, style: 'cancel' },
                        {
                            text: uiTexts.yes,
                            style: 'destructive',
                            onPress: () => deleteClaim(item.id)
                        },
                    ]);
                }} style={styles.button}>
                    <Ionicons name="close-circle" size={30} color={colors.danger} />
                </TouchableOpacity>
            }
        </View >
    );

    return (
        <Layout>
            <View style={styles.container}>
                <Header title={uiTexts.yourClaims}></Header>
                <View style={styles.body}>
                    <Text style={styles.sectionTitle}>{uiTexts.claims}</Text>
                    <FlatList
                        data={claims}
                        keyExtractor={(item) => item.id}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        renderItem={renderItem}
                        ListEmptyComponent={<Text style={styles.noRecords}>{uiTexts.noClaims}</Text>}
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
    sectionTitle: { fontSize: 18, marginBottom: 10 },
    noRecords: {
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold'
    },
    claimContainer: {
        alignItems: 'center',
        backgroundColor: colors.lightGray,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        padding: 14
    },
    title: {
        color: colors.black,
        fontSize: 18,
        fontWeight: 'bold'
    },
    desc: {
        color: colors.black,
        fontSize: 16,
        marginBottom: 6
    },
    inlineContent: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    meta: {
        color: colors.black,
        fontSize: 16
    },
    [claimTexts.open]: { color: colors.warning, fontWeight: 'bold' },
    [claimTexts.resolved]: { color: colors.success, fontWeight: 'bold' },
    [claimTexts.rejected]: { color: colors.danger, fontWeight: 'bold' },
    [claimTexts.deleted]: { color: colors.black, fontWeight: 'bold' },
    empty: {
        color: colors.gray,
        fontSize: 16,
        marginTop: 40,
        textAlign: 'center'
    }
});
