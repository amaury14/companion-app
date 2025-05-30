import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useNavigation } from '@react-navigation/native';

import { colors } from '../theme/colors';
import { AppStackParamList } from '../types/stack-param-list';

export type HeaderProps = {
    title: string;
};

/**
 * Top header component used to show screen title.
 */
function Header({ title }: HeaderProps) {
    const navigation = useNavigation<DrawerNavigationProp<AppStackParamList>>();

    return (
        <View style={styles.header}>
            <Pressable onPress={() => navigation.openDrawer()}>
                <Ionicons name="menu" size={28} color="white" />
            </Pressable>
            <Text style={styles.headerText}>{title}</Text>
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
    headerText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10
    }
});

export default React.memo(Header);
