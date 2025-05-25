import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '../../screens/Chat/ChatScreen';
import { UserProfileCard } from '../../screens/Shared/UserProfileCard';
import ViewServiceScreen from '../../screens/Shared/ViewServiceScreen';
import ServiceTrackingScreen from '../../screens/Tracking/ServiceTrackingScreen';
import CreateServiceScreen from '../../screens/User/CreateServiceScreen';
import UserActiveServiceScreen from '../../screens/User/UserActiveServiceScreen';
import UserHomeScreen from '../../screens/User/UserHomeScreen';
import { AppStackParamList } from '../../types/stack-param-list';

const Stack = createNativeStackNavigator<AppStackParamList>();

/**
 * Stack navigator for screens available to authenticated users.
 */
export default function UserStack() {
    return (
        <Stack.Navigator initialRouteName="UserHome" screenOptions={{ headerShown: false }}>
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            <Stack.Screen name="CreateService" component={CreateServiceScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileCard} />
            <Stack.Screen name="UserActiveService" component={UserActiveServiceScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen} />
            <Stack.Screen name="ServiceTracking" component={ServiceTrackingScreen} />
            <Stack.Screen name="ViewService" component={ViewServiceScreen} />
        </Stack.Navigator>
    );
}
