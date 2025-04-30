import React from 'react';
import { Text } from 'react-native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import CompanionHomeScreen from '../screens/Companion/CompanionHomeScreen';
// import ActiveServiceScreen from '../screens/Companion/ActiveServiceScreen';
// import ServiceTrackingScreen from '../screens/Shared/ServiceTrackingScreen';

export type CompanionStackParamList = {
    CompanionHome: undefined;
    ActiveService: { serviceId: string };
    ServiceTracking: { serviceId: string };
};

// const Stack = createNativeStackNavigator<CompanionStackParamList>();

export default function CompanionStack() {
    return (
        <Text>Companion Navigation Stack</Text>
        // <Stack.Navigator screenOptions={{ headerShown: false }}>
        //     <Stack.Screen name="CompanionHome" component={CompanionHomeScreen} />
        //     <Stack.Screen name="ActiveService" component={ActiveServiceScreen} />
        //     <Stack.Screen name="ServiceTracking" component={ServiceTrackingScreen} />
        // </Stack.Navigator>
    );
}
