import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';

import ReviewStars from '../../components/ReviewStars';
import { colors } from '../../theme/colors';
import { db } from '../../services/firebase';
import { dbKeys } from '../../utils/keys/db-keys';
import { uiTexts } from '../../utils/data/ui-text-data';

type Props = {
    reviewerId: string;
    reviewedUserId: string;
    serviceId: string;
    onSuccess?: () => void;
};

/**
 * Review form component to send a review from a service
 */
const ReviewForm = ({ reviewerId, reviewedUserId, serviceId, onSuccess }: Props) => {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (rating === 0) {
            Alert.alert(uiTexts.selectRating);
            return;
        }

        try {
            setLoading(true);
            await addDoc(collection(db, dbKeys.reviews), {
                reviewerId,
                reviewedUserId,
                serviceId,
                rating,
                comment,
                createdAt: serverTimestamp()
            });
            await updateDoc(doc(db, dbKeys.services, serviceId), { reviewed: true });
            Alert.alert(`✅ ${uiTexts.reviewSent}`);
            setRating(0);
            setComment('');
            onSuccess?.();
        } catch (error) {
            console.error(error);
            Alert.alert(uiTexts.errorOnSendReview);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{uiTexts.addReview}</Text>

            <View style={styles.starsRow}>
                <ReviewStars
                    length={5}
                    rating={rating}
                    setRating={(rating) => setRating(rating)}
                ></ReviewStars>
            </View>

            <TextInput
                multiline
                numberOfLines={4}
                placeholder={uiTexts.writeReviewPlaceholder}
                style={styles.textArea}
                textAlignVertical="top"
                value={comment}
                onChangeText={setComment}
            />

            <Pressable style={styles.button} onPress={handleSend} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? uiTexts.sending : uiTexts.sendReview}</Text>
            </Pressable>
        </View>
    );
};

export default ReviewForm;

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        borderRadius: 12,
        elevation: 2,
        padding: 8,
        shadowColor: colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 6
    },
    title: {
        color: colors.black,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12
    },
    starsRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 16
    },
    textArea: {
        backgroundColor: colors.argentinianblue,
        borderColor: colors.gray,
        borderRadius: 8,
        borderWidth: 1,
        color: colors.black,
        fontSize: 16,
        marginBottom: 16,
        minHeight: 100,
        padding: 12
    },
    button: {
        alignItems: 'center',
        backgroundColor: colors.header,
        borderRadius: 10,
        paddingVertical: 12
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600'
    }
});
