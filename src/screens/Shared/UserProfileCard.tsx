import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import UserCard from '../../components/UserCard';
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
                setUserData({ ...user, locationText, id });
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
            <Header title={uiTexts.userProfile}></Header>
            <View style={styles.container}>
                {
                    loading &&
                    <Loader color={colors.argentinianblue} size={'large'}></Loader>
                }
                {
                    !loading &&
                    <UserCard
                        reputationScore={reputationScore}
                        reviews={reviews}
                        showMoreInfo={false}
                        showLocation={true}
                        userData={userData}
                    ></UserCard>
                }
            </View>
        </Layout>
    );
};

const styles = StyleSheet.create({
    container: {
        margin: 12
    }
});
