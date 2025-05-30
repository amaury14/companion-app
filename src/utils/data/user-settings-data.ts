import { UserSettings } from '../../types/user-settings';

export const defaultUserSetting: UserSettings = {
    autoStartTracking: true,
    theme: 'default',
    enableLocationTracking: true,
    notifyBeforeMinutes: 30,
    language: 'es',
    radiusKm: 5
};
