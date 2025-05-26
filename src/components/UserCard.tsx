import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../theme/colors';
import { Review } from '../types/review';
import { UserData } from '../types/user';
import { uiTexts } from '../utils/data/ui-text-data';
import ReviewItem from './ReviewItem';

export type UserCardProps = {
    reputationScore: number;
    reviews: Review[];
    showMoreInfo: boolean;
    showLocation: boolean;
    userData: UserData | null;
    viewMoreInfo?: (userData: UserData | null) => void;
};

/**
 * Reusable card component for displaying all information regarding a user.
 */
function UserCard({ reputationScore, reviews, showMoreInfo, showLocation, userData, viewMoreInfo }: UserCardProps) {

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.name}>{userData?.name}</Text>
                {userData?.verified && <MaterialIcons name="verified" size={20} color={colors.success} />}
            </View>

            <Text style={styles.typeText}>
                {userData?.type === 'companion' ? uiTexts.companion : uiTexts.user}
            </Text>

            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <FontAwesome name="check-circle" size={16} color={colors.primary} />
                    <Text style={styles.statText}>{userData?.completedServices} {userData?.type === 'companion' ? uiTexts.completedServices : uiTexts.receivedServices}</Text>
                </View>
                {
                    reputationScore > 0 &&
                    <View style={styles.statItem}>
                        <FontAwesome name="star" size={16} color={colors.yellow} />
                        <Text style={styles.statText}>{reputationScore.toFixed(1)} {uiTexts.reputation}</Text>
                    </View>
                }
            </View>

            <View style={styles.infoBlock}>
                <Text style={styles.label}>📧 {uiTexts.email}:</Text>
                <Text style={styles.value}>{userData?.email}</Text>
            </View>

            {
                showLocation && userData?.address &&
                <View style={styles.infoBlock}>
                    <Text style={styles.label}>📍 {uiTexts.location}:</Text>
                    <Text style={styles.value}>{userData?.locationText}</Text>
                </View>
            }

            {
                reviews?.length > 0 &&
                <View style={styles.reviewContent}>
                    <Text style={styles.subTitle}>{uiTexts.previousReviews}</Text>
                    <FlatList
                        data={reviews}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <ReviewItem item={item}></ReviewItem>
                        )}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    />
                </View>
            }

            {
                showMoreInfo &&
                <TouchableOpacity style={styles.infoButton} onPress={() => {
                    if (userData?.id) viewMoreInfo?.(userData);
                }}>
                    <MaterialIcons name="info-outline" size={25} color={colors.black} />
                </TouchableOpacity>
            }
        </View>
    );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.lightGray,
        borderRadius: 12,
        elevation: 2,
        height: 'auto',
        marginBottom: 5,
        shadowColor: colors.black,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        padding: 15
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 4
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginRight: 8
    },
    typeText: {
        color: colors.darkergray,
        fontSize: 19,
        marginBottom: 12
    },
    statsContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    statItem: {
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 10
    },
    statText: {
        color: colors.black,
        fontSize: 19,
        marginLeft: 6
    },
    infoBlock: {
        marginBottom: 8
    },
    label: {
        color: colors.darkergray,
        fontSize: 19,
        fontWeight: '600'
    },
    value: {
        color: colors.black,
        fontSize: 18
    },
    subTitle: {
        color: colors.black,
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 12
    },
    reviewContent: { height: height - 400 },
    infoButton: {
        marginTop: 6
    }
});

export default React.memo(UserCard);
