import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, onSnapshot, query, serverTimestamp, orderBy } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    Pressable,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';

import Layout from '../../components/Layout';
import { useUser } from '../../context/UserContext';
import { db } from '../../services/firebase';
import { colors } from '../../theme/colors';
import { ChatMessage } from '../../types/chatMessage';
import { dbKeys } from '../../utils/keys/db-keys';
import { uiTexts } from '../../utils/data/ui-text-data';

type Props = {
    route: { params: { chatId: string } };
};

const ChatScreen = ({ route }: Props) => {
    const { chatId } = route.params;
    const { user } = useUser();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        const messagesRef = collection(db, dbKeys.chatRooms, chatId, dbKeys.messages);
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, snapshot => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            })) as ChatMessage[];

            setMessages(data);
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        });

        return unsubscribe;
    }, [chatId]);

    const sendMessage = async () => {
        if (!text.trim()) return;

        await addDoc(collection(db, dbKeys.chatRooms, chatId, dbKeys.messages), {
            senderId: user?.id,
            text: text.trim(),
            createdAt: serverTimestamp(),
        });
        setText('');
    };

    const renderItem = ({ item }: { item: ChatMessage }) => {
        const isMe = item.senderId === user?.id;
        return (
            <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        );
    };

    return (
        <Layout>
        <KeyboardAvoidingView
            style={styles.wrapper}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={80}
        >
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                ref={flatListRef}
                contentContainerStyle={styles.messages}
            />

            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder={uiTexts.typeMessage}
                    multiline={true}
                    value={text}
                    onChangeText={setText}
                />
                <Pressable onPress={sendMessage} style={styles.sendButton}>
                    <MaterialIcons name="send" size={22} color={colors.white} />
                </Pressable>
            </View>
        </KeyboardAvoidingView>
        </Layout>
    );
};

export default ChatScreen;

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: colors.argentinianblue,
        flex: 1
    },
    messages: {
        padding: 12,
        paddingBottom: 80
    },
    inputRow: {
        backgroundColor: colors.lightGray,
        borderColor: colors.darkergray,
        borderTopWidth: 1,
        flexDirection: 'row',
        padding: 15
    },
    input: {
        backgroundColor: colors.white,
        borderColor: colors.gray,
        borderRadius: 8,
        borderWidth: 1,
        flex: 1,
        fontSize: 18,
        paddingHorizontal: 15
    },
    sendButton: {
        backgroundColor: colors.franceblue,
        borderRadius: 8,
        height: 35,
        marginLeft: 8,
        justifyContent: 'center',
        paddingHorizontal: 16
    },
    sendButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600'
    },
    messageContainer: {
        borderRadius: 10,
        marginBottom: 10,
        maxWidth: '75%',
        padding: 10
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.mymessage
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: colors.theirmessage
    },
    messageText: {
        color: colors.black,
        fontSize: 17
    }
});
