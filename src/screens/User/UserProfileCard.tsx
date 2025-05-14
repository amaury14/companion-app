import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import { colors } from '../../theme/colors';
import { uiTexts } from '../../utils/data/ui-text-data';
import { doc, getDoc } from 'firebase/firestore';
import { dbKeys } from '../../utils/keys/db-keys';
import { db } from '../../services/firebase';
import { UserData } from '../../types/user';
import { getAddressFromCoords } from '../../utils/util';

export const UserProfileCard = () => {
    const route = useRoute<RouteProp<UserStackParamList, 'UserProfile'>>();
    const { userId } = route.params;

    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState<UserData | null>(null);

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
    }, [userId, fetchUserData]);

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
                        {userData?.verified && <MaterialIcons name="verified" size={20} color={colors.success} />}
                    </View>

                    <Text style={styles.typeText}>
                        {userData?.type === 'companion' ? uiTexts.companion : uiTexts.user}
                    </Text>

                    <View style={styles.statsContainer}>
                        <View style={styles.statItem}>
                            <FontAwesome name="check-circle" size={16} color={colors.primary} />
                            <Text style={styles.statText}>{userData?.completedServices} {userData?.type === 'companion' ? uiTexts.completedServices : uiTexts.receivedServices}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <FontAwesome name="star" size={16} color={colors.yellow} />
                            <Text style={styles.statText}>{userData?.reputationScore.toFixed(1)} {uiTexts.reputation}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>📧 {uiTexts.email}:</Text>
                        <Text style={styles.value}>{userData?.email}</Text>
                    </View>

                    {userData?.address && (
                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>📍 {uiTexts.location}:</Text>
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
        elevation: 2,
        height: '95%',
        margin: 12,
        shadowColor: colors.black,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        padding: 15
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 4
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginRight: 8
    },
    typeText: {
        color: colors.darkergray,
        fontSize: 19,
        marginBottom: 12
    },
    statsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    statItem: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 10
    },
    statText: {
        color: colors.black,
        fontSize: 19,
        marginLeft: 6
    },
    infoBlock: {
        marginBottom: 8
    },
    label: {
        color: colors.darkergray,
        fontSize: 19,
        fontWeight: '600'
    },
    value: {
        color: colors.black,
        fontSize: 18
    }
});
