import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { auth, db } from '../services/firebase';
import { UserData } from '../types/user';
import { dbKeys } from '../utils/keys/db-keys';

type UserContextType = {
    user: UserData | null;
};

/**
 * Provides current user data and loading state globally, initialized from Firebase Auth + Firestore.
 */
const UserContext = createContext<UserContextType>({ user: null });

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const docRef = doc(db, dbKeys.users, firebaseUser.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const type = (docSnap?.data() as UserData).type ?? 'user';
                    setUser({ id: docSnap.id, type, ...docSnap.data() } as UserData);
                } else {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        });
        
        return unsubscribe;
    }, []);

    return (
        <UserContext.Provider value={{ user }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
