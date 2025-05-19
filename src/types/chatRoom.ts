import { Timestamp } from 'firebase/firestore';

export type ChatRoom = {
    createdAt: Timestamp;
    id: string;
    participants: string[]; // [userId, companionId]
    serviceId: string;
}
