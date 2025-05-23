import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Text, StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import ReviewItem from '../../components/ReviewItem';
import { colors } from '../../theme/colors';
import { uiTexts } from '../../utils/data/ui-text-data';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { dbKeys, fieldKeys } from '../../utils/keys/db-keys';
import { db } from '../../services/firebase';
import { Review } from '../../types/review';
import { AppStackParamList } from '../../types/stack-param-list';
import { UserData } from '../../types/user';
import { getAddressFromCoords } from '../../utils/util';

/**
 * Displays detailed profile information of a user or companion, including completed services, reputation, and contact info. Styled with a modern, app-like layout.
 */
export const UserProfileCard = () => {
    const route = useRoute<RouteProp<AppStackParamList, 'UserProfile'>>();
    const { userId } = route.params;

    const [loading, setLoading] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [reputationScore, setReputationScore] = useState<number>(0);

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
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchReviews = useCallback(async (id: string) => {
        try {
            setLoading(true);
            const queryObj = query(
                collection(db, dbKeys.reviews),
                where(fieldKeys.reviewedUserId, '==', id)
            );
            const snapshot = await getDocs(queryObj);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
            setReviews(data);
            // Calculates reputation score
            const total = data.reduce((sum, curr) => sum + curr.rating, 0);
            const score = parseFloat((total / data.length).toFixed(1));
            setReputationScore(score ? score : 0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const fetchUserDataAsync = async () => {
            await fetchUserData(userId);
        };

        fetchUserDataAsync();
    }, [userId, fetchUserData]);

    useEffect(() => {
        const fetchReviewsDataAsync = async () => {
            await fetchReviews(userId);
        };

        fetchReviewsDataAsync();
    }, [userId, fetchReviews]);

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
                            <Text style={styles.statText}>{reputationScore.toFixed(1)} {uiTexts.reputation}</Text>
                        </View>
                    </View>

                    <View style={styles.infoBlock}>
                        <Text style={styles.label}>📧 {uiTexts.email}:</Text>
                        <Text style={styles.value}>{userData?.email}</Text>
                    </View>

                    {
                        userData?.address &&
                        <View style={styles.infoBlock}>
                            <Text style={styles.label}>📍 {uiTexts.location}:</Text>
                            <Text style={styles.value}>{userData?.locationText}</Text>
                        </View>
                    }

                    {
                        reviews?.length &&
                        <View>
                            <Text style={styles.subTitle}>{uiTexts.previousReviews}</Text>
                            <FlatList
                                data={reviews}
                                keyExtractor={item => item.id}
                                renderItem={({ item }) => (
                                    <ReviewItem item={item}></ReviewItem>
                                )}
                                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                            />
                        </View>
                    }
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
    },
    subTitle: {
        color: colors.black,
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 12
    }
});
