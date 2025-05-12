import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CompanionHomeScreen from '../../screens/Companion/CompanionHomeScreen';
// import ActiveServiceScreen from '../../screens/Companion/ActiveServiceScreen';
// import ServiceTrackingScreen from '../../screens/Shared/ServiceTrackingScreen';

export type CompanionStackParamList = {
    ActiveService: { serviceId: string };
    CompanionHome: undefined;
    ServiceTracking: { serviceId: string };
    UserProfile: { userId: string };
};

const Stack = createNativeStackNavigator<CompanionStackParamList>();

export default function CompanionStack() {
    return (
        <Stack.Navigator initialRouteName="CompanionHome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CompanionHome" component={CompanionHomeScreen} />
        </Stack.Navigator>
        //     <Stack.Screen name="ActiveService" component={ActiveServiceScreen} />
        //     <Stack.Screen name="ServiceTracking" component={ServiceTrackingScreen} />
    );
}
