import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { differenceInHours, differenceInMinutes } from 'date-fns';
import * as Progress from 'react-native-progress';

import { colors } from '../theme/colors';
import { Service } from '../types/service';
import { uiTexts } from '../utils/data/ui-text-data';
import { updateTime } from '../utils/keys/costs-keys';
import { statusTexts } from '../utils/keys/status-keys';

export type ServiceCardProps = {
    serviceData: Service;
};

function ServiceCard({ serviceData }: ServiceCardProps) {

    const getElapsedTime = (checkInTime: Date) => {
        if (checkInTime) {
            const now = new Date();
            const diffHours = differenceInHours(now, checkInTime);
            const diffMin = differenceInMinutes(now, checkInTime);
            return diffMin > 60 ? `${diffHours} ${uiTexts.hours}` : `${diffMin} ${uiTexts.min}`;
        }
        return `0 ${uiTexts.min}`;
    }

    const [elapsedTime, setElapsedTime] = useState<string>(
        serviceData?.checkInTime ? getElapsedTime(serviceData.checkInTime?.toDate()) : `0 ${uiTexts.min}`
    );

    useEffect(() => {
        if (serviceData?.checkInTime) {
            const start = serviceData.checkInTime.toDate();
            const interval = setInterval(() => {
                setElapsedTime(getElapsedTime(start));
            }, updateTime);

            return () => clearInterval(interval);
        }
    }, [serviceData?.checkInTime]);

    return (
        <View style={styles.card}>
            <Info label={`📅 ${uiTexts.date}`} value={serviceData.dateText ?? uiTexts.notAvailable} />
            <Info label={`📍 ${uiTexts.location}`} value={serviceData.locationText ?? uiTexts.notAvailable} />
            <Info label={`💡 ${uiTexts.commentsFormLabel}`} value={serviceData.comments ?? uiTexts.notAvailable} />
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
        marginBottom: 20,
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
