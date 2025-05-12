// src/navigation/UserStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import UserHomeScreen from '../../screens/User/UserHomeScreen';
import CreateServiceScreen from '../../screens/User/CreateServiceScreen';
import { UserProfileCard } from '../../screens/User/UserProfileCard';
// import ServiceTrackingScreen from '../screens/Shared/ServiceTrackingScreen';

export type UserStackParamList = {
    CreateService: undefined;
    ServiceTracking: { serviceId: string };
    UserHome: undefined;
    UserProfile: { userId: string };
};

const Stack = createNativeStackNavigator<UserStackParamList>();

export default function UserStack() {
    return (
        <Stack.Navigator initialRouteName="UserHome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            <Stack.Screen name="CreateService" component={CreateServiceScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileCard} />
            {/* <Stack.Screen name="ServiceTracking" component={ServiceTrackingScreen} /> */}
        </Stack.Navigator>
    );
}
