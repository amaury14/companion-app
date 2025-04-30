import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import { auth } from '../../services/firebase';
import { db } from '../../services/firebase';

type RegisterFormData = {
    name: string;
    email: string;
    password: string;
};

export default function RegisterScreen({ navigation }: any) {
    const { control, handleSubmit } = useForm<RegisterFormData>();
    const [userType, setUserType] = useState<'user' | 'companion' | null>('user');

    const onRegister: SubmitHandler<RegisterFormData> = async ({ name, email, password }) => {
        if (!userType) {
            alert('Seleccioná un tipo de usuario');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;

            await setDoc(doc(db, 'users', uid), {
                name,
                email,
                type: userType,
                verified: false,
                reputationScore: 0,
                completedServices: 0,
            });
        } catch (error) {
            console.error(error);
            alert('Error al registrarse');
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <Text>Nombre completo</Text>
            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} />
                )}
            />

            <Text>Email</Text>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} keyboardType="email-address" />
                )}
            />

            <Text>Contraseña</Text>
            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                    <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} secureTextEntry />
                )}
            />

            <Text style={{ marginTop: 20 }}>Tipo de usuario</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10 }}>
                <TouchableOpacity onPress={() => setUserType('user')}>
                    <Text style={{
                        fontWeight: userType === 'user' ? 'bold' : 'normal',
                        backgroundColor: userType === 'user' ? '#6cb4ee' : 'white',
                        padding: 10,
                        borderRadius: 5
                    }}>🧑 Usuario</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setUserType('companion')}>
                    <Text style={{
                        fontWeight: userType === 'companion' ? 'bold' : 'normal',
                        backgroundColor: userType === 'companion' ? '#6cb4ee' : 'white',
                        padding: 10,
                        borderRadius: 5
                    }}>🤝 Acompañante</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleSubmit(onRegister)}>
                <Text style={styles.buttonText}>REGÍSTRAME</Text>
            </TouchableOpacity>
            <Text onPress={() => navigation.navigate('Login')} style={{ marginTop: 20 }}>
                ¿Ya tenés cuenta? Iniciá sesión
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        backgroundColor: '#246bce',
        borderRadius: 8,
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold'
    }
});
