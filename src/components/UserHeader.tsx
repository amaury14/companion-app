import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { useUser } from '../context/UserContext';
import { auth } from '../services/firebase';
import { colors } from '../theme/colors';
import { AppStackParamList } from '../types/stack-param-list';
import { UserData } from '../types/user';
import { uiTexts } from '../utils/data/ui-text-data';

export type UserHeaderProps = {
    userClick: (user: UserData | null) => void;
};

/**
 * Top header component used to show screen title and optional navigation or action icons (like logout).
 */
function UserHeader({ userClick }: UserHeaderProps) {
    const navigation = useNavigation<DrawerNavigationProp<AppStackParamList>>();
    const { user } = useUser();

    const logout = async () => {
        await auth.signOut();
    };

    return (
        <View style={styles.header}>
            <Pressable onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="white" />
            </Pressable>
            <View style={styles.innerHeader}>
                <TouchableOpacity onPress={() => userClick(user)}>
                    <Text style={styles.headerText}>{uiTexts.hello}, {user?.name ?? uiTexts.user}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.exitButton} onPress={logout}>
                    <Text style={styles.exitButtonText}>{uiTexts.logout}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        alignItems: 'center',
        backgroundColor: colors.header,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        padding: 10
    },
    innerHeader: {
        alignItems: 'center',
        backgroundColor: colors.header,
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '92%'
    },
    headerText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10
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
