import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { ClaimReason } from '../../types/claim-reason';
import { AppStackParamList } from '../../types/stack-param-list';
import { claimReasons } from '../../utils/data/claim-reason-data';
import { uiTexts } from '../../utils/data/ui-text-data';
import { dbKeys } from '../../utils/keys/db-keys';
import { statusKeys } from '../../utils/keys/status-keys';
import { claimKeys } from '../../utils/keys/claim-keys';

type Props = NativeStackScreenProps<AppStackParamList, 'OpenClaim'>;

/**
 * Open claim component to create a new claim bound to a service with issues
 */
export default function OpenClaimScreen({ navigation }: Props) {
    const route = useRoute<RouteProp<AppStackParamList, 'OpenClaim'>>();
    const { service } = route.params;
    const { user } = useUser();

    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const submitClaim = async () => {
        if (!reason || !description) {
            return Alert.alert(uiTexts.fillAllFields);
        }

        try {
            setLoading(true);
            await addDoc(collection(db, dbKeys.claims), {
                serviceId: service.id,
                userId: user?.id,
                companionId: service.companionId,
                reason,
                description,
                status: claimKeys.open,
                createdAt: serverTimestamp(),
                deletedDate: null
            });

            await updateDoc(doc(db, dbKeys.services, service.id), { status: statusKeys.conflicts });

            Alert.alert(uiTexts.claimSent, uiTexts.wellBeInTouch);
            navigation.goBack();
        } catch (err) {
            console.error(err);
            Alert.alert(uiTexts.error, uiTexts.claimNotSent);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Header title={uiTexts.openClaim}></Header>
            <View style={styles.container}>
                <Text style={styles.label}>{uiTexts.claimMotive}</Text>
                <View style={{ width: '100%' }}>
                    <SelectDropdown
                        data={claimReasons}
                        dropdownStyle={styles.dropdown}
                        onSelect={(selected) => setReason(selected)}
                        renderButton={(selectedItem: ClaimReason) => {
                            return (
                                <View style={styles.dropdownButtonStyle}>
                                    <Text style={styles.dropdownButtonTxtStyle}>
                                        {(selectedItem && selectedItem.name) || uiTexts.selectCategory}
                                    </Text>
                                </View>
                            );
                        }}
                        renderItem={(item: ClaimReason) => {
                            return (
                                <View style={styles.dropdownItemStyle}>
                                    <Text style={styles.dropdownItemTxtStyle}>{item.name}</Text>
                                </View>
                            );
                        }}
                        showsVerticalScrollIndicator={false}
                    />
                </View>

                <Text style={styles.label}>{uiTexts.description}</Text>
                <TextInput
                    multiline
                    value={description}
                    onChangeText={setDescription}
                    placeholder={uiTexts.describeWhatHappened}
                    style={styles.textArea}
                />

                <Pressable style={styles.button} onPress={submitClaim} disabled={loading}>
                    <Text style={styles.buttonText}>{loading ? uiTexts.sending : uiTexts.sendClaim}</Text>
                </Pressable>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    label: {
        color: colors.black,
        fontSize: 20,
        fontWeight: 'bold'
    },
    dropdownButtonStyle: {
        alignItems: 'center',
        flexDirection: 'row',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 0,
        width: '100%'
    },
    dropdownButtonTxtStyle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '500'
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
        color: colors.darkergray,
        flex: 1,
        fontSize: 16,
        fontWeight: '500'
    },
    dropdown: {
        borderRadius: 8
    },
    dropdownText: {
        color: colors.black,
        fontSize: 16
    },
    textArea: {
        color: colors.black,
        backgroundColor: colors.gray,
        borderRadius: 10,
        fontSize: 14,
        height: 150,
        padding: 10,
        textAlignVertical: 'top'
    },
    button: {
        backgroundColor: colors.header,
        borderRadius: 10,
        padding: 12,
        marginTop: 20
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    }
});

