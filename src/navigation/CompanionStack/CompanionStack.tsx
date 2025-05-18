import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CompanionActiveServiceScreen from '../../screens/Companion/CompanionActiveServiceScreen';
import CompanionHomeScreen from '../../screens/Companion/CompanionHomeScreen';
import { UserProfileCard } from '../../screens/User/UserProfileCard';
import { AppStackParamList } from '../../types/stack-param-list';
// import ServiceTrackingScreen from '../../screens/Shared/ServiceTrackingScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Stack navigator for screens available to authenticated companions.
 */
export default function CompanionStack() {
    return (
        <Stack.Navigator initialRouteName="CompanionHome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CompanionHome" component={CompanionHomeScreen} />
            <Stack.Screen name="CompanionActiveService" component={CompanionActiveServiceScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileCard} />
        </Stack.Navigator>
        //     <Stack.Screen name="ServiceTracking" component={ServiceTrackingScreen} />
    );
}
