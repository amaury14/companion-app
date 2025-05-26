import * as Notifications from 'expo-notifications';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { UserProvider } from './src/context/UserContext';
import AuthStack from './src/navigation/AuthStack/AuthStack';
import CompanionDrawer from './src/navigation/CompanionDrawer/CompanionDrawer';
import UserDrawer from './src/navigation/UserDrawer/UserDrawer';
import { auth, db } from './src/services/firebase';
import { Service } from './src/types/service';
import { AppStackParamList } from './src/types/stack-param-list';
import { dbKeys } from './src/utils/keys/db-keys';
import { requestNotificationPermissions } from './src/utils/notifications';

/**
 * App.tsx
 * 
 * This is the root of the React Native application.
 * It handles:
 * - Global context setup (`UserProvider`)
 * - Navigation container and conditional routing
 * - Safe area handling for proper UI display across devices
 * 
 * Routing logic:
 * - If the user is authenticated and has a `type` of 'user', loads `UserStack`
 * - If the user is authenticated and has a `type` of 'companion', loads `CompanionStack`
 * - If the user is unauthenticated or user type is null, loads `AuthStack`
 * 
 * Dependencies:
 * - Firebase Auth and Firestore are initialized via context
 * - Uses `react-navigation` for screen management
 * - Uses `react-native-safe-area-context` for layout safety
 */
export default function App() {
    const [initializing, setInitializing] = useState(true);
    const [userType, setUserType] = useState<null | 'user' | 'companion'>(null);

    const navigationRef = useNavigationContainerRef<AppStackParamList>();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = await getDoc(doc(db, dbKeys.users, user.uid));
                const type = userDoc.data()?.type ?? 'user';
                setUserType(type);
            } else {
                setUserType(null);
            }

            if (initializing) setInitializing(false);
        });

        return unsubscribe;
    }, [initializing]);

    useEffect(() => {
        requestNotificationPermissions();

        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const service = response?.notification?.request?.content?.data as Service;

            if (service?.id) {
                navigationRef?.navigate(userType === 'user' ? 'UserHome' : 'CompanionHome');
            }
        });

        return () => {
            subscription.remove();
        };
    }, [userType, navigationRef]);

    if (initializing) return null;

    return (
        <UserProvider>
            <SafeAreaProvider>
                <NavigationContainer ref={navigationRef}>
                    {userType === 'user' && <UserDrawer />}
                    {userType === 'companion' && <CompanionDrawer />}
                    {userType === null && <AuthStack />}
                </NavigationContainer>
            </SafeAreaProvider>
        </UserProvider>
    );
}
