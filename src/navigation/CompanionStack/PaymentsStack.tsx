import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PaymentsHomeScreen from '../../screens/Companion/PaymentsHomeScreen';
import { UserProfileCard } from '../../screens/Shared/UserProfileCard';
import ViewServiceScreen from '../../screens/Shared/ViewServiceScreen';
import { AppStackParamList } from '../../types/stack-param-list';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Stack navigator for screens available to authenticated companions for payments.
 */
export default function PaymentsStack() {
    return (
        <Stack.Navigator initialRouteName="PaymentsHome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="PaymentsHome" component={PaymentsHomeScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileCard} />
            <Stack.Screen name="ViewService" component={ViewServiceScreen} />
        </Stack.Navigator>
    );
}
