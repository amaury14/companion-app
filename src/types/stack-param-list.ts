import { LatLng } from 'react-native-maps';

import { Service } from './service';

export type AppStackParamList = {
    Chat: { chatId: string };
    ClaimStack: undefined;
    CompanionActiveService: { service: Service; };
    CompanionHome: undefined;
    CompanionStack: undefined;
    CreateService: undefined;
    Login: undefined;
    LoginEmail: undefined;
    OpenClaim: { service: Service; };
    PaymentsHome: undefined;
    PaymentsStack: undefined;
    Register: undefined;
    ServiceTracking: { serviceId: string; destination: LatLng; };
    UserActiveService: { service: Service; };
    UserHome: undefined;
    UserStack: undefined;
    UserProfile: { userId: string; };
    ViewClaims: undefined;
    ViewService: { serviceId: string; };
};
