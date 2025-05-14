import { Timestamp } from 'firebase/firestore';

export type Service = {
    additionalInfo: string;
    category: string;
    checkInTime?: Timestamp;
    checkOutTime?: Timestamp;
    companionId: string;
    companionPayment: number;
    date: Timestamp;
    dateText?: string;
    duration: number;
    id: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    locationText?: string;
    price: number;
    requesterId: string;
    status: string;
    timeStamp: number;
};
