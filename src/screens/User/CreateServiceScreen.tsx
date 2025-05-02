import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import DatePicker from 'react-native-ui-datepicker';
import SelectDropdown from 'react-native-select-dropdown';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import dayjs from 'dayjs';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

import Layout from '../../components/Layout';
import { UserStackParamList } from '../../navigation/UserStack/UserStack';
import { auth, db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { Category } from '../../types/category';
import { categoryData } from '../../utils/data/category-data';
import { dbKeys } from '../../utils/keys/db-keys';
import { statusKeys } from '../../utils/keys/status-keys';

type FormData = {
    category: Category;
    duration: string;
    location: string;
};

type Props = NativeStackScreenProps<UserStackParamList, 'CreateService'>;

export default function CreateServiceScreen({ navigation }: Props) {
    const { control, handleSubmit } = useForm<FormData>();
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const onSubmit = async (data: FormData) => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const price = parseInt(data.duration) * 200; // ej: 200 UYU por hora

        try {
            setLoading(true);
            await addDoc(collection(db, dbKeys.services), {
                requesterId: uid,
                companionId: '',
                category: data.category.value,
                duration: parseInt(data.duration),
                location: data.location,
                date: Timestamp.fromDate(selectedDate),
                price,
                paid: false,
                status: statusKeys.pending,
                checkInTime: null,
                checkOutTime: null,
                evidenceUrls: [],
            });

            Alert.alert('¡Servicio solicitado!', 'Esperá la confirmación de un acompañante');
            navigation.goBack();
        } catch (err) {
            Alert.alert('Error', 'No se pudo crear el servicio');
            console.error(err);
        }
        setLoading(false);
    };

    return (
        <Layout>
            <View style={styles.container}>
                <Text style={styles.title}>Solicitar nuevo servicio</Text>

                <Text style={styles.inputText}>Categoría (compañía, trámites...)</Text>
                <Controller
                    control={control}
                    name="category"
                    rules={{ required: true }}
                    render={({ field: { onChange } }) => (
                        <View style={{ width: '100%' }}>
                            <SelectDropdown
                                data={categoryData}
                                onSelect={(selectedItem) => {
                                    onChange(selectedItem);
                                }}
                                renderButton={(selectedItem) => {
                                    return (
                                        <View style={styles.dropdownButtonStyle}>
                                            <Text style={styles.dropdownButtonTxtStyle}>
                                                {(selectedItem && selectedItem.name) || 'Seleccione la categoría'}
                                            </Text>
                                        </View>
                                    );
                                }}
                                renderItem={(item) => {
                                    return (
                                        <View style={styles.dropdownItemStyle}>
                                            <Text style={styles.dropdownItemTxtStyle}>{item.name}</Text>
                                        </View>
                                    );
                                }}
                                showsVerticalScrollIndicator={false}
                                dropdownStyle={styles.dropdownMenuStyle}
                            />
                        </View>
                    )}
                />

                <Text style={styles.inputText}>Duración (horas)</Text>
                <Controller
                    control={control}
                    name="duration"
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType="numeric" />
                    )}
                />

                <Text style={styles.inputText}>Ubicación (barrio, dirección)</Text>
                <Controller
                    control={control}
                    name="location"
                    rules={{ required: true }}
                    render={({ field: { onChange, value } }) => (
                        <TextInput style={styles.input} value={value} onChangeText={onChange} />
                    )}
                />

                <Text style={styles.inputText}>Fecha y hora</Text>
                <View style={{ marginVertical: 10 }}>
                    <DatePicker
                        date={selectedDate}
                        initialView="day"
                        minDate={new Date()}
                        mode="single"
                        locale="es"
                        onChange={({ date }) => setSelectedDate(dayjs(date).toDate())}
                        styles={{
                            today: { borderColor: colors.azureblue, borderWidth: 1 },
                            selected: { backgroundColor: colors.argentinianblue },
                            selected_label: { color: 'white' }
                        }}
                    />
                </View>

                <View>
                    <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
                        <Text style={styles.buttonText}>Confirmar y solicitar</Text>
                    </TouchableOpacity>
                    {loading && <Text style={styles.actionsText}>Solicitando...</Text>}
                </View>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    input: {
        borderBottomWidth: 1,
        fontSize: 16,
        marginBottom: 16,
        paddingVertical: 4
    },
    pickerContainer: {
        borderColor: colors.gray,
        borderRadius: 4,
        borderWidth: 1,
        marginBottom: 16
    },
    dropdownButtonStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 0,
        width: '100%',
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500'
    },
    dropdownButtonArrowStyle: {
        fontSize: 28,
    },
    dropdownButtonIconStyle: {
        fontSize: 28,
        marginRight: 8,
    },
    dropdownMenuStyle: {
        borderRadius: 8
    },
    dropdownItemStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        width: '100%'
    },
    dropdownItemTxtStyle: {
        color: '#151E26',
        flex: 1,
        fontSize: 18,
        fontWeight: '500'
    },
    dropdownItemIconStyle: {
        fontSize: 28,
        marginRight: 8
    },
    inputText: {
        color: colors.black,
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 20
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.header,
        borderRadius: 8,
        paddingHorizontal: 24,
        paddingVertical: 12
    },
    buttonText: {
        color: colors.white,
        fontSize: 22,
        fontWeight: 'bold'
    },
    actionsText: {
        color: colors.darkergray,
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20
    }
});
