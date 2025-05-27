import { MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Claim } from '../../types/claim';
import { AppStackParamList } from '../../types/stack-param-list';
import { uiTexts } from '../../utils/data/ui-text-data';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { sortClaims } from '../../utils/util';
import { format } from 'date-fns';

type Props = NativeStackScreenProps<AppStackParamList, 'ViewClaims'>;

/**
 * Main screen for the user role. Shows a summary of past services and allows requesting new ones.
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

            const queryObj = query(collection(db, dbKeys.claims), where(fieldKeys.userId, '==', uid));
            const querySnapshot = await getDocs(queryObj);
            const queryData = querySnapshot?.docs?.map(doc => ({ id: doc.id, ...doc.data(), reason: doc.data().reason.name } as Claim));
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

    useEffect(() => {
        fetchClaims();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchClaims();
        });

        return unsubscribe;
    }, [fetchClaims, navigation]);

    const renderItem = ({ item }: { item: Claim }) => (
        <View style={styles.item}>
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
                {uiTexts.date}: {item.createdAt?.toDate ? format(item.createdAt.toDate(), 'dd/MM/yyyy HH:mm') : '—'}
            </Text>
            {
                item.response &&
                <>
                    <Text style={{ ...styles.meta, marginTop: 10 }}>{uiTexts.solution}:</Text>
                    <Text style={{ ...styles.desc, marginBottom: 0 }}>{item.response}</Text>
                </>
            }
        </View>
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
    item: {
        backgroundColor: colors.lightGray,
        borderRadius: 10,
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
    open: { color: colors.warning, fontWeight: 'bold' },
    resolved: { color: colors.success, fontWeight: 'bold' },
    rejected: { color: colors.danger, fontWeight: 'bold' },
    empty: {
        color: colors.gray,
        fontSize: 16,
        marginTop: 40,
        textAlign: 'center'
    }
});
