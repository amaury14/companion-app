import React, { useState } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import ServiceCard from '../../components/ServiceCard';
import { Service } from '../../types/service';
import { AppStackParamList } from '../../types/stack-param-list';
import { uiTexts } from '../../utils/data/ui-text-data';

/**
 * Shows detailed information about a service.
 */
export default function ViewServiceScreen() {
    const route = useRoute<RouteProp<AppStackParamList, 'ViewService'>>();
    const { service } = route.params;
    const [serviceData] = useState<Service>(service);

    return (
        <Layout>
            <Header title={uiTexts.serviceInformation}></Header>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <ServiceCard serviceData={serviceData}></ServiceCard>                
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
