import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, TouchableOpacity } from 'react-native';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import Layout from '../../components/Layout';
import { AuthStackParamList } from '../../navigation/AuthStack/AuthStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

type RegisterFormData = {
    name: string;
    email: string;
    password: string;
};

export default function RegisterScreen({ navigation }: Props) {
    const { control, handleSubmit } = useForm<RegisterFormData>();
    const [userType, setUserType] = useState<'user' | 'companion' | null>('user');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);

    const onRegister: SubmitHandler<RegisterFormData> = async ({ name, email, password }) => {
        if (!userType) {
            alert('Seleccioná un tipo de usuario');
            return;
        }

        try {
            setError(false);
            setLoading(true);
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
            setError(true);
            alert('Error al registrarse');
        }
        setLoading(false);
    };

    return (
        <Layout>
            <View style={styles.content}>
                <Text style={styles.registerText}>Nombre completo</Text>
                <View style={{ width: '80%' }}>
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, value } }) => (
                            <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} />
                        )}
                    />
                </View>

                <Text style={styles.registerText}>Email</Text>
                <View style={{ width: '80%' }}>
                    <Controller
                        control={control}
                        name="email"
                        render={({ field: { onChange, value } }) => (
                            <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} keyboardType="email-address" />
                        )}
                    />
                </View>

                <Text style={styles.registerText}>Contraseña</Text>
                <View style={{ width: '80%' }}>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <TextInput style={{ borderBottomWidth: 1 }} value={value} onChangeText={onChange} secureTextEntry />
                        )}
                    />
                </View>

                <Text style={styles.registerText}>Tipo de usuario</Text>
                <View style={styles.accountType}>
                    <TouchableOpacity onPress={() => setUserType('user')}>
                        <Text style={{
                            backgroundColor: userType === 'user' ? colors.argentinianblue : colors.white,
                            fontSize: 20,
                            fontWeight: userType === 'user' ? 'bold' : 'normal',
                            padding: 10,
                            borderRadius: 5
                        }}>🧑 Usuario</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setUserType('companion')}>
                        <Text style={{
                            backgroundColor: userType === 'companion' ? colors.argentinianblue : colors.white,
                            fontSize: 20,
                            fontWeight: userType === 'companion' ? 'bold' : 'normal',
                            padding: 10,
                            borderRadius: 5
                        }}>🤝 Acompañante</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSubmit(onRegister)}>
                    <Text style={styles.buttonText}>REGÍSTRAME</Text>
                </TouchableOpacity>
                {loading && <Text style={styles.actionsText}>Cargando...</Text>}
                {error && <Text style={styles.actionsText}>Error al registrarse. Intente nuevamente.</Text>}
                <Text onPress={() => navigation.navigate('Login')} style={styles.registerText}>
                    ¿Ya tenés cuenta? Iniciá sesión
                </Text>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    content: {
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        padding: 20,
        width: '100%'
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.header,
        borderRadius: 8,
        marginTop: 20,
        paddingHorizontal: 24,
        paddingVertical: 12
    },
    buttonText: {
        color: colors.white,
        fontSize: 22,
        fontWeight: 'bold'
    },
    registerText: {
        color: colors.black,
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20
    },
    accountType: {
        flexDirection: 'row',
        marginVertical: 10,
        justifyContent: 'space-around',
        width: '80%'
    },
    actionsText: {
        color: colors.darkergray,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20
    }
});
