import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ActiveServiceScreen from '../../screens/Companion/ActiveServiceScreen';
import CompanionHomeScreen from '../../screens/Companion/CompanionHomeScreen';
import { UserProfileCard } from '../../screens/User/UserProfileCard';
import { Service } from '../../types/service';
// import ServiceTrackingScreen from '../../screens/Shared/ServiceTrackingScreen';

export type CompanionStackParamList = {
    ActiveService: { service: Service };
    CompanionHome: undefined;
    ServiceTracking: { serviceId: string };
    UserProfile: { userId: string };
};

const Stack = createNativeStackNavigator<CompanionStackParamList>();

export default function CompanionStack() {
    return (
        <Stack.Navigator initialRouteName="CompanionHome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CompanionHome" component={CompanionHomeScreen} />
            <Stack.Screen name="ActiveService" component={ActiveServiceScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileCard} />
        </Stack.Navigator>
        //     <Stack.Screen name="ServiceTracking" component={ServiceTrackingScreen} />
    );
}
