import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import Loader from '../../components/Loader';
import ServiceCard from '../../components/ServiceCard';
import UserCard from '../../components/UserCard';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Service } from '../../types/service';
import { AppStackParamList } from '../../types/stack-param-list';
import { UserData } from '../../types/user';
import { uiTexts } from '../../utils/data/ui-text-data';
import { dbKeys } from '../../utils/keys/db-keys';
import { getAddressFromCoords } from '../../utils/util';

type Props = NativeStackScreenProps<AppStackParamList, 'ViewService'>;

/**
 * Shows detailed information about a service.
 */
export default function ViewServiceScreen({ navigation }: Props) {
    const route = useRoute<RouteProp<AppStackParamList, 'ViewService'>>();
    const { service } = route.params;
    const [loading, setLoading] = useState(false);
    const [serviceData] = useState<Service>(service);
    const [userData, setUserData] = useState<UserData | null>(null);
    const { user } = useUser();

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

    useEffect(() => {
        const fetchUserDataAsync = async () => {
            await fetchUserData(user?.type === 'companion' ? serviceData.requesterId : serviceData.companionId);
        };

        fetchUserDataAsync();
    }, [user, fetchUserData, serviceData.requesterId, serviceData.companionId]);

    return (
        <Layout>
            <Header title={uiTexts.serviceInformation}></Header>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {
                    loading &&
                    <Loader color={colors.argentinianblue} size={'large'}></Loader>
                }
                {
                    !loading &&
                    <UserCard
                        reputationScore={0}
                        reviews={[]}
                        showMoreInfo={true}
                        showLocation={false}
                        userData={userData}
                        viewMoreInfo={() => navigation.navigate('UserProfile', { userId: userData?.id ?? '' })}
                    ></UserCard>
                }
                <ServiceCard handleTime={false} serviceData={serviceData}></ServiceCard>
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        padding: 20
    }
});
