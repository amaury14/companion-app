import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { Review } from '../types/review';
import ReviewStars from './ReviewStars';
import React from 'react';

export type ReviewStarsProps = {
    item: Review;
};

/**
 * Simple review item component to render on a list.
 */
function ReviewItem({ item }: ReviewStarsProps) {
    return (
        <View style={styles.reviewItem}>
            <View style={styles.starsRow}>
                <ReviewStars
                    length={5}
                    rating={item.rating}
                ></ReviewStars>
            </View>
            {item.comment && <Text style={styles.reviewText}>{item.comment}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    reviewItem: {
        backgroundColor: colors.gray,
        borderColor: colors.azureblue,
        borderRadius: 8,
        borderWidth: 2,
        padding: 2
    },
    starsRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    reviewText: {
        color: colors.black,
        fontSize: 16,
        marginTop: 2
    }
});

export default React.memo(ReviewItem);
