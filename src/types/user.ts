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
    type: null | 'user' | 'companion' | string;
    verified: boolean;
};
