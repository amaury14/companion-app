import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

export type HeaderProps = {
    title: string;
};

/**
 * Top header component used to show screen title.
 */
function Header({ title }: HeaderProps) {

    return (
        <View style={styles.header}>
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
        justifyContent: 'space-between',
        padding: 10
    },
    headerText: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold'
    }
});

export default React.memo(Header);
