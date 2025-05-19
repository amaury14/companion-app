import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ChatScreen from '../../screens/Chat/ChatScreen';
import CreateServiceScreen from '../../screens/User/CreateServiceScreen';
import UserActiveServiceScreen from '../../screens/User/UserActiveServiceScreen';
import UserHomeScreen from '../../screens/User/UserHomeScreen';
import { UserProfileCard } from '../../screens/User/UserProfileCard';
import { AppStackParamList } from '../../types/stack-param-list';
// import ServiceTrackingScreen from '../screens/Shared/ServiceTrackingScreen';

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
            {/* <Stack.Screen name="ServiceTracking" component={ServiceTrackingScreen} /> */}
        </Stack.Navigator>
    );
}
