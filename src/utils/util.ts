import * as Location from 'expo-location';

import { Service } from '../types/service';
import { uiTexts } from './data/ui-text-data';
import { statusTexts } from './keys/status-keys';

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
