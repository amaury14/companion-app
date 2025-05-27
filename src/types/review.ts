import { Timestamp } from 'firebase/firestore';

export type Review = {
    comment: string;
    createdAt: Timestamp;
    id: string;
    rating: number;
    reviewedUserId: string;
    reviewerId: string;
    serviceId: string;
};
