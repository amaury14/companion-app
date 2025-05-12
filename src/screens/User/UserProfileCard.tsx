import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import Layout from '../../components/Layout';
import { colors } from '../../theme/colors';
import { uiTexts } from '../../utils/data/ui-text-data';
import { doc, getDoc } from 'firebase/firestore';
import { dbKeys } from '../../utils/keys/db-keys';
import { db } from '../../services/firebase';
import { UserData } from '../../types/user';
import Loader from '../../components/Loader';

export const UserProfileCard = () => {
    const route = useRoute<RouteProp<UserStackParamList, 'UserProfile'>>();
    const { userId } = route.params;
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);

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

    const fetchUserData = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const docRef = doc(db, dbKeys.users, id);
            const docSnap = await getDoc(docRef);
            if (docSnap?.exists()) {
                const user = docSnap.data() as UserData;
                const locationText = user.address?.latitude && user.address?.longitude
                    ? await getAddressFromCoords(user.address.latitude, user.address.longitude)
                    : uiTexts.noAddress;
                setUserData({ ...user, locationText });
            } else {
                setUserData(null);
            }
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const fetchUserDataAsync = async () => {
            await fetchUserData(userId);
        };

        fetchUserDataAsync();
    }, [userId]);

    return (
        <Layout>
            {
                loading &&
                <Loader color={colors.argentinianblue} size={'large'}></Loader>
            }
            {
                !loading &&
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{userData?.name}</Text>
                        {userData?.verified && <MaterialIcons name="verified" size={20} color="#4CAF50" />}
                    </View>

                    <Text style={styles.typeText}>
                        {userData?.type === 'companion' ? uiTexts.companion : uiTexts.user}
                    </Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <FontAwesome name="check-circle" size={16} color="#2196F3" />
                            <Text style={styles.statText}>{userData?.completedServices} servicios completados</Text>
                        </View>
                        <View style={styles.statItem}>
                            <FontAwesome name="star" size={16} color="#FFD700" />
                            <Text style={styles.statText}>{userData?.reputationScore.toFixed(1)} reputación</Text>
                        </View>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>📧 Correo:</Text>
                        <Text style={styles.value}>{userData?.email}</Text>
                    </View>

                    {userData?.address && (
                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>📍 Ubicación:</Text>
                            <Text style={styles.value}>{userData?.locationText}</Text>
                        </View>
                    )}
                </View>
            }
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.lightGray,
        borderRadius: 12,
        padding: 15,
        elevation: 2,
        height: '95%',
        margin: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginRight: 8,
    },
    typeText: {
        fontSize: 19,
        color: '#888',
        marginBottom: 12,
    },
    statsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    statItem: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 10,
    },
    statText: {
        marginLeft: 6,
        fontSize: 19,
        color: '#333',
    },
    infoBlock: {
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        fontSize: 19,
        color: '#555',
    },
    value: {
        fontSize: 18,
        color: '#111',
    },
});
