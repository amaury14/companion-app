import { Timestamp } from 'firebase/firestore';

export type Claim = {
    companionId: string;
    createdAt: Timestamp;
    description: string;
    id: string;
    imageUrl?: string;
    reason: string;
    response?: string; // Field to show response from the system
    serviceId: string;
    status: 'open' | 'resolved' | 'rejected';
    userId: string;
};
