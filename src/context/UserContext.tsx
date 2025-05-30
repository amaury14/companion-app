import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../services/firebase';
import { UserData } from '../types/user';
import { UserSettings } from '../types/user-settings';
import { dbKeys, userKeys } from '../utils/keys/db-keys';
import { defaultUserSetting } from '../utils/data/user-settings-data';

type UserContextType = {
    settings: UserSettings | null;
    user: UserData | null;
};

/**
 * Provides current user data and loading state globally, initialized from Firebase Auth + Firestore.
 */
const UserContext = createContext<UserContextType>({ settings: null, user: null });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const docRef = doc(db, dbKeys.users, firebaseUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const type = (docSnap?.data() as UserData).type ?? userKeys.user;
                    setUser({ id: docSnap.id, type, ...docSnap.data() } as UserData);
                } else {
                    setUser(null);
                }

                const settingsRef = doc(db, dbKeys.users, firebaseUser.uid, dbKeys.settings, dbKeys.preferences);
                const settingsSnap = await getDoc(settingsRef);

                if (settingsSnap.exists()) {
                    setSettings({ ...settingsSnap.data() } as UserSettings);
                } else {
                    setSettings({ ...defaultUserSetting });
                }
            } else {
                setSettings(null);
                setUser(null);
            }
        });
        
        return unsubscribe;
    }, []);

    return (
        <UserContext.Provider value={{ settings, user }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
