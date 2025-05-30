import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UserProfileCard } from '../../screens/Shared/UserProfileCard';
import ViewClaimsScreen from '../../screens/Claims/ViewClaimsScreen';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import ViewServiceScreen from '../../screens/Shared/ViewServiceScreen';
import { AppStackParamList } from '../../types/stack-param-list';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Stack navigator for screens available for users and claims.
 */
export default function ClaimStack() {
    return (
        <Stack.Navigator initialRouteName="ViewClaims" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="UserProfile" component={UserProfileCard} />
            <Stack.Screen name="ViewClaims" component={ViewClaimsScreen} />
            <Stack.Screen name="ViewService" component={ViewServiceScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
    );
}
