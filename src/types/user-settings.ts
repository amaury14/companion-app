export type UserSettings = {
    autoStartTracking: boolean;
    enableLocationTracking: boolean;
    notifyBeforeMinutes: number;
    language?: 'es' | 'en';
    radiusKm: number;
    theme: 'default';
};

