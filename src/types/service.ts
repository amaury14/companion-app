import { Timestamp } from 'firebase/firestore';

import { Location } from './location';

export type Service = {
    additionalInfo: string;
    category: string;
    checkInTime?: Timestamp;
    checkOutTime?: Timestamp;
    confirmed: boolean;
    companionId: string;
    companionPayment: number;
    companionLiveLocation?: Location;
    date: Timestamp;
    dateText?: string;
    duration: number;
    id: string;
    location?: Location;
    locationText?: string;
    price: number;
    requesterId: string;
    requesterLiveLocation?: Location;
    reviewed: boolean;
    status: string;
    timeStamp: number;
};
