import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import { auth, db } from '../../services/firebase';

type Props = NativeStackScreenProps<UserStackParamList, 'UserHome'>;

export default function UserHomeScreen({ navigation }: Props) {
    const [name, setName] = useState<string>('');

    useEffect(() => {
        const fetchUserData = async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;

            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                setName(userData?.name || '');
            }
        };

        fetchUserData();
    }, []);

    const handleCreateService = () => {
        navigation.navigate('CreateService');
    };

    const logout = () => {
        auth.signOut();
    };

    return (
        <View style={styles.container}>
            <Button title="Salir" onPress={logout} />
            <Text style={styles.title}>¡Hola {name || 'Usuario'}!</Text>
            <Button title="Solicitar nuevo servicio" onPress={handleCreateService} />
            {/* Acá después podemos listar los servicios activos */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        marginBottom: 30,
    },
});
