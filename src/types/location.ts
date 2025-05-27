import { Timestamp } from 'firebase/firestore';

export type Location = {
    latitude: number;
    longitude: number;
    updatedAt?: Timestamp;
};
