import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable } from 'react-native';

import { colors } from '../theme/colors';

export type ReviewStarsProps = {
    length: number;
    rating: number;
    setRating?: (rating: number) => void;
};

/**
 * Simple review starts component to set rating for a service.
 */
function ReviewStars({ length, rating, setRating }: ReviewStarsProps) {
    return Array.from({ length }, (_, i) => (
        <Pressable key={i} onPress={() => setRating?.(i + 1)}>
            <Ionicons
                color={i < rating ? colors.star : colors.gray}
                name={i < rating ? 'star' : 'star-outline'}
                size={32}
            />
        </Pressable>
    ));
}

export default React.memo(ReviewStars);
