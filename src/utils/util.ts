import { addMonths, differenceInMinutes, format, isBefore, isEqual } from 'date-fns';
import { es } from 'date-fns/locale';
import * as Location from 'expo-location';
import { LatLng } from 'react-native-maps';

import { Service } from '../types/service';
import { uiTexts } from './data/ui-text-data';
import { claimKeys } from './keys/claim-keys';
import { statusTexts } from './keys/status-keys';
import { Claim } from '../types/claim';
import { MonthItem } from '../types/month-item';

export const getCosts = (duration: number, basePrice: number, comission: number): number => {
    const baseCost = duration * basePrice;
    return duration ? baseCost + (baseCost * comission) : 0;
}

export const getStatusIcon = (status: string): string => {
    switch (status) {
        case statusTexts.accepted:
            return '🟢';
        case statusTexts.cancelled:
            return '❌';
        case statusTexts.completed:
            return '✅';
        case statusTexts.conflicts:
            return '⚠️';
        case statusTexts.in_progress:
            return '🚶‍♂️';
        case statusTexts.pending:
            return '⏳';
        default:
            return '🗓️';
    }
};

export const sortServices = (services: Service[]): Service[] => {
    if (services?.length) {
        return services.sort((a, b) => {
            if (a.status === statusTexts.pending && b.status !== statusTexts.pending) return -1;
            if (a.status !== statusTexts.pending && b.status === statusTexts.pending) return 1;

            if (a.status === statusTexts.accepted && b.status !== statusTexts.accepted) return -1;
            if (a.status !== statusTexts.accepted && b.status === statusTexts.accepted) return 1;

            if (a.status === statusTexts.in_progress && b.status !== statusTexts.in_progress) return -1;
            if (a.status !== statusTexts.in_progress && b.status === statusTexts.in_progress) return 1;

            return b.timeStamp - a.timeStamp;
        });
    }
    return [];
};

export const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const formatDateWithTime = (date: Date): string =>
    date?.toLocaleString('es-UY', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

export const getAddressFromCoords = async (latitude: number, longitude: number) => {
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

export const getTimeDiffText = (dateA: Date, dateB: Date): string => {
    if (dateA) {
        const totalMinutes = Math.abs(differenceInMinutes(dateA, dateB)); // valor absoluto
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        return `${hours} ${uiTexts.hours} ${minutes} ${uiTexts.min}`;
    }
    return `0 ${uiTexts.min}`;
};

export const areLocationsClose = (
    latlon1: LatLng,
    latlon2: LatLng,
    maxDistanceKm = 1 // default 1km
): boolean => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(latlon2.latitude - latlon1.latitude);
    const dLon = toRad(latlon2.longitude - latlon1.longitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(latlon1.latitude)) *
        Math.cos(toRad(latlon2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= maxDistanceKm;
};

export const sortClaims = (claim: Claim[]): Claim[] => {
    if (claim?.length) {
        return claim.sort((a, b) => {
            if (a.status === claimKeys.open && b.status !== claimKeys.open) return -1;
            if (a.status !== claimKeys.open && b.status === claimKeys.open) return 1;

            if (a.status === claimKeys.resolved && b.status !== claimKeys.resolved) return -1;
            if (a.status !== claimKeys.resolved && b.status === claimKeys.resolved) return 1;

            if (a.status === claimKeys.rejected && b.status !== claimKeys.rejected) return -1;
            if (a.status !== claimKeys.rejected && b.status === claimKeys.rejected) return 1;

            return b.createdAt?.toDate().getMilliseconds() - a.createdAt?.toDate().getMilliseconds();
        });
    }
    return [];
};

export const generateMonthsBetweenDates = (start: Date, end: Date): MonthItem[] => {
    const months: MonthItem[] = [];
    let current = new Date(start);

    while (isBefore(current, end) || isEqual(current, end)) {
        const labelText = format(current, "MMMM - yyyy", { locale: es });
        const isoDate = format(current, "yyyy-MM-01");
        months.push({ label: `${labelText.charAt(0).toUpperCase()}${labelText.slice(1)}`, date: isoDate });
        current = addMonths(current, 1);
    }
    return months.reverse();
};
