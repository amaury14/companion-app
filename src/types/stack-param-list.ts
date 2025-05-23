import { Service } from './service';

export type AppStackParamList = {
    ChatScreen: { chatId: string };
    CompanionActiveService: { service: Service; };
    CompanionHome: undefined;
    CreateService: undefined;
    Login: undefined;
    LoginEmail: undefined;
    Register: undefined;
    ServiceTracking: { serviceId: string; };
    UserActiveService: { service: Service; };
    UserHome: undefined;
    UserProfile: { userId: string; };
};
