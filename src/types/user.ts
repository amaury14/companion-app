import { UserType } from './user-type';

export type UserData = {
    address?: {
        latitude: number;
        longitude: number;
    };
    companionId: string;
    completedServices: number;
    email: string;
    id: string;
    name: string;
    locationText?: string;
    reputationScore: number;
    type: UserType | string;
    verified: boolean;
};
