import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Layout from '../../components/Layout';
import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { categoryData } from '../../utils/data/category-data';
import { statusData } from '../../utils/data/status.data';
import { dbKeys } from '../../utils/keys/db-keys';

type Props = NativeStackScreenProps<UserStackParamList, 'UserHome'>;

export default function UserHomeScreen({ navigation }: Props) {
    const [name, setName] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [services, setServices] = useState<Service[]>([]);

    const fetchServices = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const q = query(collection(db, dbKeys.services), where('requesterId', '==', uid));
        const querySnapshot = await getDocs(q);
        const fetched: Service[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetched.push({
                id: doc.id,
                category: categoryData.find(item => item.value === data.category)?.name ?? data.category,
                status: statusData.find(item => item.value === data.status)?.name ?? data.status,
                date: data.date?.toDate().toLocaleDateString() || 'Sin fecha',
                price: data.price ?? 0
            });
        });
        setServices(fetched);
    };

    const fetchUserName = async () => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const userDoc = await getDoc(doc(db, dbKeys.users, uid));
        if (userDoc.exists()) {
            setName(userDoc.data()?.name || '');
        }
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
                    <TouchableOpacity style={styles.newServiceButton} onPress={handleCreateService}>
                        <Text style={styles.newServiceButtonText}>Solicitar nuevo servicio</Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionTitle}>Tus servicios actuales/anteriores</Text>
                    <FlatList
                        data={services}
                        keyExtractor={(item) => item.id}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                        renderItem={({ item }) => (
                            <View style={styles.serviceItem}>
                                <Text style={styles.serviceText}>🗓️ {item.date} • {item.category}</Text>
                                <Text style={styles.status}>Estado: {item.status} • Costo: UYU {item.price}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text>No tenés servicios registrados.</Text>}
                    />
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
    headerText: { color: colors.white, fontSize: 22, fontWeight: 'bold' },
    body: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 20, marginVertical: 20 },
    serviceItem: {
        padding: 12,
        borderBottomColor: colors.gray,
        borderBottomWidth: 1
    },
    serviceText: { fontSize: 19 },
    status: { fontSize: 18, color: colors.black },
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
        fontSize: 20,
        fontWeight: 'bold'
    }
});
