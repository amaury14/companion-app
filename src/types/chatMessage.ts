import { Timestamp } from 'firebase/firestore';

export type ChatMessage = {
    createdAt: Timestamp | Date;
    id: string;
    senderId: string;
    text: string;
};
