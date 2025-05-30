import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Pressable, Alert } from 'react-native';
import Slider from '@react-native-community/slider';

import Header from '../../components/Header';
import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { defaultUserSetting } from '../../utils/data/user-settings-data';
import { dbKeys } from '../../utils/keys/db-keys';
import { uiTexts } from '../../utils/data/ui-text-data';

export default function SettingsScreen() {
    const { settings, user } = useUser();
    const [loading, setLoading] = useState(false);

    const [radiusKm, setRadiusKm] = useState(settings?.radiusKm ?? defaultUserSetting.radiusKm);
    const [notifyBeforeMinutes, setNotifyBeforeMinutes] = useState(settings?.notifyBeforeMinutes ?? defaultUserSetting.notifyBeforeMinutes);
    const [enableLocationTracking, setEnableLocationTracking] = useState(settings?.enableLocationTracking ?? defaultUserSetting.enableLocationTracking);
    const [autoStartTracking, setAutoStartTracking] = useState(settings?.autoStartTracking ?? defaultUserSetting.autoStartTracking);
    const [theme] = useState(settings?.theme ?? defaultUserSetting.theme);

    const saveSettings = async () => {
        try {
            setLoading(true);
            const ref = doc(db, dbKeys.users, user!.id, dbKeys.settings, dbKeys.preferences);
            await setDoc(ref, {
                radiusKm,
                notifyBeforeMinutes,
                enableLocationTracking,
                autoStartTracking,
                theme,
                language: defaultUserSetting.language
            });
            Alert.alert(`✅ ${uiTexts.saved}`, uiTexts.settingsUpdated);
        } catch (err) {
            console.error(err);
            Alert.alert(uiTexts.error, uiTexts.couldNotBeSaved);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <Header title={uiTexts.settings}></Header>
            <View style={styles.container}>
                {
                    user?.type === 'companion' &&
                    <>
                        <Text style={styles.label}>📍 {uiTexts.searchRadio} ({radiusKm} {uiTexts.km})</Text>
                        <Slider
                            maximumValue={30}
                            minimumTrackTintColor={colors.white}
                            minimumValue={1}
                            step={1}
                            value={radiusKm}
                            onValueChange={setRadiusKm}
                        />
                        <Text style={styles.label}>⏰ {uiTexts.notifyBefore} ({notifyBeforeMinutes} {uiTexts.minutes})</Text>
                        <Slider
                            maximumValue={120}
                            minimumTrackTintColor={colors.white}
                            minimumValue={5}
                            step={5}
                            value={notifyBeforeMinutes}
                            onValueChange={setNotifyBeforeMinutes}
                        />
                    </>
                }
                <SettingSwitch
                    label={uiTexts.shareLiveLocation}
                    value={enableLocationTracking}
                    onValueChange={setEnableLocationTracking}
                />

                <SettingSwitch
                    label={uiTexts.startTrackingAutomatically}
                    value={autoStartTracking}
                    onValueChange={setAutoStartTracking}
                />

                <Pressable style={styles.saveButton} onPress={saveSettings}>
                    <Text style={styles.saveText}>{loading ? uiTexts.saving : uiTexts.saveChanges}</Text>
                </Pressable>
            </View>
        </Layout >
    );
}

function SettingSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: ((value: boolean) => Promise<void> | void) | null | undefined }) {
    return (
        <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>{label}</Text>
            <Switch value={value} onValueChange={onValueChange} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    loading: {
        marginTop: 20,
        textAlign: 'center'
    },
    label: {
        color: colors.white,
        fontSize: 18,
        marginBottom: 8,
        marginTop: 20
    },
    switchRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 12
    },
    switchLabel: {
        color: colors.white,
        flexShrink: 1,
        fontSize: 18
    },
    saveButton: {
        backgroundColor: colors.header,
        borderRadius: 10,
        marginTop: 30,
        padding: 14
    },
    saveText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center'
    }
});
