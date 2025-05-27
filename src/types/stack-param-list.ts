import { LatLng } from 'react-native-maps';

import { Service } from './service';

export type AppStackParamList = {
    Chat: { chatId: string };
    CompanionActiveService: { service: Service; };
    CompanionHome: undefined;
    CreateService: undefined;
    Login: undefined;
    LoginEmail: undefined;
    OpenClaim: { service: Service; };
    Register: undefined;
    ServiceTracking: { serviceId: string; destination: LatLng; };
    UserActiveService: { service: Service; };
    UserHome: undefined;
    UserProfile: { userId: string; };
    ViewClaims: undefined;
    ViewService: { serviceId: string; };
};
