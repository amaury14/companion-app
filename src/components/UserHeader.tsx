import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useUser } from '../context/UserContext';
import { auth } from '../services/firebase';
import { colors } from '../theme/colors';
import { UserData } from '../types/user';
import { uiTexts } from '../utils/data/ui-text-data';

export type UserHeaderProps = {
    userClick: (user: UserData | null) => void;
};

/**
 * Top header component used to show screen title and optional navigation or action icons (like logout).
 */
function UserHeader({ userClick }: UserHeaderProps) {
    const { user } = useUser();

    const logout = () => {
        auth.signOut();
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => userClick(user)}>
                <Text style={styles.headerText}>{uiTexts.hello}, {user?.name ?? uiTexts.user}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitButton} onPress={logout}>
                <Text style={styles.exitButtonText}>{uiTexts.logout}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        backgroundColor: colors.header,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },
    headerText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold'
    },
    exitButton: {
        alignItems: 'center',
        backgroundColor: colors.azureblue,
        borderRadius: 8,
        marginTop: 0,
        paddingHorizontal: 10,
        paddingVertical: 5
    },
    exitButtonText: {
        color: colors.white,
        fontWeight: 'bold'
    }
});

export default React.memo(UserHeader);
