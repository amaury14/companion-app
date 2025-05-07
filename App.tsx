import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { UserProvider } from './src/context/UserContext';
import AuthStack from './src/navigation/AuthStack/AuthStack';
import CompanionStack from './src/navigation/CompanionStack/CompanionStack';
import UserStack from './src/navigation/UserStack/UserStack';
import { auth, db } from './src/services/firebase';
import { dbKeys } from './src/utils/keys/db-keys';

export default function App() {
    const [initializing, setInitializing] = useState(true);
    const [userType, setUserType] = useState<null | 'user' | 'companion'>(null);

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
    }, []);

    if (initializing) return null;

    return (
        <UserProvider>
            <SafeAreaProvider>
                <NavigationContainer>
                    {userType === 'user' && <UserStack />}
                    {userType === 'companion' && <CompanionStack />}
                    {userType === null && <AuthStack />}
                </NavigationContainer>
            </SafeAreaProvider>
        </UserProvider>
    );
}
