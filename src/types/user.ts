export type UserData = {
    completedServices: number;
    email: string;
    id: string;
    name: string;
    reputationScore: number;
    type: null | 'user' | 'companion' | string;
    verified: boolean;
};
