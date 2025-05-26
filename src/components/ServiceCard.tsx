import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Progress from 'react-native-progress';

import { colors } from '../theme/colors';
import { Service } from '../types/service';
import { uiTexts } from '../utils/data/ui-text-data';
import { updateMinute } from '../utils/keys/costs-keys';
import { statusTexts } from '../utils/keys/status-keys';
import { getTimeDiffText } from '../utils/util';

export type ServiceCardProps = {
    handleTime: boolean;
    serviceData: Service;
};

/**
 * Reusable card component for displaying all information regarding a service.
 */
function ServiceCard({ handleTime, serviceData }: ServiceCardProps) {
    const [elapsedTime, setElapsedTime] = useState<string>(
        serviceData?.checkInTime ? getTimeDiffText(serviceData.checkInTime?.toDate(), new Date()) : `0 ${uiTexts.min}`
    );

    useEffect(() => {
        if (serviceData?.checkInTime && handleTime) {
            const start = serviceData.checkInTime.toDate();
            const interval = setInterval(() => {
                setElapsedTime(getTimeDiffText(start, new Date()));
            }, updateMinute);

            return () => clearInterval(interval);
        }
    }, [serviceData?.checkInTime]);

    return (
        <View style={styles.card}>
            <Info label={`📅 ${uiTexts.date}`} value={serviceData.dateText ?? uiTexts.notAvailable} />
            <Info label={`📍 ${uiTexts.location}`} value={serviceData.locationText ?? uiTexts.notAvailable} />
            <Info label={`💡 ${uiTexts.additionalInfoFormLabel}`} value={serviceData.additionalInfo ?? uiTexts.notAvailable} />
            <Info label={`📂 ${uiTexts.category}`} value={serviceData.category} />
            <Info label={`⏱ ${uiTexts.estimatedDuration}`} value={`${serviceData.duration} ${uiTexts.hours}`} />
            <Info label={`⏳ ${uiTexts.elapsedTime}`} value={`${elapsedTime}`} />
            <Info label={`🧑‍⚕️ ${uiTexts.companionPayment}`} value={`${uiTexts.currency} ${serviceData.companionPayment}`} />
            <Info label={`📌 ${uiTexts.status}`} value={serviceData.status} />
            {
                serviceData.status === statusTexts.in_progress &&
                <Progress.Bar color={colors.franceblue} height={15} indeterminate={true} unfilledColor={colors.gray} width={null} />
            }
        </View>
    );
}

const Info = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.lightGray,
        borderRadius: 12,
        elevation: 2,
        marginBottom: 5,
        padding: 16,
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 8
    },
    infoRow: {
        marginBottom: 12
    },
    infoLabel: {
        color: colors.black,
        fontSize: 16
    },
    infoValue: {
        color: colors.black,
        fontSize: 18,
        fontWeight: '500'
    }
});

export default React.memo(ServiceCard);
