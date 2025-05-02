import { Service } from '../types/service';
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

            return b.timeStamp - a.timeStamp;
        });
    }
    return [];
};
